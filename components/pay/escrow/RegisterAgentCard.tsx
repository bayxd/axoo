"use client";

import { useAgentIdentity } from "@/hooks/pay/escrow/useAgentIdentity";

export default function RegisterAgentCard() {
  const { status, isRegistered, agentId, register } = useAgentIdentity();

  return (
    <section
      className="
      relative
      overflow-hidden
      bg-white/80 dark:bg-zinc-900/80
      backdrop-blur-xl glass-panel
      border
      border-black/5 dark:border-white/10
      rounded-[28px]
      p-6
      shadow-2xl
      w-full
      max-w-200
      "
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[var(--brand-1)] via-[var(--brand-2)] to-[var(--brand-3)]" />

      <div className="pointer-events-none absolute top-3 left-3 h-3 w-3 border-t border-l border-[rgb(var(--brand-1-rgb)/0.5)] rounded-tl-sm hud-corner" />
      <div className="pointer-events-none absolute top-3 right-3 h-3 w-3 border-t border-r border-[rgb(var(--brand-3-rgb)/0.5)] rounded-tr-sm hud-corner" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b border-l border-[rgb(var(--brand-1-rgb)/0.25)] rounded-bl-sm hud-corner" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b border-r border-[rgb(var(--brand-3-rgb)/0.25)] rounded-br-sm hud-corner" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] dot-grid-texture"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(var(--brand-1-rgb) / 0.7) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-7">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-[var(--brand-1)]/80 dark:text-[var(--brand-1-dark)]/80 font-semibold uppercase mb-1">
              // Counterparty Identity
            </p>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Trade Identity Registry</h2>
          </div>

          <div
            className="
            bg-[rgb(var(--brand-1-rgb)/0.15)]
            border
            border-[rgb(var(--brand-1-rgb)/0.3)]
            rounded-full
            px-3
            py-1
            text-[var(--brand-1)] dark:text-[var(--brand-1-dark)]
            text-[10px]
            font-mono
            font-semibold
            tracking-widest
            "
          >
            ERC-8004
          </div>
        </div>

        {isRegistered ? (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 text-sm">
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Registered on Arc</p>
            <p className="text-zinc-500 font-mono text-xs mt-1">
              Agent ID #{agentId !== undefined ? agentId.toString() : "…"}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-zinc-500 leading-relaxed mb-5">
              Register a verified onchain identity so buyers and suppliers can find you,
              check your history, and leave feedback after each deal.
            </p>

            <button
              className="
              group
              relative
              w-full
              h-12
              rounded-xl
              text-sm
              font-bold
              tracking-wide
              uppercase
              overflow-hidden
              bg-linear-to-r
              from-[var(--brand-1)]
              via-[var(--brand-2)]
              to-[var(--brand-3)]
              hover:scale-[1.01]
              active:scale-[0.99]
              duration-300
              shadow-[0_0_20px_rgb(var(--brand-1-rgb)/0.25)]
              hover:shadow-[0_0_28px_rgb(var(--brand-1-rgb)/0.4)]
              disabled:opacity-50
              disabled:hover:scale-100
              "
              disabled={status === "registering"}
              onClick={() => register("ipfs://arcora-agent-metadata")}
            >
              <span className="relative z-10">
                {status === "registering" ? "Registering..." : "Register Trade Identity"}
              </span>
            </button>
          </>
        )}
      </div>
    </section>
  );
}