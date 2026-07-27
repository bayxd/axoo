"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { usePortfolioHistory } from "@/hooks/portfolio/usePortfolioHistory";
import { useBalances } from "@/hooks/portfolio/useBalances";

const COLORS = {
  usdc: "var(--brand-1)",
  eurc: "var(--brand-3)",
};

function use24hChange(currentTotal: number) {
  const snapshots = usePortfolioHistory("1D");

  if (snapshots.length < 2) return null;

  const first = snapshots[0].totalValueUSD;

  if (first <= 0) return null;

  return ((currentTotal - first) / first) * 100;
}

export default function PortfolioSummary() {
  const { usdcBalance: usdcValue, eurcBalance: eurcValue, isError } =
    useBalances();

  const total = usdcValue + eurcValue;

  const usdcPct = total > 0 ? (usdcValue / total) * 100 : 0;
  const eurcPct = total > 0 ? (eurcValue / total) * 100 : 0;

  const change24h = use24hChange(total);

  const assetsHeld = [usdcValue, eurcValue].filter((v) => v > 0).length;

  const pieData = [
    { name: "USDC", value: usdcValue || 0.0001 },
    { name: "EURC", value: eurcValue || 0.0001 },
  ];

  return (
    <section
      className="
      relative
      overflow-hidden
      bg-white/70 dark:bg-zinc-900/70
      backdrop-blur-xl glass-panel
      border
      border-black/5 dark:border-white/10
      rounded-[40px]
      p-8
      shadow-2xl
      "
    >
      {/* neon top strip */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-[var(--brand-1)] via-[var(--brand-2)] to-[var(--brand-3)]" />

      {/* HUD corner brackets */}
      <div className="pointer-events-none absolute top-5 left-5 h-4 w-4 border-t border-l border-[rgb(var(--brand-1-rgb)/0.5)] rounded-tl-sm hud-corner" />
      <div className="pointer-events-none absolute top-5 right-5 h-4 w-4 border-t border-r border-[rgb(var(--brand-3-rgb)/0.5)] rounded-tr-sm hud-corner" />
      <div className="pointer-events-none absolute bottom-5 left-5 h-4 w-4 border-b border-l border-[rgb(var(--brand-1-rgb)/0.25)] rounded-bl-sm hud-corner" />
      <div className="pointer-events-none absolute bottom-5 right-5 h-4 w-4 border-b border-r border-[rgb(var(--brand-3-rgb)/0.25)] rounded-br-sm hud-corner" />

      {/* subtle dot grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] dot-grid-texture"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(var(--brand-1-rgb) / 0.7) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="relative">
        <p className="text-[10px] tracking-[0.2em] text-[var(--brand-1)]/80 dark:text-[var(--brand-1-dark)]/80 font-semibold uppercase mb-1 font-mono">
          // Portfolio Feed
        </p>

        <h2 className="text-3xl font-bold tracking-tight mb-6 text-zinc-900 dark:text-white">
          Portfolio Overview
        </h2>

        {/* Stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-zinc-100/60 dark:bg-zinc-800/60 border border-black/5 dark:border-white/5 rounded-2xl p-4">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-2">
              Total assets
            </p>
            <p className="text-2xl font-black bg-linear-to-r from-[var(--brand-1)] via-[var(--brand-2)] to-[var(--brand-3)] text-transparent bg-clip-text">
              ${total.toFixed(2)}
            </p>
          </div>

          <div className="bg-zinc-100/60 dark:bg-zinc-800/60 border border-black/5 dark:border-white/5 rounded-2xl p-4">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-2">
              24h change
            </p>
            <p
              className={`text-2xl font-black ${
                change24h === null
                  ? "text-zinc-500 dark:text-zinc-600"
                  : change24h >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {change24h === null
                ? "—"
                : `${change24h >= 0 ? "+" : ""}${change24h.toFixed(1)}%`}
            </p>
          </div>

          <div className="bg-zinc-100/60 dark:bg-zinc-800/60 border border-black/5 dark:border-white/5 rounded-2xl p-4">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-2">
              Assets held
            </p>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">{assetsHeld}</p>
          </div>

          <div className="bg-zinc-100/60 dark:bg-zinc-800/60 border border-black/5 dark:border-white/5 rounded-2xl p-4">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-2">
              Network
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Arc</p>
          </div>
        </div>

        {/* Allocation + asset list */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-100/60 dark:bg-zinc-800/60 border border-black/5 dark:border-white/5 rounded-2xl p-5">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-4">
              Allocation
            </p>

            <div className="flex items-center gap-6">
              <div className="w-28 h-28 shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      innerRadius={32}
                      outerRadius={50}
                      paddingAngle={3}
                      stroke="none"
                    >
                      <Cell fill={COLORS.usdc} />
                      <Cell fill={COLORS.eurc} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: COLORS.usdc }}
                  />
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold">USDC</span>
                  <span className="text-zinc-500 font-mono">
                    {usdcPct.toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: COLORS.eurc }}
                  />
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold">EURC</span>
                  <span className="text-zinc-500 font-mono">
                    {eurcPct.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-100/60 dark:bg-zinc-800/60 border border-black/5 dark:border-white/5 rounded-2xl p-5 space-y-2">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-2">
              Assets
            </p>

            <div className="flex items-center justify-between bg-zinc-100/60 dark:bg-zinc-900/60 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 hover:border-[rgb(var(--brand-1-rgb)/0.2)] duration-300">
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: COLORS.usdc,
                    boxShadow: `0 0 6px ${COLORS.usdc}`,
                  }}
                />
                <span className="text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-widest font-semibold">
                  USDC
                </span>
              </div>
              <span className="font-mono font-bold text-base tabular-nums text-zinc-900 dark:text-zinc-100">
                {usdcValue.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between bg-zinc-100/60 dark:bg-zinc-900/60 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 hover:border-[rgb(var(--brand-3-rgb)/0.2)] duration-300">
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: COLORS.eurc,
                    boxShadow: `0 0 6px ${COLORS.eurc}`,
                  }}
                />
                <span className="text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-widest font-semibold">
                  EURC
                </span>
              </div>
              <span className="font-mono font-bold text-base tabular-nums text-zinc-900 dark:text-zinc-100">
                {eurcValue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}