import { NextResponse } from "next/server";

import { recordFeedbackClient } from "@/lib/agent/feedbackClients";

// POST { providerAddress, clientAddress } -- fire-and-forget from
// useAgentFeedback.ts right after giveFeedback() succeeds onchain. Builds
// the client list getSummary() now requires (see feedbackClients.ts).
export async function POST(request: Request) {
  try {
    const { providerAddress, clientAddress } = await request.json();

    if (!providerAddress || !clientAddress) {
      return NextResponse.json(
        { success: false, message: "providerAddress and clientAddress are required" },
        { status: 400 }
      );
    }

    await recordFeedbackClient(providerAddress, clientAddress);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Could not record feedback client:", error);
    return NextResponse.json(
      { success: false, message: error?.message ?? "Could not record feedback client" },
      { status: 500 }
    );
  }
}