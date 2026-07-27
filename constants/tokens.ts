import { Token } from "@/types/Token";

export const TOKENS: {
  USDC: Token;
  EURC: Token;
} = {
  USDC: {
    symbol: "USDC",
    address: "0x3600000000000000000000000000000000000000",
    decimals: 6,
  },

  EURC: {
    symbol: "EURC",
    address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
    decimals: 6,
  },
};