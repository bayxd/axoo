"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAccount, useReadContract } from "wagmi";
import { CHAINS } from "@/constants/chains";
import { useBridge } from "@/hooks/bridge/useBridge";
import { useBalances } from "@/hooks/portfolio/useBalances";
import NetworkSelector from "@/components/network/NetworkSelector";

// Official Circle testnet USDC addresses (source: circlefin/skills use-usdc
// SKILL.md). These are only used to read the connected wallet's balance on
// the external chain for display -- bridging itself still goes through
// useBridge()/kit.bridge(), this doesn't change that at all.
const EXTERNAL_USDC: Record<
  string,
  { address: `0x${string}`; chainId: number; decimals: number }
> = {
  Base_Sepolia: {
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    chainId: 84532,
    decimals: 6,
  },
  Ethereum_Sepolia: {
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    chainId: 11155111,
    decimals: 6,
  },
  Arbitrum_Sepolia: {
    address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    chainId: 421614,
    decimals: 6,
  },
  Polygon_Amoy_Testnet: {
    address: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    chainId: 80002,
    decimals: 6,
  },
};

const ERC20_BALANCE_OF_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const NETWORK_OPTIONS = [
  { value: "Base_Sepolia", label: "Base Sepolia", dot: "#3B82F6" },
  { value: "Ethereum_Sepolia", label: "Ethereum Sepolia", dot: "#818CF8" },
  { value: "Arbitrum_Sepolia", label: "Arbitrum Sepolia", dot: "#38BDF8" },
  { value: "Polygon_Amoy_Testnet", label: "Polygon Amoy", dot: "#A78BFA" }
];

const ARC_DOT = "#EC4899";

export default function BridgeCard() {

  const [amount, setAmount] = useState("1");
  const [otherChain, setOtherChain] = useState("Base_Sepolia");
  const [direction, setDirection] = useState<"toArc" | "fromArc">("toArc");
  const [loading, setLoading] = useState(false);

  const fromChain =
    direction === "toArc" ? otherChain : CHAINS.ARC_TESTNET;

  const toChain =
    direction === "toArc" ? CHAINS.ARC_TESTNET : otherChain;

  const otherChainInfo =
    NETWORK_OPTIONS.find((n) => n.value === otherChain) ?? NETWORK_OPTIONS[0];

  const fromDot = direction === "toArc" ? otherChainInfo.dot : ARC_DOT;
  const toDot = direction === "toArc" ? ARC_DOT : otherChainInfo.dot;
  const fromLabel = direction === "toArc" ? otherChainInfo.label : "Arc Testnet";
  const toLabel = direction === "toArc" ? "Arc Testnet" : otherChainInfo.label;

  const { bridge: executeBridge } = useBridge();
  const { address: connectedAddress } = useAccount();
  const { usdcBalance } = useBalances();

  const externalTokenInfo = EXTERNAL_USDC[otherChain];

  // Reads the connected wallet's USDC balance directly on the external
  // chain. Requires your wagmi config to have RPC support for these testnet
  // chain IDs -- if it doesn't, this will just stay undefined and the
  // balance/MAX UI below will quietly not show, same as before this change.
  const { data: externalBalanceRaw, isLoading: externalBalanceLoading } =
    useReadContract({
      address: externalTokenInfo?.address,
      abi: ERC20_BALANCE_OF_ABI,
      functionName: "balanceOf",
      args: connectedAddress ? [connectedAddress] : undefined,
      chainId: externalTokenInfo?.chainId,
      query: {
        enabled: !!connectedAddress && !!externalTokenInfo,
      },
    });

  const externalBalance =
    externalBalanceRaw !== undefined
      ? Number(externalBalanceRaw) / 10 ** (externalTokenInfo?.decimals ?? 6)
      : undefined;

  // Unified "from" balance regardless of direction -- Arc-side balance when
  // bridging out of Arc, external-chain balance when bridging into Arc.
  const fromBalance = direction === "fromArc" ? usdcBalance ?? 0 : externalBalance;
  const fromBalanceLoading = direction === "toArc" && externalBalanceLoading;

  const numericAmount = Number(amount);
  const isAmountValid =
    amount !== "" && !Number.isNaN(numericAmount) && numericAmount > 0;
  const exceedsBalance =
    isAmountValid && fromBalance !== undefined && numericAmount > fromBalance;

  function reverseDirection() {
    setDirection((prev) => (prev === "toArc" ? "fromArc" : "toArc"));
  }

  async function bridgeHandler() {
    try {
      setLoading(true);

      const data = await executeBridge(amount, fromChain, toChain);

      if (data.success) {
        const steps = data.result?.steps ?? [];
        const lastStepWithHash = [...steps]
          .reverse()
          .find((s: any) => s.txHash);

        const txHash = lastStepWithHash?.txHash;
        const explorerUrl = lastStepWithHash?.explorerUrl;

        const history = JSON.parse(
          localStorage.getItem("bridgeHistory") ?? "[]"
        );

        history.unshift({
          amount,
          fromChain,
          toChain,
          date: new Date().toLocaleString(),
          txHash: txHash ?? "",
          explorerUrl: explorerUrl ?? "",
          // Confirmed: kit.bridge()'s result includes mintTxHash, meaning
          // the call only resolves once the destination-chain mint has
          // actually happened (not just the source-chain burn) -- so
          // "Completed" here is accurate, not a guess.
          status: "Completed"
        });

        localStorage.setItem(
          "bridgeHistory",
          JSON.stringify(history.slice(0, 20))
        );
        toast.success(`${amount} USDC bridged`);
      } else {
        toast.error(data.message ?? "Bridge failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Bridge failed");
    } finally {
      setLoading(false);
    }
  }

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
    shadow-2xl">

      {/* neon top strip */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[var(--brand-1)] via-[var(--brand-2)] to-[var(--brand-3)]" />

      {/* HUD corner brackets */}
      <div className="pointer-events-none absolute top-3 left-3 h-3 w-3 border-t border-l border-[rgb(var(--brand-1-rgb)/0.5)] rounded-tl-sm hud-corner" />
      <div className="pointer-events-none absolute top-3 right-3 h-3 w-3 border-t border-r border-[rgb(var(--brand-3-rgb)/0.5)] rounded-tr-sm hud-corner" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b border-l border-[rgb(var(--brand-1-rgb)/0.25)] rounded-bl-sm hud-corner" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b border-r border-[rgb(var(--brand-3-rgb)/0.25)] rounded-br-sm hud-corner" />

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

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-[var(--brand-1)]/80 dark:text-[var(--brand-1-dark)]/80 font-semibold uppercase mb-1">
              // Cross-Chain Relay
            </p>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Bridge</h2>
          </div>
          <div className="bg-[rgb(var(--brand-1-rgb)/0.15)] border border-[rgb(var(--brand-1-rgb)/0.3)] rounded-full px-3 py-1 text-[var(--brand-1)] dark:text-[var(--brand-1-dark)] text-[10px] font-mono font-semibold tracking-widest">
            USDC
          </div>
        </div>

        <div className="relative">

          {/* FROM */}
          <div className="bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/5 dark:border-white/5 rounded-2xl p-4 relative z-30 hover:border-[rgb(var(--brand-1-rgb)/0.2)] duration-300">
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: fromDot, boxShadow: `0 0 6px ${fromDot}` }}
              />
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold">
                From - {fromLabel}
              </p>
              {(fromBalance !== undefined || fromBalanceLoading) && (
                <p className="ml-auto text-[11px] font-mono text-zinc-500">
                  {fromBalanceLoading ? (
                    "Loading balance..."
                  ) : (
                    <>
                      Bal <span className="text-zinc-700 dark:text-zinc-300">{(fromBalance ?? 0).toFixed(4)}</span> USDC
                      <button
                        type="button"
                        onClick={() => setAmount(String(fromBalance ?? 0))}
                        className="ml-1.5 text-[var(--brand-1)] hover:text-[var(--brand-1)] dark:text-[var(--brand-1-dark)] dark:hover:text-[var(--brand-1-dark)] font-semibold"
                      >
                        MAX
                      </button>
                    </>
                  )}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-2.5">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent outline-none text-3xl font-bold font-mono tabular-nums w-32 text-zinc-900 dark:text-zinc-100"
              />

              {direction === "toArc" ? (
                <NetworkSelector
                  value={otherChain}
                  options={NETWORK_OPTIONS}
                  onChange={setOtherChain}
                />
              ) : (
                <div className="bg-zinc-200/80 dark:bg-zinc-700/80 border border-black/5 dark:border-white/5 rounded-full px-4 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Arc Testnet
                </div>
              )}
            </div>

            {exceedsBalance && (
              <p className="mt-2 text-[11px] text-red-400 font-mono">
                Amount exceeds your available balance
              </p>
            )}
          </div>

          {/* CONNECTOR — signature bridge line */}
          <div className="relative h-12 flex items-center justify-center">
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 overflow-hidden">
              <div
                className="w-full h-[200%] animate-bridge-flow"
                style={{
                  background: `repeating-linear-gradient(
                    to bottom,
                    transparent 0px,
                    transparent 6px,
                    ${direction === "toArc" ? otherChainInfo.dot : ARC_DOT} 6px,
                    ${direction === "toArc" ? ARC_DOT : otherChainInfo.dot} 12px
                  )`
                }}
              />
            </div>

            <button
              onClick={reverseDirection}
              aria-label="Reverse bridge direction"
              className="
              relative z-10
              w-9 h-9
              rounded-full
              bg-zinc-900
              border border-[rgb(var(--brand-1-rgb)/0.3)]
              flex items-center justify-center
              text-sm
              text-zinc-700 dark:text-zinc-300
              shadow-[0_0_12px_rgb(var(--brand-1-rgb)/0.25)]
              hover:border-[rgb(var(--brand-1-rgb)/0.6)]
              hover:shadow-[0_0_18px_rgb(var(--brand-1-rgb)/0.4)]
              hover:text-white
              hover:scale-110
              active:scale-95
              duration-300
              "
            >
              ↓
            </button>
          </div>

          {/* TO */}
          <div className="bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/5 dark:border-white/5 rounded-2xl p-4 relative z-10 hover:border-[rgb(var(--brand-3-rgb)/0.2)] duration-300">
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: toDot, boxShadow: `0 0 6px ${toDot}` }}
              />
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold">
                To - {toLabel}
              </p>
            </div>

            {direction === "toArc" ? (
              <div className="text-3xl font-bold font-mono mt-2.5 text-emerald-600 dark:text-emerald-400">
                Arc Testnet
              </div>
            ) : (
              <div className="flex items-center justify-between mt-2.5">
                <div className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {otherChainInfo.label}
                </div>

                <NetworkSelector
                  value={otherChain}
                  options={NETWORK_OPTIONS}
                  onChange={setOtherChain}
                />
              </div>
            )}
          </div>

        </div>

        <p className="mt-3 text-[11px] text-zinc-600 font-mono text-center">
          Cross-chain transfers use Circle's CCTP - the button stays busy until settlement finishes (usually well under a minute).
        </p>

        <button
          onClick={bridgeHandler}
          disabled={loading || !isAmountValid || exceedsBalance}
          className="
          group
          relative
          w-full
          h-12
          mt-4
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
          disabled:opacity-60
          disabled:hover:scale-100
          duration-300
          shadow-[0_0_20px_rgb(var(--brand-1-rgb)/0.25)]
          hover:shadow-[0_0_28px_rgb(var(--brand-1-rgb)/0.4)]
          "
        >
          <span className="relative z-10">
            {loading ? "Bridging..." : "Bridge USDC"}
          </span>
        </button>

      </div>

    </section>
  );
}