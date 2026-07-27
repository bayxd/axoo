// Arc Testnet — official pre-deployed contracts (from docs.arc.io tutorials)
// ERC-8183: Agentic Commerce (job escrow) — https://docs.arc.io/arc/tutorials/create-your-first-erc-8183-job
// ERC-8004: Trustless Agents (identity/reputation) — https://docs.arc.io/arc/tutorials/register-your-first-ai-agent
//
// NOTE: ABIs below are condensed to the functions/events this feature actually uses.
// Double-check parameter order against the docs pages above before relying on this in prod —
// copy this file's addresses/ABI 1:1 from there if anything here looks off.

export const AGENTIC_COMMERCE_ADDRESS =
  "0x0747EEf0706327138c69792bF28Cd525089e4583" as const;

export const IDENTITY_REGISTRY_ADDRESS =
  "0x8004A818BFB912233c491871b3d84c89A494BD9e" as const;

export const REPUTATION_REGISTRY_ADDRESS =
  "0x8004B663056A597Dffe9eCcC1965A193B7388713" as const;

export const VALIDATION_REGISTRY_ADDRESS =
  "0x8004Cb1BF31DAf7788923b405b754f57acEB4272" as const;

// Arc Testnet USDC (same token your Send/Swap/Bridge cards already use)
export const USDC_ARC_TESTNET =
  "0x3600000000000000000000000000000000000000" as const;

export const ERC20_APPROVE_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// Standard ERC20 transfer -- used by the Speed Bonus treasury wallet to send
// bonus USDC directly to a provider (NOT via AgenticCommerce -- bonuses are a
// separate payment, outside the escrow flow. See lib/agent/README for why).
export const ERC20_TRANSFER_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

// VERIFIED against Arc Testnet explorer's Read/Write contract UI on the
// implementation at 0xa316fd02827242d537f84730f8a37d0ba5fd351a.
// createJob / setBudget / fund / getJob / submit / complete function signatures,
// AND the JobCreated event, were all confirmed directly from the explorer
// (function forms + a decoded log on a real createJob tx).
// JobFunded / JobSubmitted / JobCompleted events were NOT checked against a real
// log the way JobCreated was -- they're carried over from the tutorial. If fundJob/
// submitDeliverable/completeJob ever need to decode something from their receipts
// (they don't today), verify those event shapes on the explorer first, the same
// way JobCreated's turned out to be missing evaluator/expiredAt/hook.
// reject / claimRefund were NOT checked at all -- the explorer's method list also
// shows fns this file doesn't wire up (evaluatorFeeBP, setEvaluatorFee,
// whitelistedHooks, setHookWhitelist, jobHasBudget, jobCounter, platformFeeBP,
// platformTreasury).
export const AGENTIC_COMMERCE_ABI = [
  {
    type: "function",
    name: "createJob",
    stateMutability: "nonpayable",
    inputs: [
      { name: "provider", type: "address" },
      { name: "evaluator", type: "address" },
      { name: "expiredAt", type: "uint256" },
      { name: "description", type: "string" },
      { name: "hook", type: "address" },
    ],
    outputs: [{ name: "jobId", type: "uint256" }],
  },
  {
    type: "function",
    name: "setBudget",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "optParams", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "fund",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "optParams", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "submit",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "deliverable", type: "bytes32" },
      { name: "optParams", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "complete",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "reason", type: "bytes32" },
      { name: "optParams", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getJob",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "client", type: "address" },
          { name: "provider", type: "address" },
          { name: "evaluator", type: "address" },
          { name: "description", type: "string" },
          { name: "budget", type: "uint256" },
          { name: "expiredAt", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "hook", type: "address" },
        ],
      },
    ],
  },
  // ⚠️ NOT FULLY VERIFIED like the functions above. You saw "jobCounter" in
  // the explorer's method LIST (item #13, selector 0x50355d76) but we never
  // expanded its form the way we did for createJob/setBudget/etc. This
  // assumes it takes no args and returns a plain uint256 (the standard
  // pattern for an auto-increment counter) -- confirm this on the explorer
  // (Read tab -> click jobCounter -> Read) before trusting the scan logic in
  // lib/agent/ that loops from 1 to jobCounter. Also confirm whether job IDs
  // start at 0 or 1 -- the loop below assumes 1 (based on your real job #147956
  // style IDs, which doesn't tell us the starting point either -- just check it).
  {
    type: "function",
    name: "jobCounter",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "JobCreated",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "client", type: "address", indexed: true },
      { name: "provider", type: "address", indexed: true },
      { name: "evaluator", type: "address", indexed: false },
      { name: "expiredAt", type: "uint256", indexed: false },
      { name: "hook", type: "address", indexed: false },
    ],
  },
  {
    type: "event",
    name: "JobFunded",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "JobSubmitted",
    inputs: [{ name: "jobId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "JobCompleted",
    inputs: [{ name: "jobId", type: "uint256", indexed: true }],
  },
] as const;

// FIXED (see debugging session on the "No registered providers found" bug):
// IdentityRegistryUpgradeable is an actual ERC-721 contract -- "Agent
// Identity" is a minted NFT, not a custom mapping. `agentIdOf` and
// `isRegistered` were NEVER real functions on this contract -- they were
// guessed from the tutorial and never verified against the explorer, unlike
// AGENTIC_COMMERCE_ABI above. Confirmed by reading the FULL function list on
// the explorer's Read/Write contract tab: the real surface is approve,
// balanceOf, eip712Domain, getAgentWallet, getApproved, getMetadata,
// getVersion, initialize, isApprovedForAll, isAuthorizedOrOwner, name,
// owner, ownerOf, proxiableUUID, register (3 overloads), renounceOwnership,
// safeTransferFrom, setAgentURI, setAgentWallet, setApprovalForAll,
// setMetadata, supportsInterface, symbol, tokenURI, transferFrom,
// transferOwnership, unsetAgentWallet, upgradeToAndCall. No `agentIdOf`, no
// `isRegistered`, no `tokenOfOwnerByIndex` (so no onchain reverse lookup
// from address -> agentId exists on this contract at all).
//
// Fix:
//   - "is this address registered?" -> balanceOf(address) > 0 (standard
//     ERC-721, confirmed present on the real contract).
//   - "what's THIS wallet's agentId, right after it just registered?" ->
//     decode the Transfer event from the register() tx receipt (mint =
//     Transfer from 0x0 to owner, tokenId = agentId). Same pattern already
//     used for decoding JobCreated above.
//   - "what's SOME OTHER address's agentId?" (needed by
//     speedBonusAgent.ts / useAgentFeedback.ts for an arbitrary provider) ->
//     there's no onchain way to do this on this contract. Use
//     lib/agent/providerDirectory.ts (Redis), which stores {address,
//     agentId} pairs captured client-side at registration time -- this
//     directory IS the reverse-lookup index this contract doesn't provide.
export const IDENTITY_REGISTRY_ABI = [
  {
    type: "function",
    name: "register",
    stateMutability: "nonpayable",
    inputs: [{ name: "agentURI", type: "string" }],
    outputs: [{ name: "agentId", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
    ],
  },
] as const;

// FIXED (round 2 of the same bug class as IdentityRegistry): the assumed
// `giveFeedback(agentId, score uint8, context string)` and
// `reputationOf(agentId) -> (averageScore, feedbackCount)` were ALSO never
// real functions on this contract -- confirmed by expanding the actual
// forms on the explorer's Read/Write tab. The real surface is:
//
//   giveFeedback(agentId, value int128, valueDecimals uint8, tag1, tag2,
//                endpoint, feedbackURI, feedbackHash bytes32)
//   getSummary(agentId, clientAddresses address[], tag1, tag2)
//     -> (count uint64, summaryValue int128, summaryValueDecimals uint8)
//
// This is the standard ERC-8004 shape: feedback is a fixed-point decimal
// score (value + valueDecimals), taggable, and tied to a specific
// "endpoint" (which service/interaction it's about), with an optional
// off-chain URI + hash commitment -- much richer than the simple 0-100
// average this app originally assumed. This is WHY every giveFeedback call
// so far reverted (0x, no revert reason) -- wrong argument count/types
// entirely, not a logic bug.
//
// This app doesn't have UI for tags/endpoints/off-chain feedback yet, so
// useAgentFeedback.ts calls these with generic defaults (empty tags/URI,
// endpoint = a fixed app-level string) to get the closest match to the
// original "single overall score" behavior it was designed around.
export const REPUTATION_REGISTRY_ABI = [
  {
    type: "function",
    name: "giveFeedback",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "value", type: "int128" },
      { name: "valueDecimals", type: "uint8" },
      { name: "tag1", type: "string" },
      { name: "tag2", type: "string" },
      { name: "endpoint", type: "string" },
      { name: "feedbackURI", type: "string" },
      { name: "feedbackHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getSummary",
    stateMutability: "view",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "clientAddresses", type: "address[]" },
      { name: "tag1", type: "string" },
      { name: "tag2", type: "string" },
    ],
    outputs: [
      { name: "count", type: "uint64" },
      { name: "summaryValue", type: "int128" },
      { name: "summaryValueDecimals", type: "uint8" },
    ],
  },
] as const;