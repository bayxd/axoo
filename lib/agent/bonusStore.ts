import { redis } from "./kv";

// Replaces the local-filesystem version. Same public API
// (getBonusHistory / hasBeenPaid / recordBonus / getLeaderboard), all now
// async -- callers were updated to await them.
//
// Data model:
//   - "bonus-history": a Redis LIST, one JSON string per bonus payout,
//     appended in order (RPUSH). getBonusHistory() reads the whole list
//     and getLeaderboard() aggregates it in JS, same as the old version.
//   - "bonus-paid:{jobId}": a simple existence flag, set right after a
//     payout, so hasBeenPaid() is a cheap O(1) check instead of scanning
//     the whole history list.

const HISTORY_KEY = "bonus-history";

function paidKey(jobId: string) {
  return `bonus-paid:${jobId}`;
}

export interface BonusRecord {
  jobId: string; // stored as string since JSON can't hold bigint
  provider: `0x${string}`;
  amount: string; // USDC base units, as string
  reason: string;
  txHash: `0x${string}`;
  timestamp: number;
}

export async function getBonusHistory(): Promise<BonusRecord[]> {
  const raw = await redis.lrange<string>(HISTORY_KEY, 0, -1);
  return raw.map((item) =>
    typeof item === "string" ? JSON.parse(item) : (item as unknown as BonusRecord)
  );
}

export async function hasBeenPaid(jobId: bigint): Promise<boolean> {
  const exists = await redis.exists(paidKey(jobId.toString()));
  return exists === 1;
}

export async function recordBonus(record: BonusRecord) {
  await redis.rpush(HISTORY_KEY, JSON.stringify(record));
  await redis.set(paidKey(record.jobId), "1");
}

export async function getLeaderboard(): Promise<
  { provider: `0x${string}`; totalBonus: string; bonusCount: number }[]
> {
  const records = await getBonusHistory();
  const totals = new Map<string, bigint>();
  const counts = new Map<string, number>();

  for (const r of records) {
    totals.set(r.provider, (totals.get(r.provider) ?? 0n) + BigInt(r.amount));
    counts.set(r.provider, (counts.get(r.provider) ?? 0) + 1);
  }

  return Array.from(totals.entries())
    .map(([provider, totalBonus]) => ({
      provider: provider as `0x${string}`,
      totalBonus: totalBonus.toString(),
      bonusCount: counts.get(provider) ?? 0,
    }))
    .sort((a, b) => (BigInt(b.totalBonus) > BigInt(a.totalBonus) ? 1 : -1));
}