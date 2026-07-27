"use client";

import { useAccount, useReadContracts } from "wagmi";
import { erc20Abi, formatUnits } from "viem";

const EURC_ADDRESS: `0x${string}` =
  "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

export default function EURCStats() {
  const { address } = useAccount();

  const { data } = useReadContracts({
    allowFailure: false,
    contracts: [
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
        EURC
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