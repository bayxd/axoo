"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  usePublicClient,
} from "wagmi";
import { decodeEventLog } from "viem";

import {
  IDENTITY_REGISTRY_ADDRESS,
  IDENTITY_REGISTRY_ABI,
} from "@/lib/agent/agenticCommerce";

export type RegisterStatus = "idle" | "registering" | "success" | "failed";

// Fire-and-forget, same pattern as useJobBoard's reportTiming() -- doesn't
// block the UI or the registration flow if it fails, it's just an index for
// the auto-matching feature to read from later.
function addToProviderDirectory(
  address: string,
  agentId: bigint,
  metadataURI: string
) {
  fetch("/api/agent/directory/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, agentId: agentId.toString(), metadataURI }),
  }).catch((error) =>
    console.error("Could not add to provider directory:", error)
  );
}

// Looks up this wallet's own agentId from our directory (Redis), for the
// "already registered, reloaded the page" case. There's no onchain way to
// recover this -- IdentityRegistry has no agentIdOf/tokenOfOwnerByIndex, see
// agenticCommerce.ts's IDENTITY_REGISTRY_ABI comment for the full story.
async function lookupOwnAgentId(address: string): Promise<bigint | null> {
  try {
    const res = await fetch(
      `/api/agent/directory/lookup?address=${address.toLowerCase()}`
    );
    const data = await res.json();
    if (data.success && data.entry) {
      return BigInt(data.entry.agentId);
    }
    return null;
  } catch (error) {
    console.error("Could not look up own agentId from directory:", error);
    return null;
  }
}

export function useAgentIdentity() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [status, setStatus] = useState<RegisterStatus>("idle");
  const [agentId, setAgentId] = useState<bigint | undefined>(undefined);

  // FIXED: isRegistered used to read a function called `isRegistered` that
  // never existed on the real contract. IdentityRegistry is an ERC-721 --
  // "registered" just means "owns at least one Agent Identity NFT", which
  // is what balanceOf() answers (confirmed present on the real contract via
  // the explorer's Read/Write tab).
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: IDENTITY_REGISTRY_ADDRESS,
    abi: IDENTITY_REGISTRY_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const isRegistered = !!balance && (balance as bigint) > 0n;

  // If already registered (e.g. page reload) but we don't have the agentId
  // in this session yet, fetch it from our own directory -- see
  // lookupOwnAgentId() above for why this can't come from the contract.
  useEffect(() => {
    if (isRegistered && agentId === undefined && address) {
      lookupOwnAgentId(address).then((id) => {
        if (id !== null) setAgentId(id);
      });
    }
  }, [isRegistered, agentId, address]);

  async function register(metadataURI: string) {
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }

    try {
      setStatus("registering");

      const hash = await writeContractAsync({
        address: IDENTITY_REGISTRY_ADDRESS,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: "register",
        args: [metadataURI],
      });

      const receipt = await publicClient?.waitForTransactionReceipt({ hash });

      if (receipt?.status !== "success") {
        setStatus("failed");
        toast.error(
          "Registration transaction reverted on-chain — check the tx on the explorer for the reason"
        );
        return;
      }

      setStatus("success");
      toast.success("Agent registered on Arc");

      refetchBalance();

      // FIXED: this used to try reading agentIdOf(address) right after
      // registering -- that function doesn't exist. The only reliable way
      // to learn the freshly-minted agentId is to decode the ERC-721
      // Transfer event (mint: from=0x0, to=this wallet, tokenId=agentId)
      // straight out of THIS tx's own receipt. Same pattern already used
      // for decoding JobCreated in useJobBoard.ts.
      try {
        const log = receipt?.logs.find(
          (l) =>
            l.address.toLowerCase() === IDENTITY_REGISTRY_ADDRESS.toLowerCase()
        );

        if (!log) {
          console.error(
            "Registered, but no Transfer log found from IdentityRegistry in this receipt -- skipping directory add"
          );
          return;
        }

        const decoded = decodeEventLog({
          abi: IDENTITY_REGISTRY_ABI,
          eventName: "Transfer",
          topics: log.topics,
          data: log.data,
        });

        const freshAgentId = (decoded.args as { tokenId: bigint }).tokenId;

        setAgentId(freshAgentId);
        addToProviderDirectory(address, freshAgentId, metadataURI);
      } catch (decodeError) {
        console.error(
          "Could not decode Transfer log after registering -- skipping directory add:",
          decodeError
        );
      }
    } catch (error) {
      console.error(error);
      setStatus("failed");
      toast.error("Registration failed");
    }
  }

  return {
    status,
    isRegistered,
    agentId,
    register,
  };
}