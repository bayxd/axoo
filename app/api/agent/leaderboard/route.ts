import { NextResponse } from "next/server";

import { getLeaderboard, getBonusHistory } from "@/lib/agent/bonusStore";

export async function GET() {
  try {
    const [leaderboard, history] = await Promise.all([
      getLeaderboard(),
      getBonusHistory(),
    ]);

    return NextResponse.json({
      success: true,
      leaderboard,
      // Most recent first -- feeds the "Agent Activity Log" UI.
      history: history.slice().reverse(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Could not load leaderboard" },
      { status: 500 }
    );
  }
}