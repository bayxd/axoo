"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
  amount: string;
  tokenIn: string;
  tokenOut: string;
  date: string;
  txHash?: string;
  explorerUrl?: string;
};

export default function SwapHistory() {

  const [history, setHistory] =
    useState<HistoryItem[]>([]);

  useEffect(() => {

    const data =
      localStorage.getItem(
        "swapHistory"
      );

    if (data) {

      setHistory(
        JSON.parse(data)
      );

    }

  }, []);

  return (

    <section
      className="
        relative
        w-full
        max-w-[600px]
        mx-auto
        overflow-hidden
        bg-white/80 dark:bg-zinc-900/80
        backdrop-blur-xl glass-panel
        border
        border-black/5 dark:border-white/10
        rounded-[28px]
        p-6
        shadow-2xl
      "
    >

      {/* neon top strip */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[var(--brand-3)] via-[var(--brand-2)] to-[var(--brand-1)]" />

      {/* HUD corner brackets - matches SwapCard, was missing here before */}
      <div className="pointer-events-none absolute top-3 left-3 h-3 w-3 border-t border-l border-[rgb(var(--brand-1-rgb)/0.5)] rounded-tl-sm hud-corner" />
      <div className="pointer-events-none absolute top-3 right-3 h-3 w-3 border-t border-r border-[rgb(var(--brand-3-rgb)/0.5)] rounded-tr-sm hud-corner" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b border-l border-[rgb(var(--brand-1-rgb)/0.25)] rounded-bl-sm hud-corner" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b border-r border-[rgb(var(--brand-3-rgb)/0.25)] rounded-br-sm hud-corner" />

      {/* subtle dot grid texture - matches SwapCard, was missing here before */}
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
          mb-4
          "
        >

          <h2
            className="
            text-base
            font-bold
            tracking-tight
            text-zinc-900
            dark:text-white
            "
          >
            Swap History
          </h2>

          <span
            className="
            text-[10px]
            font-mono
            uppercase
            tracking-widest
            text-zinc-500
            dark:text-zinc-500
            "
          >
            {history.length} {history.length === 1 ? "entry" : "entries"}
          </span>

        </div>

        {

          history.length === 0

          ?

          <div
            className="
            text-zinc-500
            dark:text-zinc-500
            text-center
            py-8
            text-xs
            font-mono
            "
          >
            No transactions yet
          </div>

          :

            <div
              className="
              space-y-2
              max-h-72
              overflow-y-auto
              pr-1.5
              "
            >

            {

              history.map(
                (
                  item,
                  index
                ) => (

                  <div

                    key={index}

                    className="
                    relative
                    bg-zinc-100/60 dark:bg-zinc-800/60
                    border
                    border-black/5 dark:border-white/5
                    rounded-xl
                    pl-3.5
                    pr-3
                    py-2.5
                    hover:border-[rgb(var(--brand-1-rgb)/0.2)]
                    duration-200
                    "

                  >

                    <span
                      className="
                      absolute
                      left-0
                      top-2.5
                      bottom-2.5
                      w-0.5
                      rounded-full
                      bg-linear-to-b
                      from-[var(--brand-1)]
                      to-[var(--brand-3)]
                      "
                    />

                    <div
                      className="
                      flex
                      items-center
                      justify-between
                      "
                    >

                      <div
                        className="
                        text-sm
                        font-semibold
                        font-mono
                        text-zinc-900
                        dark:text-zinc-100
                        "
                      >
                        {item.amount}
                        {" "}
                        {item.tokenIn}
                        <span className="text-zinc-500 dark:text-zinc-500 mx-1.5">→</span>
                        {item.tokenOut}
                      </div>

                      {

                      item.txHash &&

                      <a

                        href={item.explorerUrl}

                        target="_blank"

                        rel="noreferrer"

                        className="
                        text-[var(--brand-1)] dark:text-[var(--brand-1-dark)]
                        text-[10px]
                        font-medium
                        hover:opacity-80
                        shrink-0
                        ml-2
                        "

                      >

                        View ↗

                      </a>

                    }

                    </div>

                    <div
                      className="
                      text-zinc-500
                      dark:text-zinc-500
                      text-[10px]
                      font-mono
                      mt-1
                      "
                    >
                      {item.date}
                    </div>

                  </div>

                )

              )

            }

          </div>

        }

      </div>

    </section>

  );

}