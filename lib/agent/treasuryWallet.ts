import { createWalletClient, createPublicClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcTestnet } from "@reown/appkit/networks";

import { USDC_ARC_TESTNET, ERC20_TRANSFER_ABI } from "@/lib/agent/agenticCommerce";

// ⚠️ SECURITY NOTE, read before setting this up:
// This is a SEPARATE wallet from any user's wallet -- it holds ONLY treasury
// funds you deposit for paying bonuses, never user funds. This is why it's
// safe for it to sign autonomously (no human clicking "confirm" each time),
// unlike the Swap feature you migrated AWAY from server-signing earlier --
// that was user money, this is platform money you control and fund
// deliberately in small amounts for this specific purpose.
//
// Setup:
// 1. Generate a fresh wallet (don't reuse your main dev wallet) -- e.g.
//    `cast wallet new` or any wallet generator.
// 2. Fund it with a SMALL amount of Arc Testnet USDC from the faucet --
//    only as much as you're comfortable an autonomous script spending.
// 3. Put its private key in .env.local as TREASURY_PRIVATE_KEY -- this must
//    NEVER be a NEXT_PUBLIC_* variable (unlike the swap KIT_KEY migration --
//    this key actually needs to stay server-only, since it can move funds
//    without any per-transaction user confirmation).

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(),
});

function getTreasuryClient() {
  if (!process.env.TREASURY_PRIVATE_KEY) {
    throw new Error(
      "TREASURY_PRIVATE_KEY not set — see lib/agent/treasuryWallet.ts setup notes"
    );
  }

  const account = privateKeyToAccount(
    process.env.TREASURY_PRIVATE_KEY as `0x${string}`
  );

  const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http(),
  });

  return { walletClient, account };
}

/**
 * Sends a USDC bonus from the treasury wallet to a provider. This is a
 * PLAIN ERC20 transfer -- intentionally NOT going through AgenticCommerce's
 * escrow flow, since AgenticCommerce is Arc's shared contract and this repo
 * doesn't own it / can't add custom logic inside it. The bonus lives
 * entirely in your own code, using the shared contract only as a read-only
 * data source (see speedBonusAgent.ts).
 */
export async function payBonus(
  to: `0x${string}`,
  amountBaseUnits: bigint
): Promise<`0x${string}`> {
  const { walletClient, account } = getTreasuryClient();

  const hash = await walletClient.writeContract({
    address: USDC_ARC_TESTNET,
    abi: ERC20_TRANSFER_ABI,
    functionName: "transfer",
    args: [to, amountBaseUnits],
    account,
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return hash;
}