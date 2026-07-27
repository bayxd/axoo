import { redis } from "./kv";

// Replaces the local-filesystem version. Same public API (getTiming /
// recordTiming) so callers only need to add `await` -- see the three
// app/api/agent/*/route.ts files that were updated alongside this.
//
// Data model: one Redis key per job, holding a small JSON object
// { createdAt?, submittedAt? }. Both fields get written independently
// (possibly from two different browsers/devices -- client vs provider),
// so recordTiming does a read-modify-write to merge into whatever's
// already there rather than overwriting the other field.

export type JobTiming = { createdAt?: string; submittedAt?: string };

function timingKey(jobId: bigint) {
  return `job-timing:${jobId.toString()}`;
}

export async function getTiming(jobId: bigint): Promise<JobTiming | undefined> {
  const data = await redis.get<JobTiming>(timingKey(jobId));
  return data ?? undefined;
}

export async function recordTiming(
  jobId: bigint,
  field: keyof JobTiming,
  timestamp: bigint
) {
  const existing = (await redis.get<JobTiming>(timingKey(jobId))) ?? {};
  const updated: JobTiming = { ...existing, [field]: timestamp.toString() };
  await redis.set(timingKey(jobId), updated);
}