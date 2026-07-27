"use client";

import RegisterAgentCard from "@/components/pay/escrow/RegisterAgentCard";
import ConnectWallet from "@/components/ConnectWallet";
import JobBoard from "@/components/pay/escrow/JobBoard";
import RequireGenesisPass from "@/components/nft/RequireGenesisPass";
import CyberpunkBackground from "@/components/ui/CyberpunkBackground";
import Footer from "@/components/dashboard/Footer";
import AgentDashboard from "@/components/pay/escrow/AgentDashboard";

export default function AgentsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-zinc-900 dark:text-white flex flex-col">
      <CyberpunkBackground />

      <ConnectWallet />

      <div className="flex-1 flex flex-col">
        <RequireGenesisPass>
          <div className="relative z-10 w-full max-w-[1800px] mx-auto px-6 pt-32 pb-10">
            {/* Hero */}
            <section className="max-w-4xl mx-auto text-center mb-10">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.14em] text-zinc-600 dark:text-zinc-400 border border-black/10 dark:border-white/10 rounded-full px-4 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_theme(colors.emerald.400)]" />
                ARC TESTNET · ERC-8004 + ERC-8183 LIVE
              </div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                <span className="bg-linear-to-r from-[var(--brand-1)] via-[var(--brand-2)] to-[var(--brand-3)] bg-clip-text text-transparent">
                  Purchase Orders,
                </span>
                <br />
                Settled in Escrow.
              </h1>

              <p className="text-zinc-500 text-sm max-w-lg mx-auto mt-5 leading-relaxed">
                  Register a verified trade identity, issue purchase orders or invoices, 
                  and get paid in USDC through Arc's ERC-8183 Agentic Commerce contract. 
                  Funds stay in escrow until delivery is confirmed - no custom contracts, no IOUs.
              </p>
            </section>

            {/* Cards */}
            <section className="max-w-3xl mx-auto space-y-8">
              <RegisterAgentCard />
              <JobBoard />
              <AgentDashboard />
            </section>

            {/* Footer stats */}
            <section className="max-w-4xl mx-auto mt-16">
              <div className="flex justify-center gap-6 flex-wrap text-[12px] font-mono text-zinc-600">
                <span>USDC</span>
                <span className="text-zinc-300 dark:text-zinc-800">|</span>
                <span>
                  Chain: <b className="text-zinc-600 dark:text-zinc-400">Arc-Testnet</b>
                </span>
                <span className="text-zinc-300 dark:text-zinc-800">|</span>
                <span>
                  Escrow: <b className="text-emerald-600 dark:text-emerald-400">ERC-8183</b>
                </span>
                <span className="text-zinc-300 dark:text-zinc-800">|</span>
                <span>
                  Identity: <b className="text-emerald-600 dark:text-emerald-400">ERC-8004</b>
                </span>
              </div>
            </section>
          </div>
        </RequireGenesisPass>
      </div>

      <Footer />
    </main>
  );
}