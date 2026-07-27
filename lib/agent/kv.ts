import { Redis } from "@upstash/redis";

// Shared Upstash Redis client -- REST-based (not a raw TCP connection), so
// it works correctly from Vercel serverless/edge functions where each
// invocation may be a fresh, short-lived process. This replaces the local
// `fs` JSON files that jobTiming.ts and bonusStore.ts used to write to,
// which don't persist reliably across Vercel cold starts/redeploys.
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});