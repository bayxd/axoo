"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";

import { useJobBoard, useJob, useMyJobIds } from "@/hooks/pay/escrow/useJobBoard";
import { useAgentFeedback } from "@/hooks/pay/escrow/useAgentFeedback";
import { useProviderDirectory } from "@/hooks/pay/escrow/useProviderDirectory";
import { useAccess } from "@/context/AccessContext";

const STATUS_META: { label: string; dot: string; text: string }[] = [
  { label: "Created", dot: "bg-zinc-400", text: "text-zinc-600 dark:text-zinc-400" },
  { label: "Funded", dot: "bg-blue-400", text: "text-blue-600 dark:text-blue-400" },
  { label: "Submitted", dot: "bg-amber-400", text: "text-amber-600 dark:text-amber-400" },
  { label: "Completed", dot: "bg-emerald-400", text: "text-emerald-600 dark:text-emerald-400" },
];

// Quick-pick scores instead of a free-form 0-100 input -- keeps the
// feedback flow to one click for the common case. "Custom" score isn't
// offered here; the score just needs to clear the >=80 threshold
// speedBonusAgent.ts checks for its 1.5x multiplier, or fall below it.
const FEEDBACK_OPTIONS = [
  { label: "Great", score: 95 },
  { label: "OK", score: 65 },
  { label: "Poor", score: 25 },
];

// Local-only "already left feedback" flag, same pragmatic tradeoff as
// useMyJobIds' localStorage tracking elsewhere in this file: the contract
// has no per-(client, job) dedupe for giveFeedback, so nothing stops a
// second submission on the client's own machine except this flag. A
// determined user could clear localStorage and submit again — acceptable
// for this app's scope, not a security boundary.
function feedbackKey(jobId: bigint) {
  return `arc-agentic-commerce-feedback-given:${jobId.toString()}`;
}

function hasLeftFeedback(jobId: bigint) {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(feedbackKey(jobId)) === "1";
}

function markFeedbackGiven(jobId: bigint) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(feedbackKey(jobId), "1");
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function FeedbackRow({
  jobId,
  provider,
}: {
  jobId: bigint;
  provider: `0x${string}`;
}) {
  const { hasIdentity, giveFeedback, status } = useAgentFeedback(provider);
  const [given, setGiven] = useState(() => hasLeftFeedback(jobId));

  if (given) {
    return (
      <p className="mt-2.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
        ✓ Feedback left for this order
      </p>
    );
  }

  if (!hasIdentity) {
    return (
      <p className="mt-2.5 text-[11px] text-zinc-600 font-mono italic">
        Supplier hasn't registered an identity — feedback unavailable
      </p>
    );
  }

  async function handleFeedback(score: number, label: string) {
    const hash = await giveFeedback(
      score,
      `Purchase Order #${jobId.toString()}: ${label}`
    );
    if (hash) {
      markFeedbackGiven(jobId);
      setGiven(true);
    }
  }

  return (
    <div className="mt-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-3">
      <p className="text-[11px] text-zinc-600 font-mono mb-2">
        Rate this supplier — feeds their onchain reputation (ERC-8004)
      </p>
      <div className="flex gap-2">
        {FEEDBACK_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => handleFeedback(opt.score, opt.label)}
            disabled={status !== "idle"}
            className="flex-1 h-8 rounded-md text-xs font-semibold uppercase tracking-wide bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 duration-150 disabled:opacity-40"
          >
            {status !== "idle" ? "…" : opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function JobRow({ jobId }: { jobId: bigint }) {
  const { job, refetch } = useJob(jobId);
  const { fundJob, setBudgetWithRetry, submitDeliverable, completeJob, status } = useJobBoard();
  const { address } = useAccount();
  const [retryAmount, setRetryAmount] = useState("");

  if (!job) return null;

  const { client, provider, description, budget, status: jobStatus } = job as {
    id: bigint;
    client: `0x${string}`;
    provider: `0x${string}`;
    evaluator: `0x${string}`;
    description: string;
    budget: bigint;
    expiredAt: bigint;
    status: number;
    hook: `0x${string}`;
  };

  const isClient = address?.toLowerCase() === client.toLowerCase();
  const isProvider = address?.toLowerCase() === provider.toLowerCase();
  const meta = STATUS_META[jobStatus];

  return (
    <div className="group relative pl-4 py-4 border-b border-black/5 dark:border-white/[0.06] last:border-0">
      {/* Ledger rule — status color, the one signal you need at a glance */}
      <div className={`absolute left-0 top-4 bottom-4 w-[2px] rounded-full ${meta.dot} opacity-70`} />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2.5 mb-0.5">
            <span className="text-[11px] font-mono text-zinc-600 tabular-nums">
              #{jobId.toString()}
            </span>
            <span className={`text-[10px] font-mono uppercase tracking-widest ${meta.text}`}>
              {meta.label}
            </span>
            {isClient && (
              <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                You're the buyer
              </span>
            )}
            {isProvider && (
              <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                You're the supplier
              </span>
            )}
          </div>
          <p className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100 truncate">{description}</p>
          <p className="text-[11px] text-zinc-600 font-mono mt-0.5">
            {shortAddr(client)} <span className="text-zinc-400 dark:text-zinc-700">→</span> {shortAddr(provider)}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-lg font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {(Number(budget) / 1e6).toFixed(2)}
          </p>
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wide">USDC</p>
        </div>
      </div>

      {isProvider && jobStatus === 0 && budget === BigInt(0) && (
        <div className="mt-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/20 p-3 space-y-2">
          <p className="text-[11px] text-amber-700 dark:text-amber-400/90 font-mono">
            Quote your price - the buyer can't fund escrow until you do.
          </p>
          <div className="flex gap-2">
            <input
              value={retryAmount}
              onChange={(e) => setRetryAmount(e.target.value)}
              placeholder="Your quote (USDC)"
              className="flex-1 bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-md px-2.5 py-1.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-500/40"
            />
            <button
              className="h-8 px-3 rounded-md text-xs font-semibold uppercase tracking-wide bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 duration-150 disabled:opacity-40"
              onClick={async () => {
                if (!retryAmount) return;
                const hash = await setBudgetWithRetry(jobId, retryAmount);
                if (hash) setRetryAmount("");
                refetch();
              }}
              disabled={status !== "idle" || !retryAmount}
            >
              Set Quote
            </button>
          </div>
        </div>
      )}

      {isClient && jobStatus === 0 && budget === BigInt(0) && (
        <p className="mt-2.5 text-[11px] text-zinc-600 font-mono italic">
          Waiting for the supplier to quote a price…
        </p>
      )}

      {isClient && jobStatus === 0 && budget > BigInt(0) && (
        <button
          className="mt-3 h-9 px-4 rounded-md text-xs font-semibold uppercase tracking-wide bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 duration-150 disabled:opacity-40"
          onClick={async () => {
            await fundJob(jobId, (Number(budget) / 1e6).toString());
            refetch();
          }}
          disabled={status !== "idle"}
        >
          {status === "approving" ? "Approving…" : "Fund Escrow"}
        </button>
      )}

      {isProvider && jobStatus === 1 && (
        <button
          className="mt-3 h-9 px-4 rounded-md text-xs font-semibold uppercase tracking-wide bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-200 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 duration-150 disabled:opacity-40"
          onClick={async () => {
            await submitDeliverable(jobId, "ipfs://deliverable-placeholder");
            refetch();
          }}
          disabled={status !== "idle"}
        >
          {status === "submitting-tx" || status === "confirming" ? "Submitting…" : "Submit Proof of Delivery"}
        </button>
      )}

      {isClient && jobStatus === 2 && (
        <button
          className="mt-3 h-9 px-4 rounded-md text-xs font-semibold uppercase tracking-wide bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 duration-150 disabled:opacity-40"
          onClick={async () => {
            await completeJob(jobId);
            refetch();
          }}
          disabled={status !== "idle"}
        >
          {status === "submitting-tx" || status === "confirming" ? "Releasing…" : "Release Payment"}
        </button>
      )}

      {/* NEW: reputation feedback, once the order is fully completed */}
      {isClient && jobStatus === 3 && (
        <FeedbackRow jobId={jobId} provider={provider} />
      )}
    </div>
  );
}

export default function JobBoard() {
  const { createJob, status } = useJobBoard();
  const { isHolder } = useAccess();
  const { jobIds, loading: jobsLoading, addJobId } = useMyJobIds();
  const { address } = useAccount();
  const { loading: matching, findBestProvider } = useProviderDirectory();

  const [provider, setProvider] = useState("");
  const [description, setDescription] = useState("");
  const [trackId, setTrackId] = useState("");

  async function handleAutoAssign() {
    const best = await findBestProvider(address);
    if (!best) {
      toast.error("No registered providers found yet — enter one manually");
      return;
    }
    setProvider(best.address);
    toast.success(
      `Assigned ${best.address.slice(0, 6)}…${best.address.slice(-4)} — reputation ${best.reputation}/100 (${best.feedbackCount} review${best.feedbackCount !== 1 ? "s" : ""})`
    );
  }

  async function handlePostJob() {
    const result = await createJob(provider as `0x${string}`, description);
    if (!result?.jobId) return;
    addJobId(result.jobId);
    setProvider("");
    setDescription("");
  }

  function handleTrackJob() {
    if (!trackId.trim()) return;
    try {
      addJobId(BigInt(trackId.trim()));
      setTrackId("");
    } catch {
      toast.error("That doesn't look like a valid order ID");
    }
  }

  return (
    <section
      className="
      relative
      overflow-hidden
      bg-white dark:bg-[#0c0e14]
      border
      border-black/5 dark:border-white/[0.07]
      rounded-2xl
      shadow-2xl
      w-full
      max-w-200
      "
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-[rgb(var(--brand-1-rgb)/0.6)] via-[rgb(var(--brand-2-rgb)/0.6)] to-[rgb(var(--brand-3-rgb)/0.6)]" />

      <div className="px-6 pt-6 pb-5 border-b border-black/5 dark:border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-zinc-500 font-semibold uppercase mb-1 font-mono">
              Trade Finance
            </p>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Purchase Order Escrow</h2>
          </div>
          <div className="bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-full px-3 py-1 text-zinc-600 dark:text-zinc-400 text-[10px] font-mono font-semibold tracking-widest">
            ERC-8183
          </div>
        </div>

        {isHolder && (
          <div className="mt-4 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20 px-3.5 py-2 text-[11px] font-mono text-emerald-700 dark:text-emerald-400/90">
            ✓ Genesis Pass holder — verified buyer status
          </div>
        )}
      </div>

      <div className="px-6 py-6 space-y-3 border-b border-black/5 dark:border-white/[0.06]">
        <div className="flex gap-2">
          <input
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="Supplier / counterparty address (0x…)"
            className="flex-1 bg-black/[0.03] dark:bg-black/25 border border-black/10 dark:border-white/[0.08] rounded-lg px-3.5 py-3 text-sm font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:border-[rgb(var(--brand-1-rgb)/0.4)] duration-200 placeholder:text-zinc-500 dark:placeholder:text-zinc-600"
          />
          <button
            onClick={handleAutoAssign}
            disabled={matching}
            className="shrink-0 px-4 rounded-lg text-xs font-semibold uppercase tracking-wide bg-[rgb(var(--brand-1-rgb)/0.12)] text-[var(--brand-1)] dark:text-[var(--brand-1-dark)] border border-[rgb(var(--brand-1-rgb)/0.3)] hover:bg-[rgb(var(--brand-1-rgb)/0.2)] duration-150 disabled:opacity-40"
          >
            {matching ? "Matching…" : "Auto-assign"}
          </button>
        </div>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Purchase order / invoice description"
          className="w-full bg-black/[0.03] dark:bg-black/25 border border-black/10 dark:border-white/[0.08] rounded-lg px-3.5 py-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-[rgb(var(--brand-1-rgb)/0.4)] duration-200 placeholder:text-zinc-500 dark:placeholder:text-zinc-600"
        />
        <p className="text-[11px] text-zinc-600 px-0.5">
          Price isn't set here - the supplier quotes it after the order is created.
        </p>

        <button
          className="w-full h-11 rounded-lg text-sm font-semibold tracking-wide bg-linear-to-r from-[var(--brand-1)] via-[var(--brand-2)] to-[var(--brand-3)] hover:brightness-110 duration-200 disabled:opacity-40"
          onClick={handlePostJob}
          disabled={status !== "idle"}
        >
          {status === "submitting-tx" ? "Creating…" : "Create Purchase Order"}
        </button>
      </div>

      <div className="px-6 pt-5 pb-1 flex items-center gap-2">
        <input
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
          placeholder="Track an order you're the supplier on (Order #)"
          className="flex-1 bg-black/[0.03] dark:bg-black/25 border border-black/10 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:border-[rgb(var(--brand-1-rgb)/0.4)] duration-200 placeholder:text-zinc-500 dark:placeholder:text-zinc-600"
        />
        <button
          className="px-4 rounded-lg text-xs font-semibold uppercase tracking-wide bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 duration-150"
          onClick={handleTrackJob}
        >
          Track
        </button>
      </div>

      {jobIds.length > 0 && (
        <p className="px-6 pt-3 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          {jobIds.length} order{jobIds.length !== 1 ? "s" : ""}
        </p>
      )}

      <div className="px-6 pb-2 relative">
        {jobsLoading && jobIds.length === 0 && (
          <p className="text-xs text-zinc-600 font-mono text-center py-8">
            Loading your orders from Arc…
          </p>
        )}
        {!jobsLoading && jobIds.length === 0 && (
          <p className="text-xs text-zinc-600 font-mono text-center py-8">
            No orders yet. Create one above, or enter an order ID to track one you're supplying.
          </p>
        )}

        {jobIds.length > 0 && (
          <>
            <div
              className="
              max-h-[420px]
              overflow-y-auto
              pb-2
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-white/10
              [&::-webkit-scrollbar-thumb]:rounded-full
              hover:[&::-webkit-scrollbar-thumb]:bg-white/20
              "
            >
              {jobIds.map((id) => (
                <JobRow key={id.toString()} jobId={id} />
              ))}
            </div>
            {/* Fade mask hints there's more to scroll, without a visible "..." */}
            <div className="pointer-events-none absolute bottom-2 left-6 right-6 h-10 bg-linear-to-t from-white dark:from-[#0c0e14] to-transparent" />
          </>
        )}
      </div>
    </section>
  );
}