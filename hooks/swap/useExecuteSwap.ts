"use client";

import { toast } from "sonner";

import { executeSwapBrowser } from "@/lib/swap/executeSwapBrowser";
import { recoverSwap } from "@/lib/swap/recoverSwap";
import { saveSwapHistory } from "@/lib/swap/swapHistory";
import { useBalances } from "@/hooks/portfolio/useBalances";
import { recordSnapshot } from "@/lib/history/portfolioSnapshot";

export function useExecuteSwap() {

  const { usdcBalance, eurcBalance } = useBalances();

  async function executeSwap(

    amount: string,

    tokenIn: string,

    tokenOut: string,

    _slippage: string

  ) {

    try {

      const { result, status, connectedAddress } = await recoverSwap(() =>
        executeSwapBrowser(amount, tokenIn, tokenOut)
      );

      const txHash = (status as any)?.txHash ?? (result as any)?.txHash;
      const explorerUrl =
        (status as any)?.explorerUrl ?? (result as any)?.explorerUrl;

      saveSwapHistory(amount, tokenIn, tokenOut, explorerUrl, txHash);
      toast.success(`${amount} ${tokenIn} → ${tokenOut}`);

      recordSnapshot(Number(usdcBalance ?? 0), Number(eurcBalance ?? 0), {
        force: true,
      });

      return {
        success: true,
        result: { result, status, connectedAddress },
      };
    } catch (error: any) {
      console.error(error);
      const message = error?.message ?? "Swap failed";
      toast.error(message);
      return {
        success: false,
        message,
      };
    }
  }

  return {
    executeSwap,
  };
}