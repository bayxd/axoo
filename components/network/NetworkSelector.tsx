"use client";

import { useEffect, useRef, useState } from "react";

export type NetworkOption = {
  value: string;
  label: string;
  dot: string;
};

function ChainLogo({ value, size = 22 }: { value: string; size?: number }) {
  switch (value) {
    case "Base_Sepolia":
      return (
        <span
          style={{ width: size, height: size, backgroundColor: "#0052FF" }}
          className="flex shrink-0 items-center justify-center rounded-full"
        >
          <span
            style={{ width: size * 0.4, height: size * 0.4 }}
            className="rounded-[3px] bg-white"
          />
        </span>
      );

    case "Ethereum_Sepolia":
      return (
        <span
          style={{ width: size, height: size, backgroundColor: "#101323" }}
          className="flex shrink-0 items-center justify-center rounded-full"
        >
          <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55}>
            <path d="M12 1.5 5 12.3l7 4.1 7-4.1L12 1.5Z" fill="#8C9EFF" />
            <path d="M12 1.5v14.9l7-4.1L12 1.5Z" fill="#627EEA" />
            <path d="M5 13.6 12 22.5v-5.1l-7-3.8Z" fill="#8C9EFF" />
            <path d="M12 17.4v5.1l7-8.9-7 3.8Z" fill="#627EEA" />
          </svg>
        </span>
      );

    case "Arbitrum_Sepolia":
      return (
        <span
          style={{ width: size, height: size, backgroundColor: "#12172B" }}
          className="flex shrink-0 items-center justify-center rounded-full"
        >
          <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6}>
            <path d="M12 3 4.5 8v8L12 21l7.5-5V8L12 3Z" fill="none" stroke="#28A0F0" strokeWidth="1.6" />
            <path d="M9 15.5 12 8l3 7.5h-2l-1-2.6-1 2.6H9Z" fill="#28A0F0" />
          </svg>
        </span>
      );

    case "Polygon_Amoy_Testnet":
      return (
        <span
          style={{ width: size, height: size, backgroundColor: "#12081F" }}
          className="flex shrink-0 items-center justify-center rounded-full"
        >
          <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62}>
            <path
              d="M16 8.3 12.7 6.4a1.4 1.4 0 0 0-1.4 0L8 8.3 5.7 7v3l2.3 1.3v3.4L11.3 17a1.4 1.4 0 0 0 1.4 0l3.3-1.9v-3l-2.3 1.3-2-1.1v-2.2l2-1.2 2 1.2Z"
              fill="#8247E5"
            />
          </svg>
        </span>
      );

    default:
      return (
        <span
          style={{ width: size, height: size, backgroundColor: "#EC4899" }}
          className="flex shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
        >
          A
        </span>
      );
  }
}

type Props = {
  value: string;
  options: NetworkOption[];
  onChange: (value: string) => void;
};

export default function NetworkSelector({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        pr-3.5
        py-1.5
        text-sm
        font-semibold
        cursor-pointer
        duration-200
        "
      >
        <ChainLogo value={current.value} />
        {current.label}
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
          w-56
          rounded-2xl
          border
          border-white/10
          bg-zinc-900/95
          backdrop-blur-xl
          shadow-2xl
          overflow-hidden
          "
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
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
                option.value === value
                  ? "bg-[rgb(var(--brand-1-rgb)/0.15)] text-white"
                  : "text-zinc-300 hover:bg-white/5"
              }
              `}
            >
              <ChainLogo value={option.value} />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}