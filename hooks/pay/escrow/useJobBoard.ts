"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { parseUnits, keccak256, toHex, decodeEventLog } from "viem";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";

import {
  AGENTIC_COMMERCE_ADDRESS,
  AGENTIC_COMMERCE_ABI,
  ERC20_APPROVE_ABI,
  USDC_ARC_TESTNET,
} from "@/lib/agent/agenticCommerce";

// Helper to report a timing point to the server -- fire-and-forget, doesn't
// block the UI. Whoever's browser triggers this (client OR provider,
// possibly a completely different Chrome profile/device from each other),
// the server ends up with both halves in one place. See lib/agent/jobTiming.ts
// for why this moved off localStorage.
function reportTiming(jobId: bigint, field: "createdAt" | "submittedAt", timestamp: bigint) {
  fetch("/api/agent/record-timing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId: jobId.toString(), field, timestamp: timestamp.toString() }),
  }).catch((error) => console.error("Could not report timing:", error));
}

export type JobActionStatus =
  | "idle"
  | "approving"
  | "submitting-tx"
  | "confirming"
  | "success"
  | "failed";

export function useJob(jobId: bigint) {
  const { data: job, refetch } = useReadContract({
    address: AGENTIC_COMMERCE_ADDRESS,
    abi: AGENTIC_COMMERCE_ABI,
    functionName: "getJob",
    args: [jobId],
  });

  return { job, refetch };
}

const STORAGE_KEY_PREFIX = "arc-agentic-commerce-job-ids:";

// AGENTIC_COMMERCE_ADDRESS is Arc's shared, officially pre-deployed tutorial
// contract — used by every developer following the ERC-8183 tutorial, not
// just this app. jobCounter() on it reflects jobs from everyone, worldwide,
// which can already be in the thousands. Enumerating "all jobs, then filter
// to mine" (whether via eth_getLogs or looping getJob(1..counter)) does not
// scale against that and is what caused the RPC 413/429 errors and the
// never-ending "Loading..." state.
//
// Instead, we track "jobs relevant to this wallet" ourselves, client-side,
// in localStorage:
//   - when THIS wallet creates a job as a client, we record the jobId here
//     the moment it's created (see JobBoard's handlePostJob).
//   - when THIS wallet is a provider on a job, there's no way to discover
//     that automatically without an indexer, so JobBoard exposes a small
//     "Track job by ID" input — the client tells the provider the job
//     number (e.g. over chat) and the provider adds it here once.
// This trades "automatic discovery" for "actually works reliably" — the
// correct long-term fix is a backend/indexer keyed by client+provider
// address, but that's out of scope for a client-only demo app.
function loadStoredJobIds(address: string): bigint[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + address.toLowerCase());
    if (!raw) return [];
    return (JSON.parse(raw) as string[]).map((s) => BigInt(s));
  } catch (error) {
    console.error("Could not read stored job ids:", error);
    return [];
  }
}

function saveStoredJobIds(address: string, ids: bigint[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY_PREFIX + address.toLowerCase(),
      JSON.stringify(ids.map((id) => id.toString()))
    );
  } catch (error) {
    console.error("Could not persist job ids:", error);
  }
}

// Timing storage now lives server-side -- see lib/agent/jobTiming.ts and
// the reportTiming() helper above -- so it works regardless of which
// browser/profile/device the client vs provider each use.

export function useMyJobIds() {
  const { address } = useAccount();
  const [jobIds, setJobIds] = useState<bigint[]>([]);

  const refetch = useCallback(() => {
    if (!address) {
      setJobIds([]);
      return;
    }
    setJobIds(loadStoredJobIds(address).sort((a, b) => (a > b ? -1 : 1)));
  }, [address]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addJobId = useCallback(
    (jobId: bigint) => {
      if (!address) return;
      const current = loadStoredJobIds(address);
      if (current.some((id) => id === jobId)) return; // already tracked
      const updated = [...current, jobId];
      saveStoredJobIds(address, updated);
      setJobIds(updated.sort((a, b) => (a > b ? -1 : 1)));
    },
    [address]
  );

  // loading is always false now — this reads localStorage synchronously,
  // no RPC round trip involved. Kept in the return shape so JobBoard.tsx
  // doesn't need to change how it consumes this hook.
  return { jobIds, loading: false, refetch, addJobId };
}

const SET_BUDGET_MAX_ATTEMPTS = 3;
const SET_BUDGET_RETRY_DELAY_MS = 1500;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useJobBoard() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [status, setStatus] = useState<JobActionStatus>("idle");

  async function createJob(
    provider: `0x${string}`,
    description: string,
    // Defaults: no custom evaluator (self), no custom hook (zero address),
    // expires in 30 days. Override these if the job needs something else —
    // TODO: surface evaluator/hook/expiredAt as real UI inputs later.
    options?: {
      evaluator?: `0x${string}`;
      hook?: `0x${string}`;
      expiresInSeconds?: number;
    }
  ) {
    if (!address) {
      toast.error("Connect your wallet first");
      return null;
    }
    try {
      setStatus("submitting-tx");
      const evaluator = options?.evaluator ?? address;
      const hook =
        options?.hook ?? "0x0000000000000000000000000000000000000000";
      const expiredAt = BigInt(
        Math.floor(Date.now() / 1000) + (options?.expiresInSeconds ?? 30 * 24 * 60 * 60)
      );
      const hash = await writeContractAsync({
        address: AGENTIC_COMMERCE_ADDRESS,
        abi: AGENTIC_COMMERCE_ABI,
        functionName: "createJob",
        args: [provider, evaluator, expiredAt, description, hook],
      });
      setStatus("confirming");
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      setStatus("success");
      toast.success("Job posted");

      // Decode the real jobId from the JobCreated log (verified against a real
      // tx's decoded log on the explorer — see agenticCommerce.ts header note).
      let jobId: bigint | null = null;
      const log = receipt?.logs.find(
        (l) => l.address.toLowerCase() === AGENTIC_COMMERCE_ADDRESS.toLowerCase()
      );
      if (log) {
        try {
          const decoded = decodeEventLog({
            abi: AGENTIC_COMMERCE_ABI,
            eventName: "JobCreated",
            topics: log.topics,
            data: log.data,
          });
          jobId = (decoded.args as { jobId: bigint }).jobId;

          // Capture the timing NOW, from the block this tx actually landed
          // in -- this is what lets the Speed Bonus Agent work later
          // without ever needing to search old logs.
          if (address && receipt?.blockNumber) {
            const block = await publicClient?.getBlock({ blockNumber: receipt.blockNumber });
            if (block) {
              reportTiming(jobId, "createdAt", block.timestamp);
            }
          }
        } catch (decodeError) {
          console.error("Could not decode JobCreated log — verify event ABI on explorer:", decodeError);
        }
      }
      return { hash, jobId };
    } catch (error) {
      console.error(error);
      setStatus("failed");
      toast.error("Could not create job");
      return null;
    } finally {
      setStatus("idle");
    }
  }

  async function setBudget(jobId: bigint, amountUsdc: string) {
    try {
      setStatus("submitting-tx");
      const amount = parseUnits(amountUsdc, 6); // USDC = 6 decimals
      const hash = await writeContractAsync({
        address: AGENTIC_COMMERCE_ADDRESS,
        abi: AGENTIC_COMMERCE_ABI,
        functionName: "setBudget",
        args: [jobId, amount, "0x"],
      });
      setStatus("confirming");
      await publicClient?.waitForTransactionReceipt({ hash });
      setStatus("success");
      return hash;
    } catch (error) {
      console.error(error);
      setStatus("failed");
      toast.error("Could not set budget");
      return null;
    } finally {
      setStatus("idle");
    }
  }

  // Same as setBudget, but silently retries a couple of times before giving
  // up — covers transient failures (wallet popup timing, RPC hiccup, etc.)
  // so the "⚠️ Set Budget" fallback box in JobBoard only shows up for
  // genuine failures (rejected tx, insufficient funds), not flaky ones.
  async function setBudgetWithRetry(
    jobId: bigint,
    amountUsdc: string,
    maxAttempts: number = SET_BUDGET_MAX_ATTEMPTS
  ) {
    let lastError: unknown = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const amount = parseUnits(amountUsdc, 6);
        setStatus(attempt === 1 ? "submitting-tx" : "approving");
        const hash = await writeContractAsync({
          address: AGENTIC_COMMERCE_ADDRESS,
          abi: AGENTIC_COMMERCE_ABI,
          functionName: "setBudget",
          args: [jobId, amount, "0x"],
        });
        setStatus("confirming");
        await publicClient?.waitForTransactionReceipt({ hash });
        setStatus("success");
        return hash;
      } catch (error) {
        lastError = error;
        console.error(`setBudget attempt ${attempt}/${maxAttempts} failed:`, error);
        if (attempt < maxAttempts) {
          await wait(SET_BUDGET_RETRY_DELAY_MS * attempt);
        }
      } finally {
        setStatus("idle");
      }
    }
    console.error("setBudget failed after all retries:", lastError);
    return null;
  }

  // approve + fund in one call — mirrors the "estimate -> execute" feel of useSend
  async function fundJob(jobId: bigint, amountUsdc: string) {
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }
    try {
      const amount = parseUnits(amountUsdc, 6);

      setStatus("approving");
      const approveHash = await writeContractAsync({
        address: USDC_ARC_TESTNET,
        abi: ERC20_APPROVE_ABI,
        functionName: "approve",
        args: [AGENTIC_COMMERCE_ADDRESS, amount],
      });
      await publicClient?.waitForTransactionReceipt({ hash: approveHash });

      setStatus("submitting-tx");
      const fundHash = await writeContractAsync({
        address: AGENTIC_COMMERCE_ADDRESS,
        abi: AGENTIC_COMMERCE_ABI,
        functionName: "fund",
        args: [jobId, "0x"],
      });

      setStatus("confirming");
      await publicClient?.waitForTransactionReceipt({ hash: fundHash });

      setStatus("success");
      toast.success("Job funded — USDC escrowed 🔒");
    } catch (error) {
      console.error(error);
      setStatus("failed");
      toast.error("Funding failed");
    } finally {
      setStatus("idle");
    }
  }

  async function submitDeliverable(jobId: bigint, deliverableURI: string) {
    try {
      setStatus("submitting-tx");
      // Contract stores a bytes32 commitment, not the raw URI -- hash it here.
      // TODO: also persist the plaintext deliverableURI somewhere off-chain
      // (DB/IPFS pin record) so it can be looked up later from this hash.
      const deliverable = keccak256(toHex(deliverableURI));
      const hash = await writeContractAsync({
        address: AGENTIC_COMMERCE_ADDRESS,
        abi: AGENTIC_COMMERCE_ABI,
        functionName: "submit",
        args: [jobId, deliverable, "0x"],
      });
      setStatus("confirming");
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      setStatus("success");
      toast.success("Deliverable submitted");

      if (address && receipt?.blockNumber) {
        const block = await publicClient?.getBlock({ blockNumber: receipt.blockNumber });
        if (block) {
          reportTiming(jobId, "submittedAt", block.timestamp);
        }
      }
    } catch (error) {
      console.error(error);
      setStatus("failed");
      toast.error("Submit failed");
    } finally {
      setStatus("idle");
    }
  }

  async function completeJob(jobId: bigint, reason: string = "approved") {
    try {
      setStatus("submitting-tx");
      const reasonBytes32 = keccak256(toHex(reason));
      const hash = await writeContractAsync({
        address: AGENTIC_COMMERCE_ADDRESS,
        abi: AGENTIC_COMMERCE_ABI,
        functionName: "complete",
        args: [jobId, reasonBytes32, "0x"],
      });
      setStatus("confirming");
      await publicClient?.waitForTransactionReceipt({ hash });
      setStatus("success");
      toast.success("Job completed — USDC released ✅");

      // Speed Bonus Agent: check THIS job only (we already know its ID here
      // — no scanning the shared contract). Timing (createdAt/submittedAt)
      // is now looked up server-side by jobId (see lib/agent/jobTiming.ts) —
      // this hook no longer needs to read/pass it, since it may not even
      // have both halves locally (the other half could've been recorded
      // from the OTHER party's browser). Fire-and-forget.
      fetch("/api/agent/check-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: jobId.toString() }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.paid) {
            toast.success(
              `🎉 Speed bonus: +${(Number(data.amount) / 1e6).toFixed(2)} USDC — ${data.reason}`
            );
          }
        })
        .catch((error) => console.error("Speed bonus check failed:", error));
    } catch (error) {
      console.error(error);
      setStatus("failed");
      toast.error("Completion failed");
    } finally {
      setStatus("idle");
    }
  }

  return {
    status,
    createJob,
    setBudget,
    setBudgetWithRetry,
    fundJob,
    submitDeliverable,
    completeJob,
  };
}