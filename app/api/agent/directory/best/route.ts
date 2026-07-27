import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { arcTestnet } from "@reown/appkit/networks";

import { getDirectory } from "@/lib/agent/providerDirectory";
import { getFeedbackClients } from "@/lib/agent/feedbackClients";
import {
  REPUTATION_REGISTRY_ADDRESS,
  REPUTATION_REGISTRY_ABI,
} from "@/lib/agent/agenticCommerce";

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(),
});

// Ranks every provider in our own directory (see providerDirectory.ts for
// why it's "our directory", not the whole shared IdentityRegistry) by their
// onchain reputation score. This is the "clear decision logic tied to real
// signals" piece for auto-matching -- the score itself only exists because
// of the feedback loop added in useAgentFeedback.ts / JobBoard's FeedbackRow.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exclude = searchParams.get("exclude")?.toLowerCase();

    const directory = await getDirectory();
    const candidates = directory.filter(
      (d) => d.address.toLowerCase() !== exclude
    );

    const ranked = await Promise.all(
      candidates.map(async (entry) => {
        try {
          // FIXED: getSummary() reverts on an empty clientAddresses array
          // -- can't call it at all for a provider nobody's rated yet
          // through this app. Skipping the call also means we're not
          // burning an RPC request on a guaranteed revert, which helps a
          // little with the rate-limit pressure Promise.all here creates
          // (see the "dedicated RPC" note in agenticCommerce.ts/README for
          // the fuller fix to that).
          const clientAddresses = await getFeedbackClients(entry.address);
          if (clientAddresses.length === 0) {
            return {
              address: entry.address,
              agentId: entry.agentId,
              reputation: 0,
              feedbackCount: 0,
            };
          }

          const [count, summaryValue, summaryValueDecimals] =
            (await publicClient.readContract({
              address: REPUTATION_REGISTRY_ADDRESS,
              abi: REPUTATION_REGISTRY_ABI,
              functionName: "getSummary",
              args: [BigInt(entry.agentId), clientAddresses, "", ""],
            })) as [bigint, bigint, number];

          const reputation =
            count === 0n
              ? 0
              : Number(summaryValue) / 10 ** Number(summaryValueDecimals);

          return {
            address: entry.address,
            agentId: entry.agentId,
            reputation,
            feedbackCount: Number(count),
          };
        } catch (error) {
          console.error(`Could not read reputation for ${entry.address}:`, error);
          return {
            address: entry.address,
            agentId: entry.agentId,
            reputation: 0,
            feedbackCount: 0,
          };
        }
      })
    );

    ranked.sort(
      (a, b) => b.reputation - a.reputation || b.feedbackCount - a.feedbackCount
    );

    // FIX: when the top candidates are tied (most commonly: everyone's
    // still at 0 reputation / 0 feedback, e.g. right after a batch of new
    // providers register), the sort above always kept them in whatever
    // arbitrary-but-stable order the directory happened to return them in
    // -- so "Auto-Assign" would deterministically pick the SAME provider
    // every single time, looking like it was "locked" to one address even
    // though nothing in the code actually locks it. Shuffle among the tied
    // top group so unproven providers get a fair, varying chance instead of
    // whoever happened to sort first.
    if (ranked.length > 0) {
      const topReputation = ranked[0].reputation;
      const topFeedbackCount = ranked[0].feedbackCount;

      const tiedForFirst = ranked.filter(
        (r) => r.reputation === topReputation && r.feedbackCount === topFeedbackCount
      );

      if (tiedForFirst.length > 1) {
        const winner =
          tiedForFirst[Math.floor(Math.random() * tiedForFirst.length)];

        // Move the randomly chosen winner to the front, keep everyone else
        // (including the rest of the tied group) in their existing order.
        const rest = ranked.filter((r) => r.address !== winner.address);
        ranked.splice(0, ranked.length, winner, ...rest);
      }
    }

    return NextResponse.json({ success: true, providers: ranked });
  } catch (error: any) {
    console.error("Could not rank providers:", error);
    return NextResponse.json(
      { success: false, message: error?.message ?? "Could not load providers" },
      { status: 500 }
    );
  }
}