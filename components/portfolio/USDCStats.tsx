"use client";

import { useAccount, useReadContracts } from "wagmi";
import { erc20Abi, formatUnits } from "viem";

// TODO: ganti dengan alamat kontrak USDC yang benar untuk chain yang kamu pakai
// Ethereum mainnet: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
const USDC_ADDRESS: `0x${string}` =
  "0x3600000000000000000000000000000000000000";

export default function USDCStats() {
  const { address } = useAccount();

  const { data } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
      },
      {
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "decimals",
      },
    ],
    query: {
      enabled: Boolean(address),
    },
  });

  const [rawBalance, decimals] = data ?? [];

  const formatted =
    rawBalance !== undefined && decimals !== undefined
      ? Number(formatUnits(rawBalance, decimals))
      : 0;

  return (
    <div
      className="
      flex
      flex-col
      "
    >
      <span
        className="
        text-4xl
        font-black
        "
      >
        {formatted.toFixed(2)}
      </span>

      <span
        className="
        text-zinc-500
        text-sm
        mt-2
        "
      >
        USDC
      </span>

      <span
        className="
        text-green-400
        text-xs
        mt-1
        font-semibold
        "
      >
      </span>
    </div>
  );
}