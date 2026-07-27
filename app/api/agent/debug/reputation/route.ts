import { NextResponse } from "next/server";

import { getFeedbackClients } from "@/lib/agent/feedbackClients";
import { getDirectoryEntry } from "@/lib/agent/providerDirectory";
import {
  REPUTATION_REGISTRY_ADDRESS,
  REPUTATION_REGISTRY_ABI,
} from "@/lib/agent/agenticCommerce";
import { createPublicClient, http } from "viem";
import { arcTestnet } from "@reown/appkit/networks";

const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });

// Temporary debug tool -- not linked from the app. Delete once the
// reputation-still-0 issue is sorted.
//
// GET /api/agent/debug/reputation?address=0x...
// Shows every step of the reputation lookup chain for one provider:
// directory entry -> recorded feedback clients -> raw getSummary() result.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { success: false, message: "address query param is required" },
        { status: 400 }
      );
    }

    const entry = await getDirectoryEntry(address);
    if (!entry) {
      return NextResponse.json({
        success: true,
        step: "directory",
        result: "NOT in provider directory -- this is the problem",
      });
    }

    const clientAddresses = await getFeedbackClients(address);
    if (clientAddresses.length === 0) {
      return NextResponse.json({
        success: true,
        step: "feedbackClients",
        directoryEntry: entry,
        result:
          "Directory entry exists, but no feedback clients recorded for this address -- this is the problem. giveFeedback() likely never reached the point where it POSTs to /api/agent/record-feedback-client (check: did the tx actually confirm with status 'success'? was the client's own wallet address available at that point?).",
      });
    }

    let rawResult: any = null;
    let rawError: string | null = null;
    try {
      const [count, summaryValue, summaryValueDecimals] =
        (await publicClient.readContract({
          address: REPUTATION_REGISTRY_ADDRESS,
          abi: REPUTATION_REGISTRY_ABI,
          functionName: "getSummary",
          args: [BigInt(entry.agentId), clientAddresses, "", ""],
        })) as [bigint, bigint, number];

      rawResult = {
        count: count.toString(),
        summaryValue: summaryValue.toString(),
        summaryValueDecimals,
        computedReputation:
          count === 0n
            ? 0
            : Number(summaryValue) / 10 ** Number(summaryValueDecimals),
      };
    } catch (error: any) {
      rawError = error?.message ?? String(error);
    }

    return NextResponse.json({
      success: true,
      step: "getSummary",
      directoryEntry: entry,
      feedbackClients: clientAddresses,
      getSummaryResult: rawResult,
      getSummaryError: rawError,
    });
  } catch (error: any) {
    console.error("Debug reputation lookup failed:", error);
    return NextResponse.json(
      { success: false, message: error?.message ?? "Debug lookup failed" },
      { status: 500 }
    );
  }
}