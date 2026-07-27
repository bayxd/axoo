"use client";

import { useTokenBalance }
from "@/hooks/portfolio/useTokenBalance";

import { TOKENS }
from "@/constants/tokens";

// Arc Testnet — chain ID numerik asli (RPC: https://rpc.testnet.arc.network)
const ARC_TESTNET_CHAIN_ID = 5042002;

export function useBalances() {

  const usdc =
    useTokenBalance(
      TOKENS.USDC.address,
      TOKENS.USDC.decimals ?? 6,
      ARC_TESTNET_CHAIN_ID
    );

  const eurc =
    useTokenBalance(
      TOKENS.EURC.address,
      TOKENS.EURC.decimals ?? 6,
      ARC_TESTNET_CHAIN_ID
    );

  return {

    usdcBalance: usdc.value,

    eurcBalance: eurc.value,

    isLoading: usdc.isLoading || eurc.isLoading,

    isError: usdc.isError || eurc.isError

  };

}