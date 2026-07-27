"use client";

import { useReadContract, useAccount } from "wagmi";
import { formatUnits } from "viem";

const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [
      {
        name: "account",
        type: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ]
  }
];

export function useTokenBalance(
  tokenAddress: `0x${string}`,
  decimals = 6,
  chainId?: number
) {

  const { address } =
    useAccount();

  const {
    data,
    isLoading,
    isError,
  } =
    useReadContract({

      address:
        tokenAddress,

      abi:
        ERC20_ABI,

      functionName:
        "balanceOf",

      args:
        address
          ? [address]
          : undefined,

      chainId,

      query: {
        enabled: !!address,
      },

    });

  return {
    value: Number(
      formatUnits(
        (data as bigint)
        ?? BigInt(0),
        decimals
      )
    ),
    isLoading,
    isError,
  };

}