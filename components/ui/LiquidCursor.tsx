"use client";

import { useEffect, useRef } from "react";
import { useThemeStyle } from "@/context/ThemeStyleContext";

const DROP_COUNT = 5;
const SIZES = [26, 20, 16, 12, 9];

export default function LiquidCursor() {
  const { theme } = useThemeStyle();
  const dropsRef = useRef<(HTMLDivElement | null)[]>([]);
  const mouse = useRef({ x: -100, y: -100 });
  const positions = useRef(
    Array.from({ length: DROP_COUNT }, () => ({ x: -100, y: -100 }))
  );

  useEffect(() => {
    if (theme !== "frutiger") return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function handleMove(e: MouseEvent) {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    }

    window.addEventListener("mousemove", handleMove);

    let raf: number;

    function animate() {
      const pos = positions.current;

      // head droplet chases the real cursor
      pos[0].x += (mouse.current.x - pos[0].x) * 0.35;
      pos[0].y += (mouse.current.y - pos[0].y) * 0.35;

      // each trailing droplet chases the one in front of it,
      // a little slower each time -> the "liquid trail" feel
      for (let i = 1; i < pos.length; i++) {
        pos[i].x += (pos[i - 1].x - pos[i].x) * 0.3;
        pos[i].y += (pos[i - 1].y - pos[i].y) * 0.3;
      }

      pos.forEach((p, i) => {
        const el = dropsRef.current[i];
        if (el) {
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
        }
      });

      raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(raf);
    };
  }, [theme]);

  if (theme !== "frutiger") return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block"
    >
      {/* gooey merge filter - what makes the droplets blend into one liquid blob */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="liquid-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        className="absolute inset-0"
        style={{ filter: "url(#liquid-goo)" }}
      >
        {SIZES.map((size, i) => (
          <div
            key={i}
            ref={(el) => {
              dropsRef.current[i] = el;
            }}
            className="
              absolute top-0 left-0 rounded-full
              bg-gradient-to-br from-sky-300 via-cyan-400 to-blue-500
              dark:from-sky-400 dark:via-cyan-400 dark:to-blue-500
              opacity-80
            "
            style={{
              width: `${size}px`,
              height: `${size}px`,
              boxShadow:
                i === 0
                  ? "0 0 14px rgba(56,189,248,0.55), inset 0 1px 2px rgba(255,255,255,0.8)"
                  : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}