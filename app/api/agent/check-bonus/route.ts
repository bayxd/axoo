import { NextResponse } from "next/server";

import { getJobById, decideSpeedBonus } from "@/lib/agent/speedBonusAgent";
import { hasBeenPaid, recordBonus } from "@/lib/agent/bonusStore";
import { payBonus } from "@/lib/agent/treasuryWallet";
import { getTiming } from "@/lib/agent/jobTiming";

// Evaluates ONE job, by ID. Timing (createdAt/submittedAt) is looked up
// server-side from lib/agent/jobTiming.ts -- recorded there by whichever
// browser (client's or provider's, possibly different Chrome profiles or
// devices) ran createJob/submit. The caller (useJobBoard's completeJob, or
// AgentDashboard's manual Check) only needs to send jobId.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const jobIdRaw = body.jobId;

    if (jobIdRaw === undefined || jobIdRaw === null) {
      return NextResponse.json(
        { success: false, message: "jobId is required" },
        { status: 400 }
      );
    }

    const jobId = BigInt(jobIdRaw);

    if (await hasBeenPaid(jobId)) {
      return NextResponse.json({
        success: true,
        paid: false,
        reason: "Already paid a bonus for this job",
      });
    }

    const job = await getJobById(jobId);
    const timing = await getTiming(jobId);

    const decision = await decideSpeedBonus(
      job,
      timing?.createdAt ? BigInt(timing.createdAt) : null,
      timing?.submittedAt ? BigInt(timing.submittedAt) : null
    );

    if (!decision.shouldPay) {
      return NextResponse.json({
        success: true,
        paid: false,
        reason: decision.reason,
      });
    }

    const txHash = await payBonus(decision.provider, decision.bonusAmount);

    await recordBonus({
      jobId: decision.jobId.toString(),
      provider: decision.provider,
      amount: decision.bonusAmount.toString(),
      reason: decision.reason,
      txHash,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      paid: true,
      amount: decision.bonusAmount.toString(),
      reason: decision.reason,
      txHash,
    });
  } catch (error: any) {
    console.error("Speed bonus check failed:", error);
    return NextResponse.json(
      { success: false, message: error?.message ?? "Bonus check failed" },
      { status: 500 }
    );
  }
}