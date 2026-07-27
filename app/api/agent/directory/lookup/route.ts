import { NextResponse } from "next/server";

import { getDirectoryEntry } from "@/lib/agent/providerDirectory";

// GET /api/agent/directory/lookup?address=0x...
// Single-address directory lookup. Replaces on-chain agentIdOf(address)
// calls, which don't work -- IdentityRegistry has no such function (see
// agenticCommerce.ts's IDENTITY_REGISTRY_ABI comment).
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
      return NextResponse.json({ success: true, entry: null });
    }

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    console.error("Directory lookup failed:", error);
    return NextResponse.json(
      { success: false, message: error?.message ?? "Lookup failed" },
      { status: 500 }
    );
  }
}