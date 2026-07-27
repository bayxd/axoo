export default function CyberpunkBackground() {
  return (
    <>
      {/* grid backdrop — cyberpunk-only; hidden under frutiger via CSS
          (see .cyber-grid-backdrop rule in globals.css), since a technical
          grid reads as "digital/HUD" regardless of what color it's tinted */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.15] cyber-grid-backdrop"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(var(--brand-1-rgb) / 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--brand-1-rgb) / 0.35) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 25%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 25%, black 30%, transparent 100%)",
        }}
      />

      {/* glow orbs — colors now follow the active theme's brand variables,
          and all three share one gentle "ambient-orb" pulse (defined in
          globals.css) instead of Tailwind's animate-ping/animate-pulse, so
          motion feels the same calm "breathing" in both themes */}
      <div
        className="pointer-events-none fixed top-10 left-[10%] z-0 h-125 w-125 rounded-full blur-[120px] ambient-orb"
        style={{ backgroundColor: "rgb(var(--brand-1-rgb) / 0.2)" }}
      />
      <div
        className="pointer-events-none fixed top-1/3 right-[8%] z-0 h-87.5 w-87.5 rounded-full blur-[100px] ambient-orb"
        style={{ backgroundColor: "rgb(var(--brand-2-rgb) / 0.2)", animationDelay: "1.2s" }}
      />
      <div
        className="pointer-events-none fixed bottom-10 left-1/3 z-0 h-100 w-100 rounded-full blur-[110px] ambient-orb"
        style={{ backgroundColor: "rgb(var(--brand-3-rgb) / 0.15)", animationDelay: "2.4s" }}
      />
    </>
  );
}