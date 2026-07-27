"use client";

import { useState } from "react";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip
}
from "recharts";

import { usePortfolioHistory } from "@/hooks/portfolio/usePortfolioHistory";

type Period = "1D" | "7D" | "30D" | "ALL";

const PERIODS: Period[] = ["1D", "7D", "30D", "ALL"];

// Ambang minimal titik data biar chart nggak menyesatkan (garis lurus antar
// 1-2 titik kelihatan seperti tren padahal cuma noise). Sesuaikan kalau perlu.
const MIN_POINTS_TO_SHOW_CHART = 3;

export default function PerformanceChart() {

  const [period, setPeriod] = useState<Period>("7D");

  // Baca snapshot ASLI dari localStorage (dicatat oleh
  // usePortfolioHistorySnapshot() setiap kali halaman Portfolio dibuka).
  // Tidak ada lagi data hardcode di sini.
  const snapshots = usePortfolioHistory(period);

  const chartData = snapshots.map((s) => ({
    value: s.totalValueUSD,
    timestamp: s.timestamp,
  }));

  const hasEnoughData = chartData.length >= MIN_POINTS_TO_SHOW_CHART;

  return (

    <section
      className="
      relative
      overflow-hidden
      bg-white/70 dark:bg-zinc-900/70
      backdrop-blur-xl glass-panel
      border
      border-black/5 dark:border-white/10
      rounded-3xl
      p-8
      shadow-2xl
      "
    >

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

        <div
          className="
          flex
          items-center
          justify-between
          mb-8
          "
        >

          <div>
            <p className="text-[10px] tracking-[0.2em] text-[var(--brand-1)]/80 dark:text-[var(--brand-1-dark)]/80 font-semibold uppercase mb-1 font-mono">
              // Growth Trace
            </p>
            <h2
              className="
              text-2xl
              font-bold
              tracking-tight
              text-zinc-900
              dark:text-white
              "
            >
              Performance
            </h2>
          </div>

          <div
            className="
            flex
            gap-2
            bg-zinc-100/60
            dark:bg-zinc-800/60
            border
            border-black/5
            dark:border-white/5
            rounded-full
            p-1
            "
          >

            {

              PERIODS.map(

                (item) => (

                  <button

                    key={item}

                    onClick={() =>
                      setPeriod(item)
                    }

                    className={`
                    px-4
                    py-1.5
                    rounded-full
                    text-xs
                    font-semibold
                    tracking-wide
                    duration-300

                    ${
                      period === item

                      ?

                      "bg-linear-to-r from-[var(--brand-1)] via-[var(--brand-2)] to-[var(--brand-3)] text-white shadow-[0_0_12px_rgb(var(--brand-1-rgb)/0.4)]"

                      :

                      "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    }
                    `}
                  >

                    {item}

                  </button>

                )

              )

            }

          </div>

        </div>

        <div
          className="
          h-72
          "
        >

          {hasEnoughData ? (

            <ResponsiveContainer>

              <LineChart data={chartData}>

                <defs>
                  <linearGradient id="performanceLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--brand-1)" />
                    <stop offset="50%" stopColor="var(--brand-2)" />
                    <stop offset="100%" stopColor="var(--brand-3)" />
                  </linearGradient>
                </defs>

                <Tooltip
                  contentStyle={{
                    background: "rgba(24,24,27,0.9)",
                    border: "1px solid rgb(var(--brand-1-rgb) / 0.3)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                  labelFormatter={(_, payload) => {
                    const ts = payload?.[0]?.payload?.timestamp;
                    return ts ? new Date(ts).toLocaleString() : "";
                  }}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, "Portfolio value"]}
                />

                <Line

                  dataKey="value"

                  stroke="url(#performanceLine)"

                  strokeWidth={4}

                  dot={false}

                />

              </LineChart>

            </ResponsiveContainer>

          ) : (

            // State jujur kalau histori belum cukup — daripada nampilin garis
            // palsu yang seolah-olah tren asli.
            <div className="h-full flex flex-col items-center justify-center text-center gap-2">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Not enough history yet for this period.
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 max-w-xs">
                Performance is tracked from your real balance each time you open
                this page. Check back after a bit more activity.
              </p>
            </div>

          )}

        </div>

      </div>

    </section>

  );

}