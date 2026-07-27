"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

type RunResult = {
  jobId: string;
  provider: string;
  paid: boolean;
  amount?: string;
  reason: string;
  txHash?: string;
  error?: string;
};

type LeaderboardEntry = {
  provider: `0x${string}`;
  totalBonus: string;
  bonusCount: number;
};

type HistoryEntry = {
  jobId: string;
  provider: `0x${string}`;
  amount: string;
  reason: string;
  txHash: `0x${string}`;
  timestamp: number;
};

export function useAgentDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunResults, setLastRunResults] = useState<RunResult[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);

  const refreshLeaderboard = useCallback(async () => {
    setIsLoadingBoard(true);
    try {
      const res = await fetch("/api/agent/leaderboard");
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
        setHistory(data.history);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingBoard(false);
    }
  }, []);

  const runAgent = useCallback(async () => {
    setIsRunning(true);
    try {
      const res = await fetch("/api/agent/run-speed-bonus", { method: "POST" });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.message ?? "Agent run failed");
        return;
      }

      setLastRunResults(data.results);

      const paidCount = data.results.filter((r: RunResult) => r.paid).length;
      toast.success(
        paidCount > 0
          ? `Agent paid ${paidCount} bonus${paidCount > 1 ? "es" : ""}`
          : "Agent ran — no jobs qualified for a bonus this time"
      );

      await refreshLeaderboard();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message ?? "Agent run failed");
    } finally {
      setIsRunning(false);
    }
  }, [refreshLeaderboard]);

  return {
    isRunning,
    lastRunResults,
    leaderboard,
    history,
    isLoadingBoard,
    runAgent,
    refreshLeaderboard,
  };
}