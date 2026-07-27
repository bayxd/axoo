"use client";

import { useState } from "react";

export interface RankedProvider {
  address: `0x${string}`;
  agentId: string;
  reputation: number;
  feedbackCount: number;
}

export function useProviderDirectory() {
  const [loading, setLoading] = useState(false);

  async function findBestProvider(
    excludeAddress?: string
  ): Promise<RankedProvider | null> {
    setLoading(true);
    try {
      const params = excludeAddress ? `?exclude=${excludeAddress}` : "";
      const res = await fetch(`/api/agent/directory/best${params}`);
      const data = await res.json();

      if (!data.success || data.providers.length === 0) return null;
      return data.providers[0] as RankedProvider;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { loading, findBestProvider };
}