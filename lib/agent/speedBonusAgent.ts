import { createPublicClient, http, type PublicClient } from "viem";
import { arcTestnet } from "@reown/appkit/networks";

import {
  AGENTIC_COMMERCE_ADDRESS,
  AGENTIC_COMMERCE_ABI,
  REPUTATION_REGISTRY_ADDRESS,
  REPUTATION_REGISTRY_ABI,
} from "@/lib/agent/agenticCommerce";
import { getDirectoryEntry } from "@/lib/agent/providerDirectory";
import { getFeedbackClients } from "@/lib/agent/feedbackClients";

// Reusing the same network config your wagmi/Reown setup already uses
// (lib/reown.ts imports this exact `arcTestnet`), so this reads from the
// same chain your app already talks to -- no new RPC/config guessed here.
const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(),
}) as PublicClient;

// job.status enum -- carried over from JobBoard.tsx's STATUS_LABEL, which
// itself was flagged there as an ASSUMPTION never confirmed against the
// contract's actual enum values. If bonuses come out wrong for jobs that
// visually show "Completed" in the UI, this is the first thing to check.
const STATUS_COMPLETED = 3;

export interface JobRecord {
  id: bigint;
  client: `0x${string}`;
  provider: `0x${string}`;
  evaluator: `0x${string}`;
  description: string;
  budget: bigint;
  expiredAt: bigint;
  status: number;
  hook: `0x${string}`;
}

export interface BonusDecision {
  jobId: bigint;
  provider: `0x${string}`;
  shouldPay: boolean;
  bonusAmount: bigint; // in USDC base units (6 decimals)
  reason: string;
}

/**
 * ⚠️ REPLACED: this file originally had a `getAllJobs()` that looped
 * `jobCounter` (1..N) calling `getJob` for every job on the ENTIRE shared
 * AgenticCommerce contract -- the same contract every Arc tutorial-follower
 * uses. Your team already hit and fixed this exact problem in
 * hooks/useJobBoard.ts (see its comment on useMyJobIds): jobCounter can be
 * in the thousands, and looping it causes RPC 413/429 rate-limit errors.
 *
 * Fix: this agent now only ever evaluates ONE job at a time, by ID -- called
 * right after a client completes a job (the client already knows the jobId,
 * no scanning needed). See getJobById() below and the updated API route.
 */
export async function getJobById(jobId: bigint): Promise<JobRecord> {
  const job = (await publicClient.readContract({
    address: AGENTIC_COMMERCE_ADDRESS,
    abi: AGENTIC_COMMERCE_ABI,
    functionName: "getJob",
    args: [jobId],
  })) as JobRecord;

  return job;
}

/**
 * Looks up a provider's onchain reputation score.
 *
 * FIXED (round 1): this used to call agentIdOf(provider) on
 * IdentityRegistry to find the provider's agentId before reading
 * ReputationRegistry -- that function never existed on the real contract
 * (see agenticCommerce.ts's IDENTITY_REGISTRY_ABI comment). IdentityRegistry
 * has no onchain reverse lookup at all -- so the agentId now comes from our
 * own provider directory (Redis), populated when a provider registers
 * through this app (see useAgentIdentity.ts).
 *
 * FIXED (round 2): also called the fictional reputationOf(agentId) --
 * the real function is getSummary(agentId, clientAddresses, tag1, tag2),
 * returning a fixed-point (count, summaryValue, summaryValueDecimals)
 * instead of a plain 0-100 average (see agenticCommerce.ts's
 * REPUTATION_REGISTRY_ABI comment for the full story).
 *
 * A provider who isn't in our directory (e.g. registered before this
 * feature existed, or via a different app) has no bonus multiplier
 * available -- same "no data -> no bonus" tradeoff already used for
 * missing timing data below.
 */
async function getProviderReputation(
  provider: `0x${string}`
): Promise<number | null> {
  try {
    const entry = await getDirectoryEntry(provider);
    if (!entry) return null;

    const agentId = BigInt(entry.agentId);
    if (agentId === 0n) return null;

    // FIXED: getSummary() reverts with "clientAddresses required" if that
    // array is empty -- so we can't call it at all for a provider nobody's
    // rated yet through this app. Same "no data -> no bonus" tradeoff as
    // missing timing data below, just one step earlier.
    const clientAddresses = await getFeedbackClients(provider);
    if (clientAddresses.length === 0) return null;

    const [count, summaryValue, summaryValueDecimals] =
      (await publicClient.readContract({
        address: REPUTATION_REGISTRY_ADDRESS,
        abi: REPUTATION_REGISTRY_ABI,
        functionName: "getSummary",
        args: [agentId, clientAddresses, "", ""],
      })) as [bigint, bigint, number];

    if (count === 0n) return null;

    // summaryValue is a fixed-point int128; summaryValueDecimals tells us
    // where the decimal point goes (e.g. summaryValue=9500,
    // summaryValueDecimals=2 -> 95.00).
    return Number(summaryValue) / 10 ** Number(summaryValueDecimals);
  } catch {
    return null;
  }
}

/**
 * Decides whether a completed job earns a speed bonus, and how much.
 *
 * ⚠️ REPLACED the original approach here too: this used to call
 * `publicClient.getLogs({ fromBlock: "earliest", toBlock: "latest" })` to
 * find JobCreated/JobSubmitted timestamps. Arc Testnet's RPC caps
 * eth_getLogs at a 10,000 block range, and because Arc's finality is ~0.48s
 * per block, "earliest to latest" blows past that almost immediately.
 *
 * Fix: don't search for the timestamps after the fact at all. The client is
 * already present, signing the createJob and submit transactions in real
 * time -- it can read each transaction's block timestamp THE MOMENT it
 * happens (see hooks/useJobBoard.ts) and pass both timestamps in here
 * directly. No log search, no block-range limit to hit.
 *
 * createdAt/submittedAt are required -- if a job was created before this
 * tracking existed (or from a different client that didn't record it),
 * there's no reliable way to recover the timing after the fact anymore, and
 * this correctly returns "no bonus" rather than guessing.
 */
export async function decideSpeedBonus(
  job: JobRecord,
  createdAt: bigint | null,
  submittedAt: bigint | null
): Promise<BonusDecision> {
  const noBonus: BonusDecision = {
    jobId: job.id,
    provider: job.provider,
    shouldPay: false,
    bonusAmount: 0n,
    reason: "",
  };

  if (job.status !== STATUS_COMPLETED) {
    return { ...noBonus, reason: "Job not completed yet" };
  }

  if (createdAt === null || submittedAt === null) {
    return {
      ...noBonus,
      reason:
        "No timing data for this order (it was likely created/submitted before speed-bonus tracking was added to the app)",
    };
  }

  const totalWindow = job.expiredAt - createdAt;
  const timeUsed = submittedAt - createdAt;

  if (timeUsed < 0n) {
    return { ...noBonus, reason: "Invalid timing data (submitted before created)" };
  }

  if (totalWindow <= 0n) {
    return { ...noBonus, reason: "Invalid time window" };
  }

  const speedRatio = 1 - Number(timeUsed) / Number(totalWindow);

  let basePct = 0;
  let speedLabel = "";
  if (speedRatio > 0.7) {
    basePct = 15;
    speedLabel = `completed in ${Math.round((1 - speedRatio) * 100)}% of the allotted time`;
  } else if (speedRatio > 0.4) {
    basePct = 5;
    speedLabel = `completed faster than average (${Math.round((1 - speedRatio) * 100)}% of window used)`;
  } else {
    return { ...noBonus, reason: "Submitted too close to deadline for a speed bonus" };
  }

  const reputation = await getProviderReputation(job.provider);
  const multiplier = reputation !== null && reputation >= 80 ? 1.5 : 1;

  const baseBonus = (job.budget * BigInt(basePct)) / 100n;
  const bonusAmount = BigInt(Math.floor(Number(baseBonus) * multiplier));

  const reputationNote =
    reputation !== null
      ? multiplier > 1
        ? `, reputation ${reputation}/100 (>=80 -> 1.5x multiplier)`
        : `, reputation ${reputation}/100 (below 80, no multiplier)`
      : ", no registered ERC-8004 identity in our directory (no multiplier)";

  return {
    jobId: job.id,
    provider: job.provider,
    shouldPay: true,
    bonusAmount,
    reason: `Speed bonus: ${speedLabel}${reputationNote}`,
  };
}