"use client";

import { useEffect, useRef, useState } from "react";

const TOKENS = ["USDC", "EURC"] as const;

const TOKEN_STYLES: Record<string, { bg: string; symbol: string }> = {
  USDC: { bg: "#2775CA", symbol: "$" },
  EURC: { bg: "#1BA27A", symbol: "€" },
};

export function TokenLogo({
  symbol,
  size = 22,
}: {
  symbol: string;
  size?: number;
}) {
  const style = TOKEN_STYLES[symbol] ?? { bg: "#52525b", symbol: "?" };

  return (
    <span
      style={{
        width: size,
        height: size,
        backgroundColor: style.bg,
        fontSize: size * 0.55,
      }}
      className="
      flex
      shrink-0
      items-center
      justify-center
      rounded-full
      font-bold
      text-white
      leading-none
      "
    >
      {style.symbol}
    </span>
  );
}

type Props = {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
};

export default function TokenSelector({ value, onChange, readOnly }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Read-only mode (used in SwapOutput — no dropdown, just badge + logo)
  if (readOnly || !onChange) {
    return (
      <div
        className="
        flex
        items-center
        gap-2
        bg-zinc-700/80
        border
        border-white/5
        rounded-full
        pl-2
        pr-4
        py-1.5
        text-sm
        font-semibold
        "
      >
        <TokenLogo symbol={value} />
        {value}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="
        flex
        items-center
        gap-2
        bg-zinc-700/80
        hover:bg-zinc-700
        border
        border-white/5
        rounded-full
        pl-2
        pr-3
        py-1.5
        text-sm
        font-semibold
        cursor-pointer
        duration-200
        "
      >
        <TokenLogo symbol={value} />
        {value}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-zinc-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className="
          absolute
          right-0
          mt-2
          z-20
          w-40
          rounded-2xl
          border
          border-white/10
          bg-zinc-900/95
          backdrop-blur-xl
          shadow-2xl
          overflow-hidden
          "
        >
          {TOKENS.map((token) => (
            <button
              key={token}
              type="button"
              onClick={() => {
                onChange(token);
                setOpen(false);
              }}
              className={`
              w-full
              flex
              items-center
              gap-2.5
              px-3.5
              py-2.5
              text-sm
              font-semibold
              text-left
              duration-150
              ${
                token === value
                  ? "bg-[rgb(var(--brand-1-rgb)/0.15)] text-white"
                  : "text-zinc-300 hover:bg-white/5"
              }
              `}
            >
              <TokenLogo symbol={token} />
              {token}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}