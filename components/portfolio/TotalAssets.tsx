"use client";

import { useAccount, useReadContracts } from "wagmi";
import { erc20Abi, formatUnits } from "viem";

// TODO: ganti dengan alamat kontrak USDC yang benar untuk chain yang kamu pakai
// Ethereum mainnet: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
const USDC_ADDRESS: `0x${string}` =
  "0x3600000000000000000000000000000000000000";

const EURC_ADDRESS: `0x${string}` =
  "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

export default function TotalAssets() {
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
      {
        address: EURC_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
      },
      {
        address: EURC_ADDRESS,
        abi: erc20Abi,
        functionName: "decimals",
      },
    ],
    query: {
      enabled: Boolean(address),
    },
  });

  const [usdcRaw, usdcDecimals, eurcRaw, eurcDecimals] = data ?? [];

  const usdcValue =
    usdcRaw !== undefined && usdcDecimals !== undefined
      ? Number(formatUnits(usdcRaw, usdcDecimals))
      : 0;

  const eurcValue =
    eurcRaw !== undefined && eurcDecimals !== undefined
      ? Number(formatUnits(eurcRaw, eurcDecimals))
      : 0;

  const total = usdcValue + eurcValue;

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
        bg-linear-to-r
        from-purple-400
        via-pink-500
        to-blue-500
        text-transparent
        bg-clip-text
        "
      >
        {total.toFixed(2)}
      </span>

      <span
        className="
        text-zinc-500
        text-sm
        mt-1
        "
      >
        USD
      </span>
    </div>
  );
}