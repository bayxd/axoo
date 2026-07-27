"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAgentDashboard } from "@/hooks/pay/escrow/useAgentDashboard";

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatUsdc(baseUnits: string) {
  return (Number(baseUnits) / 1e6).toFixed(2);
}

export default function AgentDashboard() {
  const { leaderboard, history, isLoadingBoard, refreshLeaderboard } =
    useAgentDashboard();

  const [checkJobId, setCheckJobId] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  async function handleCheck() {
    if (!checkJobId.trim()) return;
    setIsChecking(true);
    try {
      const res = await fetch("/api/agent/check-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: checkJobId.trim() }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.message ?? "Check failed");
      } else if (data.paid) {
        toast.success(`+${formatUsdc(data.amount)} USDC — ${data.reason}`);
        refreshLeaderboard();
      } else {
        toast(data.reason ?? "No bonus for this order");
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Check failed");
    } finally {
      setIsChecking(false);
      setCheckJobId("");
    }
  }

  return (
    <div className="space-y-4">
      {/* Agent explainer + manual check */}
      <section className="relative overflow-hidden bg-white dark:bg-[#0c0e14] border border-black/5 dark:border-white/[0.07] rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-zinc-500 font-semibold uppercase mb-1 font-mono">
              Autonomous Agent
            </p>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Speed Bonus Agent</h2>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        </div>

        <p className="text-[13px] text-zinc-500 leading-relaxed mb-4 max-w-lg">
          Runs the moment a Purchase Order is completed - weighs delivery speed
          against onchain reputation (ERC-8004) and pays the bonus directly,
          no approval per payout. Re-check a specific order below.
        </p>

        <div className="flex gap-2">
          <input
            value={checkJobId}
            onChange={(e) => setCheckJobId(e.target.value)}
            placeholder="Order # to check"
            className="flex-1 bg-black/[0.03] dark:bg-black/25 border border-black/10 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:border-[rgb(var(--brand-1-rgb)/0.4)] duration-200 placeholder:text-zinc-500 dark:placeholder:text-zinc-600"
          />
          <button
            onClick={handleCheck}
            disabled={isChecking || !checkJobId.trim()}
            className="px-4 rounded-lg text-xs font-semibold uppercase tracking-wide bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 duration-150 disabled:opacity-40"
          >
            {isChecking ? "Checking…" : "Check"}
          </button>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="relative overflow-hidden bg-white dark:bg-[#0c0e14] border border-black/5 dark:border-white/[0.07] rounded-2xl shadow-2xl p-6">
        <p className="text-[10px] tracking-[0.2em] text-zinc-500 font-semibold uppercase mb-1 font-mono">
          Leaderboard
        </p>
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">
          Top Providers by Bonus Earned
        </h2>

        {isLoadingBoard ? (
          <p className="text-sm text-zinc-600">Loading…</p>
        ) : leaderboard.length === 0 ? (
          <p className="text-sm text-zinc-600">
            No bonuses paid yet — complete a Purchase Order to trigger one.
          </p>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/[0.06]">
            {leaderboard.map((entry, i) => (
              <div key={entry.provider} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3.5">
                  <span
                    className={`text-xs font-mono font-bold w-5 text-center ${
                      i === 0 ? "text-amber-600 dark:text-amber-400" : "text-zinc-500 dark:text-zinc-600"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                    {shortAddr(entry.provider)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {formatUsdc(entry.totalBonus)}{" "}
                    <span className="text-zinc-500 dark:text-zinc-600 text-xs font-normal">USDC</span>
                  </p>
                  <p className="text-[10px] text-zinc-600">
                    {entry.bonusCount} bonus{entry.bonusCount !== 1 ? "es" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Activity log */}
      {history.length > 0 && (
        <section className="relative overflow-hidden bg-white dark:bg-[#0c0e14] border border-black/5 dark:border-white/[0.07] rounded-2xl shadow-2xl p-6">
          <p className="text-[10px] tracking-[0.2em] text-zinc-500 font-semibold uppercase mb-1 font-mono">
            Audit Trail
          </p>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">
            Agent Activity Log
          </h2>

          <div className="space-y-0 max-h-96 overflow-y-auto divide-y divide-black/5 dark:divide-white/[0.06]">
            {history.map((h) => (
              <div key={`${h.jobId}-${h.txHash}`} className="py-3 first:pt-0">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    #{h.jobId} → {shortAddr(h.provider)}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    +{formatUsdc(h.amount)} USDC
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">{h.reason}</p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-700 mt-0.5 font-mono">
                  {new Date(h.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}