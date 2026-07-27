"use client";

import { toast } from "sonner";

import { AppKit } from "@circle-fin/app-kit";

import {
  connectBrowserWallet
} from "@/lib/send/browserWallet";
import { useBalances } from "@/hooks/portfolio/useBalances";
import { recordSnapshot } from "@/lib/history/portfolioSnapshot";

const kit =
  new AppKit();

export function useBridge() {

  // Dipakai buat mencatat snapshot saldo begitu bridge sukses.
  const { usdcBalance, eurcBalance } = useBalances();

  async function bridge(

    amount: string,

    fromChain: string,

    toChain: string

  ) {

    try {

      const {

        adapter,

        walletName,

        connectedAddress

      } = await connectBrowserWallet();

      const result =
        await kit.bridge({

          from: {

            adapter,

            chain:
              fromChain as any

          },

          to: {

            adapter,

            chain:
              toChain as any

          },

          amount

        });

      // NOTE: sama seperti di useExecuteSwap.ts — usdcBalance/eurcBalance di
      // sini masih dari render terakhir sebelum bridge ini selesai. Kalau ada
      // refetch() dari useTokenBalance, idealnya dipanggil dulu sebelum ini.
      recordSnapshot(Number(usdcBalance ?? 0), Number(eurcBalance ?? 0), {
        force: true,
      });

 return {

        success: true,

        result,

        walletName,

        connectedAddress

      };

    }

    catch (error: any) {

      console.error(error);

      toast.error(

        error.message ??

        "Bridge failed"

      );

      return {

        success: false,

        message:

          error.message ??

          "Bridge failed"

      };

    }

  }

  return {

    bridge

  };

}