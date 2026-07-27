import { redis } from "./kv";

// getSummary(agentId, clientAddresses, tag1, tag2) reverts with
// "clientAddresses required" if clientAddresses is empty -- the contract
// requires the caller to name WHOSE feedback to aggregate (an anti-sybil
// design, presumably: you can't ask for "the average from everyone",
// only from specific clients you're choosing to trust/weight).
//
// So we track this ourselves: every time giveFeedback() succeeds (see
// useAgentFeedback.ts), we record {provider, client} here. Whoever reads a
// provider's reputation (speedBonusAgent.ts, directory/best route) fetches
// this list first and passes it as getSummary's clientAddresses -- this
// list IS the only way to legitimately call getSummary at all now that we
// know it requires a real array.

function key(providerAddress: string) {
  return `feedback-clients:${providerAddress.toLowerCase()}`;
}

export async function recordFeedbackClient(
  providerAddress: string,
  clientAddress: string
) {
  await redis.sadd(key(providerAddress), clientAddress.toLowerCase());
}

export async function getFeedbackClients(
  providerAddress: string
): Promise<`0x${string}`[]> {
  const members = await redis.smembers<string[]>(key(providerAddress));
  return (members ?? []) as `0x${string}`[];
}