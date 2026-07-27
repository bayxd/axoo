"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { useBalances } from "@/hooks/portfolio/useBalances";

export interface PortfolioSnapshot {
  timestamp: number;
  usdcBalance: number;
  eurcBalance: number;
  totalValueUSD: number;
}

/**
 * Panggil hook ini SEKALI di halaman Portfolio. Tugasnya cuma mencatat
 * saldo saat ini sebagai snapshot ke server (Upstash Redis via API route),
 * setiap kali halaman dibuka (dibatasi 1x/jam oleh API route, lihat
 * app/api/portfolio/snapshot/route.ts).
 */
export function usePortfolioHistorySnapshot() {
  const { address } = useAccount();
  const { usdcBalance, eurcBalance } = useBalances();

  useEffect(() => {
    if (!address) return;

    // Jangan simpan snapshot kosong/loading (0 karena belum ke-fetch, bukan
    // karena saldo beneran 0) — cegah data historis yang menyesatkan.
    if (usdcBalance === undefined || eurcBalance === undefined) return;

    fetch("/api/portfolio/snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        usdcBalance: Number(usdcBalance ?? 0),
        eurcBalance: Number(eurcBalance ?? 0),
      }),
    }).catch((err) => {
      console.error("Gagal mencatat portfolio snapshot:", err);
    });
  }, [address, usdcBalance, eurcBalance]);
}

export function usePortfolioHistory(
  period: "1D" | "7D" | "30D" | "ALL"
): PortfolioSnapshot[] {
  const { address } = useAccount();

  // Initial state harus [] biar hydration server/client cocok — data asli
  // baru masuk setelah fetch di useEffect selesai.
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);

  useEffect(() => {
    if (!address) {
      setSnapshots([]);
      return;
    }

    let cancelled = false;

    fetch(`/api/portfolio/history?address=${address}&period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setSnapshots(data.snapshots ?? []);
      })
      .catch((err) => {
        console.error("Gagal memuat portfolio history:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [address, period]);

  return snapshots;
}