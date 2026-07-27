import { NextResponse } from "next/server";

import { recordTiming } from "@/lib/agent/jobTiming";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId, field, timestamp } = body;

    if (!jobId || !field || !timestamp) {
      return NextResponse.json(
        { success: false, message: "jobId, field, and timestamp are required" },
        { status: 400 }
      );
    }

    if (field !== "createdAt" && field !== "submittedAt") {
      return NextResponse.json(
        { success: false, message: "field must be createdAt or submittedAt" },
        { status: 400 }
      );
    }

    await recordTiming(BigInt(jobId), field, BigInt(timestamp));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Could not record timing:", error);
    return NextResponse.json(
      { success: false, message: error?.message ?? "Could not record timing" },
      { status: 500 }
    );
  }
}