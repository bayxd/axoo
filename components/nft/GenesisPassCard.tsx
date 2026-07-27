"use client";

import Image from "next/image";
import { useRef, useState } from "react";

const BADGE_IMAGE =
  "https://gateway.pinata.cloud/ipfs/bafybeicopxxir4psbrcyezerivqfokx3qabnc3k3uczpefjyv225x3kojy";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GENESIS_PASS_CONTRACT;

// Fixed (not Math.random()) so server-rendered and hydrated markup match -
// randomizing these per-render would cause a hydration mismatch warning.
const SPARKLES = [
  { left: "12%", top: "18%", delay: "0s", duration: "3.2s", size: 3 },
  { left: "82%", top: "22%", delay: "0.6s", duration: "4s", size: 2 },
  { left: "68%", top: "72%", delay: "1.2s", duration: "3.6s", size: 3 },
  { left: "20%", top: "80%", delay: "1.8s", duration: "3.9s", size: 2 },
  { left: "90%", top: "55%", delay: "0.3s", duration: "3.4s", size: 2 },
  { left: "8%", top: "50%", delay: "2.1s", duration: "4.2s", size: 3 },
  { left: "50%", top: "10%", delay: "1.5s", duration: "3.7s", size: 2 },
  { left: "58%", top: "90%", delay: "0.9s", duration: "3.3s", size: 2 },
];

export default function GenesisPassCard() {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [sheen, setSheen] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = badgeRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    setTilt({ rx: (0.5 - py) * 16, ry: (px - 0.5) * 16 });
    setSheen({ x: px * 100, y: py * 100 });
  }

  function handleMouseLeave() {
    setTilt({ rx: 0, ry: 0 });
    setHovering(false);
  }

  return (
    <section className="relative overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl glass-panel border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-2xl max-w-lg mx-auto genesis-card">

      {/* animated shimmer top strip (replaces the static gradient strip) */}
      <div className="absolute top-0 left-0 right-0 h-0.5 shimmer-strip" />

      {/* HUD corner brackets */}
      <div className="pointer-events-none absolute top-3 left-3 h-3 w-3 border-t border-l border-[rgb(var(--brand-1-rgb)/0.5)] rounded-tl-sm hud-corner" />
      <div className="pointer-events-none absolute top-3 right-3 h-3 w-3 border-t border-r border-[rgb(var(--brand-3-rgb)/0.5)] rounded-tr-sm hud-corner" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b border-l border-[rgb(var(--brand-1-rgb)/0.25)] rounded-bl-sm hud-corner" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b border-r border-[rgb(var(--brand-3-rgb)/0.25)] rounded-br-sm hud-corner" />

      <div className="relative">

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-[var(--brand-1)]/80 dark:text-[var(--brand-1-dark)]/80 font-semibold uppercase mb-1">
              // Genesis Registry
            </p>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">My Genesis Pass</h2>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold tracking-wide text-emerald-600 dark:text-emerald-400 uppercase">
              Owned
            </span>
          </div>
        </div>

        {/* 3D tilt + sheen + sparkles wrapper */}
        <div
          ref={badgeRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={handleMouseLeave}
          className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 badge-wrapper"
          style={{
            transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${hovering ? 1.02 : 1})`,
          }}
        >
          {/* soft pulsing glow behind the badge */}
          <div className="pointer-events-none absolute inset-0 badge-glow" />

          <Image
            src={BADGE_IMAGE}
            width={400}
            height={400}
            alt="ARCora Genesis Pass"
            className="w-full relative z-10"
          />

          {/* cursor-following glossy sheen, only visible on hover */}
          <div
            className="pointer-events-none absolute inset-0 z-20 sheen"
            style={{
              opacity: hovering ? 1 : 0,
              background: `radial-gradient(circle at ${sheen.x}% ${sheen.y}%, rgba(255,255,255,0.28), transparent 42%)`,
            }}
          />

          {/* floating sparkles */}
          {SPARKLES.map((s, i) => (
            <span
              key={i}
              className="pointer-events-none absolute z-20 rounded-full sparkle"
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                animationDelay: s.delay,
                animationDuration: s.duration,
              }}
            />
          ))}
        </div>

        <div className="mt-5">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Axoo Early Access Badge</h3>
          <p className="text-zinc-500 text-sm mt-1">Genesis Collection</p>
        </div>

        <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-500">Collection</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Genesis</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Network</span>
            <span className="text-[var(--brand-1)] dark:text-[var(--brand-1-dark)] font-medium">Arc Testnet</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Contract</span>
            <span className="font-mono text-zinc-900 dark:text-zinc-100">
              {CONTRACT_ADDRESS
                ? `${CONTRACT_ADDRESS.slice(0, 6)}...${CONTRACT_ADDRESS.slice(-4)}`
                : "-"}
            </span>
          </div>
        </div>

        {CONTRACT_ADDRESS && (
          <a
            href={`https://testnet.arcscan.app/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="
            explorer-link
            block
            text-center
            mt-5
            bg-zinc-100
            dark:bg-zinc-800
            text-zinc-900
            dark:text-zinc-100
            border
            border-black/5
            dark:border-white/5
            hover:border-[rgb(var(--brand-1-rgb)/0.4)]
            duration-300
            rounded-xl
            py-2.5
            text-xs
            font-semibold
            "
          >
            View Contract on Explorer {"->"}
          </a>
        )}

      </div>

      <style>{`
        .shimmer-strip {
          background: linear-gradient(
            90deg,
            var(--brand-1),
            var(--brand-2),
            var(--brand-3),
            var(--brand-1)
          );
          background-size: 300% 100%;
          animation: shimmerMove 4s linear infinite;
        }
        @keyframes shimmerMove {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 300% 50%;
          }
        }

        .badge-wrapper {
          transition: transform 150ms ease-out;
          transform-style: preserve-3d;
        }

        .badge-glow {
          background: radial-gradient(
            circle at 50% 50%,
            rgb(var(--brand-1-rgb) / 0.35),
            transparent 65%
          );
          animation: glowPulse 3.5s ease-in-out infinite;
        }
        @keyframes glowPulse {
          0% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.08);
          }
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
        }

        .sheen {
          transition: opacity 200ms ease-out;
          mix-blend-mode: overlay;
        }

        .sparkle {
          background: white;
          box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.8);
          animation-name: sparkleFloat;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes sparkleFloat {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.6);
          }
          50% {
            opacity: 1;
            transform: translateY(-8px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(0) scale(0.6);
          }
        }

        .explorer-link {
          position: relative;
          overflow: hidden;
          transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
        }
        .explorer-link:hover {
          transform: scale(1.015);
          box-shadow: 0 0 20px rgb(var(--brand-1-rgb) / 0.25);
        }

        .genesis-card {
          transition: box-shadow 300ms ease;
        }
        .genesis-card:hover {
          box-shadow: 0 0 40px rgb(var(--brand-1-rgb) / 0.12);
        }
      `}</style>
    </section>
  );
}