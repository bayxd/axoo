"use client";

import Link from "next/link";
import { useState } from "react";
import ConnectWallet from "@/components/ConnectWallet";
import Footer from "@/components/dashboard/Footer";
import { useAppKit } from "@reown/appkit/react";

const STEPS = [
  {
    n: "01",
    title: "Connect your wallet",
    body: "Link any EVM wallet to get started on Arc Testnet — no signup, no forms.",
  },
  {
    n: "02",
    title: "Mint a Genesis Pass",
    body: "A free onchain pass that unlocks Swap, Bridge, Send, and Escrow. One-time mint, gas sponsored.",
  },
  {
    n: "03",
    title: "Move money your way",
    body: "Swap stablecoins, bridge across chains, send instantly, or settle a trade deal in escrow.",
  },
];

const FEATURES = [
  {
    href: "/swap",
    tag: "// Dex Terminal",
    title: "Swap",
    body: "Trade USDC ⇄ EURC instantly on Arc Testnet with minimal slippage.",
    badge: null,
  },
  {
    href: "/bridge",
    tag: "// Cross-Chain Relay",
    title: "Bridge",
    body: "Move USDC between Arc, Base, Ethereum, Arbitrum, and Polygon testnets.",
    badge: null,
  },
  {
    href: "/send",
    tag: "// Instant Transfer",
    title: "Send",
    body: "Send USDC to any wallet address in seconds, with sponsored gas.",
    badge: null,
  },
  {
    href: "/agents",
    tag: "// Counterparty Identity",
    title: "Escrow",
    body: "Register a verified trade identity, issue purchase orders, and get paid in USDC — funds stay locked until delivery is confirmed.",
    badge: "New",
  },
];

const TRUST_POINTS = [
  { label: "Non-custodial", detail: "Your keys, your funds — always" },
  { label: "Open standards", detail: "Built on ERC-8004 + ERC-8183" },
  { label: "Testnet only", detail: "No real funds are at risk right now" },
  { label: "Sponsored gas", detail: "Powered by Circle on Arc Testnet" },
];

const ROADMAP = [
  {
    phase: "Phase 1",
    title: "Foundation",
    status: "live" as const,
    items: [
      "Wallet connect + gas-sponsored Genesis Pass mint",
      "USDC ⇄ EURC swap on Arc Testnet",
      "Cross-chain USDC bridging (Base, Ethereum, Arbitrum, Polygon)",
      "Instant peer-to-peer USDC send",
    ],
  },
  {
    phase: "Phase 2",
    title: "Trusted Trade Infrastructure",
    status: "live" as const,
    items: [
      "Onchain agent identity via ERC-8004",
      "Escrow-backed purchase orders via ERC-8183",
      "Reputation feedback after job completion",
    ],
  },
  {
    phase: "Phase 3",
    title: "AI Agent Trust Layer",
    status: "planned" as const,
    items: [
      "ReputationHook — auto-write job outcomes to the ERC-8004 Reputation Registry on every completion, instead of manual feedback",
      "ReputationGateHook — require a minimum reputation score before a provider can be funded for a job",
      "AI evaluator agent — an LLM-based evaluator that checks deliverables against the job description automatically, instead of the client self-evaluating",
      "SLAHook — auto-refund the client if a provider misses the job's expiry deadline",
    ],
  },
  {
    phase: "Phase 4",
    title: "Agentic Payments & Discovery",
    status: "planned" as const,
    items: [
      "x402 / Circle Nanopayments for sub-cent, pay-per-call agent services — complements ERC-8183 escrow for larger multi-step jobs",
      "MCP / Agent Card support so external AI agents (not just humans in this UI) can discover and hire ARCora agents programmatically",
      "Public agent directory ranked by onchain ERC-8004 reputation",
      "Mainnet launch on Arc after a security audit",
    ],
  },
];

const ROADMAP_STATUS_STYLE: Record<
  "live" | "in-progress" | "planned",
  { label: string; dot: string; badge: string }
> = {
  live: {
    label: "Live",
    dot: "bg-emerald-400",
    badge:
      "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border-emerald-500/30",
  },
  "in-progress": {
    label: "In Progress",
    dot: "bg-blue-400",
    badge:
      "bg-blue-500/15 text-[var(--brand-3)] dark:text-[var(--brand-3-dark)] border-blue-500/30",
  },
  planned: {
    label: "Planned",
    dot: "bg-zinc-400 dark:bg-zinc-500",
    badge:
      "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20",
  },
};

const FAQS = [
  {
    q: "What is Arc Testnet?",
    a: "Arc is a testnet chain used to try out ARCora's features — swaps, bridging, sends, and escrow-backed trade — before anything goes live with real funds.",
  },
  {
    q: "What's a Genesis Pass, and why do I need one?",
    a: "It's a free onchain pass minted to your wallet. It unlocks access to Swap, Bridge, Send, and Escrow. It's a one-time mint, and gas is sponsored — it won't cost you anything on testnet.",
  },
  {
    q: "How does Escrow keep my trade safe?",
    a: "When you create a purchase order, the buyer's USDC is held in an onchain escrow contract (ERC-8183) rather than sent directly to the seller. Funds only release once delivery is confirmed, so neither side has to trust the other blindly.",
  },
  {
    q: "What's the difference between Swap and Escrow?",
    a: "Swap is for exchanging one token for another (USDC ⇄ EURC) immediately. Escrow is for trade deals between two parties — a buyer and a supplier — where funds need to stay locked until a condition (like delivery) is met.",
  },
  {
    q: "Do I need real money to try this?",
    a: "No. Everything runs on Arc Testnet with test tokens and sponsored gas, so you can explore every feature without spending anything real.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-black/5 dark:border-white/5 py-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <span className="text-sm md:text-base font-semibold text-zinc-900 dark:text-white">
          {q}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-zinc-400 transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {open && (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
          {a}
        </p>
      )}
    </div>
  );
}

export default function Page() {
  const appKit = useAppKit();

  return (
    <main className="min-h-screen text-zinc-900 dark:text-white">

      <ConnectWallet />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[85vh] overflow-hidden px-6 pt-32">

        {/* grid backdrop */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15] cyber-grid-backdrop"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(var(--brand-1-rgb)/0.35) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--brand-1-rgb)/0.35) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 60% 55% at 50% 42%, black 30%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 55% at 50% 42%, black 30%, transparent 100%)",
          }}
        />

        {/* glow background */}
        <div className="absolute w-125 h-125 bg-[rgb(var(--brand-1-rgb)/0.2)] blur-[120px] rounded-full ambient-orb" />
        <div className="absolute w-87.5 h-87.5 bg-[rgb(var(--brand-2-rgb)/0.2)] blur-[100px] rounded-full ambient-orb" style={{ animationDelay: "1.2s" }} />

        {/* eyebrow status tag */}
        <div className="relative z-10 mb-7 flex items-center gap-2 rounded-full border border-[rgb(var(--brand-1-rgb)/0.3)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur px-4 py-1.5 shadow-[0_0_16px_rgb(var(--brand-1-rgb)/0.15)]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Arc Testnet · Network Online
          </span>
        </div>

        {/* orb centerpiece with HUD rings */}
        <div className="relative z-10 w-56 h-56 flex items-center justify-center mb-10">

          <div
            className="absolute inset-0 rounded-full border border-dashed border-[rgb(var(--brand-1-rgb)/0.3)] animate-spin hud-corner"
            style={{ animationDuration: "22s" }}
          />

          <div
            className="absolute inset-6 rounded-full border border-[rgb(var(--brand-3-rgb)/0.2)] animate-spin hud-corner"
            style={{ animationDuration: "14s", animationDirection: "reverse" }}
          />

          <div className="pointer-events-none absolute -top-1 -left-1 h-4 w-4 border-t border-l border-[rgb(var(--brand-1-rgb)/0.6)] hud-corner" />
          <div className="pointer-events-none absolute -top-1 -right-1 h-4 w-4 border-t border-r border-[rgb(var(--brand-3-rgb)/0.6)] hud-corner" />
          <div className="pointer-events-none absolute -bottom-1 -left-1 h-4 w-4 border-b border-l border-[rgb(var(--brand-1-rgb)/0.3)] hud-corner" />
          <div className="pointer-events-none absolute -bottom-1 -right-1 h-4 w-4 border-b border-r border-[rgb(var(--brand-3-rgb)/0.3)] hud-corner" />

          <div
            className="absolute inset-0 animate-spin hud-corner"
            style={{ animationDuration: "9s" }}
          >
            <span className="absolute top-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-[var(--brand-3)] shadow-[0_0_8px_var(--brand-3)]" />
          </div>
          <div
            className="absolute inset-0 animate-spin hud-corner"
            style={{ animationDuration: "13s", animationDirection: "reverse" }}
          >
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-[var(--brand-2)] shadow-[0_0_8px_var(--brand-2)]" />
          </div>

          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-linear-to-tr from-[var(--brand-1)] via-[var(--brand-2)] to-[var(--brand-3)] animate-spin-slow shadow-2xl hero-orb" />
        </div>

        {/* headline */}
        <h1 className="relative z-10 text-center text-4xl sm:text-6xl font-black tracking-tight mb-4 leading-tight">
          <span className="bg-linear-to-r from-[var(--brand-1)] via-[var(--brand-2)] to-[var(--brand-3)] bg-clip-text text-transparent">
            Swap, Bridge, and Trade 
          </span>
          <br />
          <span>Escrow-Backed When It Counts.</span>
        </h1>

        <p className="relative z-10 text-zinc-500 dark:text-zinc-400 text-center max-w-lg mb-8 text-sm leading-relaxed">
          Cross-chain stablecoin payments for individuals. Verified trade identity
          and escrow-protected purchase orders for business. Powered by Circle on Arc Testnet.
        </p>

        {/* CTA buttons */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/swap"
            className="
            h-12
            px-6
            rounded-xl
            text-sm
            font-bold
            uppercase
            tracking-wide
            text-white
            bg-linear-to-r
            from-[var(--brand-1)]
            via-[var(--brand-2)]
            to-[var(--brand-3)]
            shadow-[0_0_20px_rgb(var(--brand-1-rgb)/0.25)]
            hover:shadow-[0_0_28px_rgb(var(--brand-1-rgb)/0.4)]
            hover:scale-[1.02]
            duration-300
            flex
            items-center
            "
          >
            Launch App
          </Link>

          <Link
            href="/agents"
            className="
            h-12
            px-6
            rounded-xl
            text-sm
            font-semibold
            border
            border-black/10
            dark:border-white/10
            bg-white/70
            dark:bg-zinc-900/60
            backdrop-blur
            hover:border-[rgb(var(--brand-1-rgb)/0.3)]
            hover:bg-zinc-100
            dark:hover:bg-zinc-800
            duration-300
            flex
            items-center
            "
          >
            Explore Escrow
          </Link>
        </div>

        <p className="relative z-10 mt-4 text-[11px] font-mono text-zinc-500 dark:text-zinc-600">
          New here? You'll mint a free Genesis Pass the first time you launch the app — see how below.
        </p>

        {/* status ticker */}
        <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-zinc-500 dark:text-zinc-500">
          <div>
            <span className="text-[var(--brand-1)] dark:text-[var(--brand-1-dark)] font-semibold">USDC</span>
            <span className="mx-1.5 text-zinc-400 dark:text-zinc-700">·</span>
            <span className="text-zinc-500 dark:text-zinc-400">EURC</span>
          </div>
          <div className="h-3 w-px bg-black/10 dark:bg-white/10 hidden sm:block" />
          <div>
            Chain: <span className="text-[var(--brand-3)] dark:text-[var(--brand-3-dark)]">Arc-Testnet</span>
          </div>
          <div className="h-3 w-px bg-black/10 dark:bg-white/10 hidden sm:block" />
          <div>
            Gas: <span className="text-emerald-500 dark:text-emerald-400">Sponsored</span>
          </div>
        </div>

      </section>

      {/* How it works */}
      <section className="relative max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-[0.2em] text-[var(--brand-1)] dark:text-[var(--brand-1-dark)]/80 font-semibold uppercase mb-2 font-mono">
            // Getting Started
          </p>
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="
              relative
              bg-white/70
              dark:bg-zinc-900/70
              backdrop-blur-xl glass-panel
              border
              border-black/5
              dark:border-white/10
              rounded-3xl
              p-6
              "
            >
              <span className="text-4xl font-black bg-linear-to-r from-[var(--brand-1)] via-[var(--brand-2)] to-[var(--brand-3)] bg-clip-text text-transparent">
                {step.n}
              </span>
              <h3 className="text-lg font-bold mt-3 mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="relative max-w-5xl mx-auto px-6 py-10">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-[0.2em] text-[var(--brand-1)] dark:text-[var(--brand-1-dark)]/80 font-semibold uppercase mb-2 font-mono">
            // What You Can Do
          </p>
          <h2 className="text-3xl font-bold tracking-tight">Four ways to move money</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="
              group
              relative
              overflow-hidden
              bg-white/70
              dark:bg-zinc-900/70
              backdrop-blur-xl glass-panel
              border
              border-black/5
              dark:border-white/10
              rounded-3xl
              p-6
              hover:border-[rgb(var(--brand-1-rgb)/0.3)]
              duration-300
              "
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[var(--brand-1)] via-[var(--brand-2)] to-[var(--brand-3)] opacity-0 group-hover:opacity-100 duration-300" />

              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] tracking-[0.2em] text-[var(--brand-1)] dark:text-[var(--brand-1-dark)]/80 font-semibold uppercase font-mono">
                  {f.tag}
                </p>

                {f.badge && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30">
                    {f.badge}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {f.body}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust signals */}
      <section className="relative max-w-5xl mx-auto px-6 py-10">
        <div
          className="
          bg-white/70
          dark:bg-zinc-900/70
          backdrop-blur-xl glass-panel
          border
          border-black/5
          dark:border-white/10
          rounded-3xl
          p-8
          grid
          grid-cols-2
          md:grid-cols-4
          gap-6
          "
        >
          {TRUST_POINTS.map((t) => (
            <div key={t.label}>
              <p className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
                {t.label}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
                {t.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="relative max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-[0.2em] text-[var(--brand-1)] dark:text-[var(--brand-1-dark)]/80 font-semibold uppercase mb-2 font-mono">
            // Where We're Headed
          </p>
          <h2 className="text-3xl font-bold tracking-tight">Roadmap</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {ROADMAP.map((stage) => {
            const s = ROADMAP_STATUS_STYLE[stage.status];
            return (
              <div
                key={stage.phase}
                className="
                relative
                overflow-hidden
                bg-white/70
                dark:bg-zinc-900/70
                backdrop-blur-xl glass-panel
                border
                border-black/5
                dark:border-white/10
                rounded-3xl
                p-6
                "
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[var(--brand-1)] via-[var(--brand-2)] to-[var(--brand-3)]" />

                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] tracking-[0.2em] text-[var(--brand-1)] dark:text-[var(--brand-1-dark)]/80 font-semibold uppercase font-mono">
                    // {stage.phase}
                  </p>

                  <span
                    className={`flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${s.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-4">{stage.title}</h3>

                <ul className="space-y-2.5">
                  {stage.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed"
                    >
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-[var(--brand-1)] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.2em] text-[var(--brand-1)] dark:text-[var(--brand-1-dark)]/80 font-semibold uppercase mb-2 font-mono">
            // FAQ
          </p>
          <h2 className="text-3xl font-bold tracking-tight">Common questions</h2>
        </div>

        <div>
          {FAQS.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      <Footer />

    </main>
  );
}