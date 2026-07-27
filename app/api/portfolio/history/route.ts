import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/agent/kv";

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS_MAP: Record<string, number> = { "1D": 1, "7D": 7, "30D": 30 };

function snapshotKey(address: string) {
  return `portfolio:snapshots:${address.toLowerCase()}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  const period = searchParams.get("period") ?? "ALL";

  if (!address) {
    return NextResponse.json(
      { error: "address wajib diisi" },
      { status: 400 }
    );
  }

  const key = snapshotKey(address);

  const min =
    period === "ALL"
      ? "-inf"
      : Date.now() - (DAYS_MAP[period] ?? 0) * DAY_MS;

  // Urut dari paling lama -> paling baru (cocok langsung buat recharts).
  const raw = await redis.zrange<string[]>(key, min, "+inf", {
    byScore: true,
  });

  const snapshots = raw.map((entry) =>
    typeof entry === "string" ? JSON.parse(entry) : entry
  );

  return NextResponse.json({ snapshots });
}