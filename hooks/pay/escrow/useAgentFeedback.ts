"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { keccak256, toHex } from "viem";
import { useAccount, useWriteContract, usePublicClient, useReadContract } from "wagmi";

import {
  IDENTITY_REGISTRY_ADDRESS,
  IDENTITY_REGISTRY_ABI,
  REPUTATION_REGISTRY_ADDRESS,
  REPUTATION_REGISTRY_ABI,
} from "@/lib/agent/agenticCommerce";

export type FeedbackStatus =
  | "idle"
  | "submitting-tx"
  | "confirming"
  | "success"
  | "failed";

// Generic defaults for fields the real giveFeedback() requires but this
// app's UI doesn't have inputs for yet (tags/endpoint/off-chain URI). See
// agenticCommerce.ts's REPUTATION_REGISTRY_ABI comment for the full story
// on why these exist at all -- this app just wants "one overall score",
// same as before, so we fill these with fixed, generic values rather than
// exposing them as new UI.
const FEEDBACK_TAG1 = "quality";
const FEEDBACK_TAG2 = "";
const FEEDBACK_ENDPOINT = "arcora-escrow";

// FIXED: this hook used to read agentIdOf(providerAddress) on IdentityRegistry
// to both (a) check whether the provider has an identity, and (b) get the
// numeric agentId giveFeedback() needs. That function never existed on the
// real contract (see agenticCommerce.ts's IDENTITY_REGISTRY_ABI comment).
//
// Fix: (a) now checked via balanceOf(providerAddress) > 0, which IS real
// ERC-721 and confirmed present on the explorer. (b) has no onchain
// equivalent at all -- fetched from our own provider directory (Redis)
// instead, same source useAgentIdentity.ts and speedBonusAgent.ts now use.
export function useAgentFeedback(providerAddress?: `0x${string}`) {
  const { address: clientAddress } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [status, setStatus] = useState<FeedbackStatus>("idle");
  const [providerAgentId, setProviderAgentId] = useState<bigint | undefined>(
    undefined
  );

  const { data: balance } = useReadContract({
    address: IDENTITY_REGISTRY_ADDRESS,
    abi: IDENTITY_REGISTRY_ABI,
    functionName: "balanceOf",
    args: providerAddress ? [providerAddress] : undefined,
    query: { enabled: !!providerAddress },
  });

  const hasIdentity = !!balance && (balance as bigint) > 0n;

  useEffect(() => {
    if (!hasIdentity || !providerAddress) {
      setProviderAgentId(undefined);
      return;
    }

    fetch(`/api/agent/directory/lookup?address=${providerAddress.toLowerCase()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.entry) {
          setProviderAgentId(BigInt(data.entry.agentId));
        } else {
          setProviderAgentId(undefined);
        }
      })
      .catch((error) => {
        console.error("Could not look up provider agentId:", error);
        setProviderAgentId(undefined);
      });
  }, [hasIdentity, providerAddress]);

  async function giveFeedback(score: number, context: string) {
    if (!hasIdentity) {
      toast.error("This provider hasn't registered an onchain identity yet");
      return null;
    }
    if (providerAgentId === undefined) {
      toast.error(
        "This provider owns an identity NFT, but isn't in our directory yet — feedback needs their agentId, which we can't look up onchain"
      );
      return null;
    }
    if (score < 0 || score > 100) {
      toast.error("Score must be between 0 and 100");
      return null;
    }

    try {
      setStatus("submitting-tx");

      // FIXED: giveFeedback actually takes 8 params, not 3. `score` maps to
      // `value` as a whole-number fixed-point value (valueDecimals = 0, so
      // value=95 reads back as "95"). feedbackHash commits to `context` the
      // same way completeJob()/submitDeliverable() already hash their own
      // reason/deliverable strings elsewhere in this app.
      const hash = await writeContractAsync({
        address: REPUTATION_REGISTRY_ADDRESS,
        abi: REPUTATION_REGISTRY_ABI,
        functionName: "giveFeedback",
        args: [
          providerAgentId,
          BigInt(Math.round(score)),
          0,
          FEEDBACK_TAG1,
          FEEDBACK_TAG2,
          FEEDBACK_ENDPOINT,
          "",
          keccak256(toHex(context || "")),
        ],
      });

      setStatus("confirming");
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });

      // FIXED: this check was missing entirely before -- a reverted tx
      // still resolves waitForTransactionReceipt() without throwing, so the
      // old code fell straight through to "success" regardless of whether
      // the feedback actually landed onchain. This is the same class of bug
      // useAgentIdentity.ts's register() already had fixed for it.
      if (receipt?.status !== "success") {
        setStatus("failed");
        toast.error(
          "Feedback transaction reverted onchain — check the tx on the explorer for the reason"
        );
        return null;
      }

      setStatus("success");
      toast.success("Feedback submitted onchain");

      // Needed for getSummary() elsewhere: it turns out clientAddresses
      // can't be an empty array (reverts with "clientAddresses required"),
      // so we track who's given feedback to whom ourselves. Fire-and-forget
      // -- doesn't block the success path if it fails.
      if (providerAddress && clientAddress) {
        fetch("/api/agent/record-feedback-client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ providerAddress, clientAddress }),
        }).catch((error) =>
          console.error("Could not record feedback client:", error)
        );
      }

      return hash;
    } catch (error) {
      console.error(error);
      setStatus("failed");
      toast.error("Could not submit feedback");
      return null;
    } finally {
      setStatus("idle");
    }
  }

  return {
    status,
    hasIdentity,
    providerAgentId,
    giveFeedback,
  };
}