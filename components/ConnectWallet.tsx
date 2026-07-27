"use client";

import { useAppKit } from "@reown/appkit/react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import ThemeToggle from "./ui/ThemeToggle";
import BrandThemeToggle from "./ui/BrandThemeToggle";
import { useThemeStyle } from "@/context/ThemeStyleContext";

const NAV_ITEMS = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/agents", label: "Jobs" },
  { href: "/swap", label: "Swap" },
  { href: "/bridge", label: "Bridge" },
  { href: "/send", label: "Send" },
  { href: "/genesis", label: "My Genesis" },
];

export default function ConnectWallet() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const appKit = useAppKit();
  const { address, isConnected } = useAccount();
  const { theme } = useThemeStyle();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isFrutiger = theme === "frutiger";

  return (
    <header className="fixed top-5 left-0 right-0 z-50">
      <div className="max-w-[1800px] mx-auto px-6">
        <div
          className={
            isFrutiger
              ? `
                relative overflow-hidden rounded-full px-6 py-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-4
                bg-gradient-to-b from-white/60 via-sky-100/40 to-cyan-300/20
                dark:from-white/[0.07] dark:via-sky-400/[0.06] dark:to-cyan-500/[0.08]
                backdrop-blur-2xl
                border border-white/70 dark:border-white/10
                shadow-[0_8px_32px_rgba(14,165,233,0.25),inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-6px_16px_rgba(59,130,246,0.12)]
                dark:shadow-[0_8px_40px_rgba(2,132,199,0.35),inset_0_1px_1px_rgba(255,255,255,0.12),inset_0_-6px_20px_rgba(8,145,178,0.15)]
              `
              : `
                relative overflow-hidden rounded-full px-6 py-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-4
                bg-white/70 dark:bg-zinc-900/60
                backdrop-blur-2xl
                shadow-[0_10px_50px_rgba(0,0,0,.08)]
                dark:shadow-[0_10px_50px_rgba(0,0,0,.4),0_0_40px_rgba(168,85,247,0.06)]
                border border-black/5 dark:border-transparent
              `
          }
        >
          {isFrutiger && (
            <>
              {/* Glass reflection strip — signature Frutiger highlight */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-3 top-1 h-1/2 rounded-full bg-gradient-to-b from-white/80 to-transparent dark:from-white/20 blur-[1px]"
              />
              {/* Ambient liquid glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-cyan-300/30 dark:bg-cyan-400/10 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-sky-400/20 dark:bg-sky-500/10 blur-3xl"
              />
            </>
          )}

          {/* Logo */}
          <Link href="/" className="relative z-10 flex items-center gap-2.5 shrink-0 justify-self-start">
            {isFrutiger ? (
              <div
                className="
                relative flex items-center justify-center h-10 w-10 rounded-full
                bg-gradient-to-b from-white/90 via-sky-100/60 to-cyan-200/40
                dark:from-white/10 dark:via-sky-400/10 dark:to-cyan-500/10
                border border-white/80 dark:border-white/10
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-3px_6px_rgba(56,189,248,0.25),0_2px_8px_rgba(14,165,233,0.25)]
                "
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-1.5 top-1 h-1/3 rounded-full bg-white/80 dark:bg-white/25 blur-[1px]"
                />
                <Image
                  src="/logo.png"
                  alt="Axoo"
                  width={28}
                  height={28}
                  priority
                  className="relative drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]"
                />
              </div>
            ) : (
              <Image
                src="/logo.png"
                alt="Axoo"
                width={38}
                height={38}
                priority
                className="drop-shadow-[0_0_8px_rgba(217,70,239,.4)]"
              />
            )}

            <span
              className={
                isFrutiger
                  ? "text-2xl font-black bg-gradient-to-b from-sky-500 via-cyan-500 to-blue-600 dark:from-sky-300 dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent tracking-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.6)] dark:drop-shadow-none"
                  : "text-2xl font-black bg-linear-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent tracking-tight"
              }
            >
              Axoo
            </span>
          </Link>

          {/* Nav — centered via grid's middle column, not absolute positioning,
              so it never overlaps the right-side controls anymore */}
          <nav className="relative z-10 hidden lg:flex items-center gap-1 justify-self-center min-w-0 whitespace-nowrap">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isFrutiger
                      ? `relative px-3.5 py-2 rounded-full text-xs font-mono uppercase tracking-widest duration-300 ${
                          active
                            ? "text-sky-700 dark:text-cyan-200 bg-gradient-to-b from-white/70 to-cyan-100/40 dark:from-white/10 dark:to-cyan-400/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_6px_rgba(14,165,233,0.2)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                            : "text-slate-500 hover:text-sky-700 dark:text-slate-400 dark:hover:text-cyan-200 hover:bg-white/40 dark:hover:bg-white/[0.06]"
                        }`
                      : `relative px-3.5 py-2 text-xs font-mono uppercase tracking-widest duration-300 ${
                          active
                            ? "text-zinc-900 dark:text-white"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                        }`
                  }
                >
                  {item.label}

                  {active && (
                    <span
                      className={
                        isFrutiger
                          ? "absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-1.5 w-1.5 rounded-full bg-gradient-to-b from-lime-300 to-cyan-400 shadow-[0_0_6px_rgba(163,230,53,0.8)]"
                          : "absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-0.5 w-5 rounded-full bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 shadow-[0_0_6px_rgba(168,85,247,0.6)]"
                      }
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="relative z-10 flex items-center gap-3 shrink-0 justify-self-end">
            <ThemeToggle />
            <BrandThemeToggle />

            <button
              onClick={() => appKit.open()}
              className={
                isFrutiger
                  ? "group relative overflow-hidden px-4 py-2 rounded-full text-sm font-semibold font-mono text-white bg-gradient-to-b from-sky-400 via-cyan-500 to-blue-600 border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-4px_10px_rgba(2,132,199,0.4),0_4px_16px_rgba(14,165,233,0.4)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-4px_10px_rgba(2,132,199,0.5),0_6px_22px_rgba(14,165,233,0.55)] hover:scale-[1.02] duration-300 flex items-center gap-2"
                  : "relative overflow-hidden px-4 py-2 rounded-full text-sm font-semibold font-mono text-white bg-linear-to-r from-purple-600 via-pink-500 to-blue-500 shadow-[0_0_16px_rgba(168,85,247,0.3)] hover:shadow-[0_0_22px_rgba(168,85,247,0.45)] hover:scale-[1.02] duration-300 flex items-center gap-2"
              }
            >
              {isFrutiger && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-[120%] group-hover:translate-x-[420%] transition-transform duration-700 ease-out"
                />
              )}

              {isConnected && address && (
                <span
                  className={
                    isFrutiger
                      ? "relative h-1.5 w-1.5 rounded-full bg-lime-300 shadow-[0_0_6px_rgba(163,230,53,0.9)] animate-pulse"
                      : "h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse"
                  }
                />
              )}
              <span className="relative">
                {isConnected && address
                  ? `${address.slice(0, 6)}...${address.slice(-4)}`
                  : "Connect Wallet"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}