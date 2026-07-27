import { NextResponse } from "next/server";

import { addToDirectory } from "@/lib/agent/providerDirectory";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, agentId, metadataURI } = body;

    if (!address || !agentId) {
      return NextResponse.json(
        { success: false, message: "address and agentId are required" },
        { status: 400 }
      );
    }

    await addToDirectory({
      address,
      agentId: agentId.toString(),
      metadataURI: metadataURI ?? "",
      registeredAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Could not add to provider directory:", error);
    return NextResponse.json(
      { success: false, message: error?.message ?? "Could not register in directory" },
      { status: 500 }
    );
  }
}