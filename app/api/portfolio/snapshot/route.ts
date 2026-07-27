import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/agent/kv";

// Sama seperti versi localStorage sebelumnya: batasi seberapa sering
// snapshot "pasif" (dari page-view) boleh tercatat.
const MIN_INTERVAL_MS =
  process.env.NODE_ENV === "development"
    ? 10 * 1000 // 10 detik saat dev, biar gampang ditest
    : 60 * 60 * 1000; // 1 jam saat production

const MAX_SNAPSHOTS = 2000;

function snapshotKey(address: string) {
  return `portfolio:snapshots:${address.toLowerCase()}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { address, usdcBalance, eurcBalance, force } = body ?? {};

  if (!address || typeof address !== "string") {
    return NextResponse.json(
      { error: "address wajib diisi" },
      { status: 400 }
    );
  }

  if (typeof usdcBalance !== "number" || typeof eurcBalance !== "number") {
    return NextResponse.json(
      { error: "usdcBalance dan eurcBalance harus berupa number" },
      { status: 400 }
    );
  }

  const key = snapshotKey(address);
  const now = Date.now();

  if (!force) {
    // Ambil 1 entri terakhir (skor tertinggi = timestamp terbaru).
    const last = await redis.zrange<{ timestamp: number }[]>(key, 0, 0, {
      rev: true,
    });

    if (last.length > 0) {
      const lastEntry =
        typeof last[0] === "string" ? JSON.parse(last[0]) : last[0];

      if (now - lastEntry.timestamp < MIN_INTERVAL_MS) {
        return NextResponse.json({ skipped: true });
      }
    }
  }

  const totalValueUSD = usdcBalance + eurcBalance;
  const snapshot = { timestamp: now, usdcBalance, eurcBalance, totalValueUSD };

  await redis.zadd(key, {
    score: now,
    member: JSON.stringify(snapshot),
  });

  // Buang entri paling lama kalau sudah lewat batas MAX_SNAPSHOTS.
  await redis.zremrangebyrank(key, 0, -(MAX_SNAPSHOTS + 1));

  return NextResponse.json({ success: true, snapshot });
}