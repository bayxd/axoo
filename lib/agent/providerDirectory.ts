import { redis } from "./kv";

// The onchain IdentityRegistry only supports point lookups (agentIdOf(addr))
// -- there's no "list all registered agents" function, and scanning every
// registration event from block 0 hits the same RPC rate-limit wall that
// useMyJobIds' comment in useJobBoard.ts already documented for jobs.
//
// UPDATE: turns out IdentityRegistry doesn't even have agentIdOf() at all
// (see agenticCommerce.ts's IDENTITY_REGISTRY_ABI comment) -- there is NO
// onchain way to look up an address's agentId, not even a slow one. This
// directory isn't just a rate-limit-avoidance cache anymore; for the
// address -> agentId direction, it's the ONLY source of truth this app has.
//
// So: we keep our OWN lightweight directory of providers who've opted in by
// registering through THIS app (see RegisterAgentCard -> useAgentIdentity,
// which posts here right after a successful register() call -- matching
// its own copy: "so buyers and suppliers can find you"). Auto-matching only
// ever ranks providers from this directory, never the whole shared
// contract -- same "known set, not global scan" pattern as the rest of
// this feature.

const DIRECTORY_KEY = "provider-directory";

export interface DirectoryEntry {
  address: `0x${string}`;
  agentId: string;
  metadataURI: string;
  registeredAt: number;
}

export async function addToDirectory(entry: DirectoryEntry) {
  await redis.hset(DIRECTORY_KEY, {
    [entry.address.toLowerCase()]: JSON.stringify(entry),
  });
}

export async function getDirectory(): Promise<DirectoryEntry[]> {
  const all = await redis.hgetall<Record<string, string>>(DIRECTORY_KEY);
  if (!all) return [];
  return Object.values(all).map((v) =>
    typeof v === "string" ? JSON.parse(v) : (v as unknown as DirectoryEntry)
  );
}

// Single-address lookup -- O(1) via Redis hash field access, no need to
// pull the whole directory just to find one entry. This is what replaces
// the on-chain agentIdOf(address) calls in speedBonusAgent.ts and
// useAgentFeedback.ts, now that we know that function never existed.
export async function getDirectoryEntry(
  address: string
): Promise<DirectoryEntry | null> {
  const raw = await redis.hget<string>(DIRECTORY_KEY, address.toLowerCase());
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as DirectoryEntry);
}