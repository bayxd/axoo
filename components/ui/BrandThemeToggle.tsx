"use client";

import { useThemeStyle } from "@/context/ThemeStyleContext";

export default function BrandThemeToggle() {
  const { theme, setTheme } = useThemeStyle();
  const isFrutiger = theme === "frutiger";

  return (
    <div
      role="tablist"
      aria-label="Pilih tema"
      className="
      relative
      flex
      items-center
      rounded-full
      p-1
      bg-zinc-900/5
      dark:bg-white/5
      border
      border-black/5
      dark:border-white/10
      "
    >
      {/* Sliding thumb */}
      <span
        aria-hidden
        className={`
          absolute
          top-1
          bottom-1
          w-[calc(50%-0.125rem)]
          rounded-full
          transition-all
          duration-300
          ease-out
          ${
            isFrutiger
              ? "left-[calc(50%+0.0625rem)] bg-gradient-to-b from-sky-400 via-cyan-500 to-blue-600 shadow-[0_2px_8px_rgba(14,165,233,0.4)]"
              : "left-1 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 shadow-[0_0_10px_rgba(217,70,239,0.4)]"
          }
        `}
      />

      <button
        type="button"
        role="tab"
        aria-selected={!isFrutiger}
        onClick={() => setTheme("cyberpunk")}
        className={`
          relative z-10 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest
          transition-colors duration-300
          ${
            !isFrutiger
              ? "text-white"
              : "text-zinc-500 dark:text-zinc-400"
          }
        `}
      >
        Cyber
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={isFrutiger}
        onClick={() => setTheme("frutiger")}
        className={`
          relative z-10 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest
          transition-colors duration-300
          ${
            isFrutiger
              ? "text-white"
              : "text-zinc-500 dark:text-zinc-400"
          }
        `}
      >
        Liquid
      </button>
    </div>
  );
}