"use client";

import { useAccount, useBalance } from "wagmi";

export default function AssetBreakdown() {

  const { address } =
    useAccount();

  const { data: usdc } =
    useBalance({

      address,

      token:
"0x3600000000000000000000000000000000000000" as `0x${string}`

    });

  const { data: eurc } =
    useBalance({

      address,

      token:
        "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as `0x${string}`

    });

  return (

    <section
      className="
      relative
      overflow-hidden
      bg-zinc-900/70
      backdrop-blur-xl
      border
      border-white/10
      rounded-3xl
      p-8
      shadow-2xl
      "
    >

 
      {/* subtle dot grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(var(--brand-1-rgb) / 0.7) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="relative">

        <p className="text-[10px] tracking-[0.2em] text-[var(--brand-1-dark)]/80 font-semibold uppercase mb-1 font-mono">
          // Balance Sheet
        </p>

        <h2
          className="
          text-2xl
          font-bold
          tracking-tight
          mb-8
          "
        >
          Asset
        </h2>

        <div
          className="
          space-y-3
          "
        >

          <div
            className="
            flex
            items-center
            justify-between
            bg-zinc-800/80
            border
            border-white/5
            rounded-2xl
            p-4
            hover:border-[rgb(var(--brand-1-rgb)/0.2)]
            duration-300
            "
          >
            <div className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--brand-1)", boxShadow: "0 0 6px var(--brand-1)" }}
              />
              <span className="text-zinc-400 text-xs uppercase tracking-widest font-semibold">
                USDC
              </span>
            </div>

            <span className="font-mono font-bold text-lg tabular-nums">

              {

                Number(
                  usdc?.formatted ?? 0
                )

                .toFixed(2)

              }

            </span>

          </div>

          <div
            className="
            flex
            items-center
            justify-between
            bg-zinc-800/80
            border
            border-white/5
            rounded-2xl
            p-4
            hover:border-[rgb(var(--brand-3-rgb)/0.2)]
            duration-300
            "
          >
            <div className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--brand-3)", boxShadow: "0 0 6px var(--brand-3)" }}
              />
              <span className="text-zinc-400 text-xs uppercase tracking-widest font-semibold">
                EURC
              </span>
            </div>

            <span className="font-mono font-bold text-lg tabular-nums">

              {

                Number(
                  eurc?.formatted ?? 0
                )

                .toFixed(2)

              }

            </span>

          </div>

        </div>

      </div>

    </section>

  );

}