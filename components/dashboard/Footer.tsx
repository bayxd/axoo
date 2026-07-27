import Link from "next/link";
import Image from "next/image";

export default function Footer() {

  return (

    <footer
      className="
      relative
      mt-20
      border-t
      border-black/5
      dark:border-white/5
      py-10
      text-zinc-500
      dark:text-zinc-400
      overflow-hidden
      "
    >

      {/* neon top strip */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-[rgb(var(--brand-1-rgb)/0.6)] via-[rgb(var(--brand-2-rgb)/0.6)] to-[rgb(var(--brand-3-rgb)/0.6)]" />

      {/* soft glow accents */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-48 w-48 rounded-full bg-[rgb(var(--brand-1-rgb)/0.1)] blur-3xl" />
      <div className="pointer-events-none absolute -top-24 right-1/4 h-48 w-48 rounded-full bg-[rgb(var(--brand-3-rgb)/0.1)] blur-3xl" />

      <div
        className="
        relative
        max-w-[1800px]
        mx-auto
        px-10
        flex
        flex-col
        md:flex-row
        items-center
        justify-between
        gap-6
        "
      >

        <div>

          <Link href="/" className="flex items-center gap-3 justify-center md:justify-start">
            <Image
              src="/logo.png"
              alt="Axoo"
              width={35}
              height={35}
              className="scale-125 drop-shadow-[0_0_6px_rgb(var(--brand-1-rgb)/0.4)]"
            />

            <h3 className="text-lg font-black bg-linear-to-r from-[var(--brand-1)] via-[var(--brand-2)] to-[var(--brand-3)] bg-clip-text text-transparent tracking-tight">
              Axoo
            </h3>
          </Link>

          <p className="mt-3 text-sm font-mono text-zinc-500 dark:text-zinc-500">
            Move Money Across Chains.
          </p>

          <p className="mt-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-600">
            © 2026 Axoo · Built with Next.js and Circle
          </p>

        </div>


        <div className="flex items-center gap-3">

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-600 mr-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Arc Testnet
          </div>

          <a
            href="https://faucet.circle.com/"
            target="_blank"
            rel="noreferrer"
            className="
            group
            flex
            items-center
            gap-1.5
            h-9
            px-4
            rounded-full
            border
            border-black/10
            dark:border-white/10
            bg-black/[0.03]
            dark:bg-white/[0.03]
            text-xs
            font-semibold
            tracking-wide
            text-zinc-500
            dark:text-zinc-400
            transition-all
            duration-300
            hover:border-[rgb(var(--brand-3-rgb)/0.4)]
            hover:bg-[rgb(var(--brand-3-rgb)/0.1)]
            hover:text-[var(--brand-3)]
            dark:hover:text-[var(--brand-3-dark)]
            hover:-translate-y-0.5
            "
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="transition-transform duration-300 group-hover:scale-110"
            >
              <path d="M12 2C12 2 5 10.5 5 15.5a7 7 0 0 0 14 0C19 10.5 12 2 12 2Zm0 17a5 5 0 0 1-5-5c0-.28.03-.56.08-.85.5 1.9 2.2 3.35 4.42 3.35 1.4 0 2.6-.58 3.5-1.5-.36 2.3-2.35 4-4.5 4.5-.16.03-.33.05-.5.05Z" />
            </svg>
            Faucet
          </a>

          <a
            href="https://github.com/bayxd/axoo/"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="
            group
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-black/10
            dark:border-white/10
            bg-black/[0.03]
            dark:bg-white/[0.03]
            text-zinc-500
            transition-all
            duration-300
            hover:border-[rgb(var(--brand-1-rgb)/0.4)]
            hover:bg-[rgb(var(--brand-1-rgb)/0.1)]
            hover:text-[var(--brand-1)]
            dark:hover:text-[var(--brand-1-dark)]
            hover:-translate-y-0.5
            "
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="transition-transform duration-300 group-hover:scale-110"
            >
              <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.27 5.68.42.36.78 1.07.78 2.15 0 1.56-.01 2.81-.01 3.19 0 .31.2.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
            </svg>
          </a>

          <a
            href="https://x.com/forbyuu"
            target="_blank"
            rel="noreferrer"
            aria-label="X (Twitter)"
            className="
            group
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-black/10
            dark:border-white/10
            bg-black/[0.03]
            dark:bg-white/[0.03]
            text-zinc-500
            transition-all
            duration-300
            hover:border-[rgb(var(--brand-2-rgb)/0.4)]
            hover:bg-[rgb(var(--brand-2-rgb)/0.1)]
            hover:text-[var(--brand-2)]
            dark:hover:text-[var(--brand-2)]
            hover:-translate-y-0.5
            "
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="transition-transform duration-300 group-hover:scale-110"
            >
              <path d="M18.9 1.9h3.6l-7.9 9 9.3 12.2h-7.3l-5.7-7.5-6.5 7.5H1L9.4 14 .5 1.9h7.5l5.2 6.9 5.7-6.9Zm-1.3 19h2L6.5 3.9H4.3L17.6 20.9Z" />
            </svg>
          </a>

          <a
            href="https://x.com/AxooApp"
            target="_blank"
            rel="noreferrer"
            aria-label="X (Twitter)"
            className="
            group
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-black/10
            dark:border-white/10
            bg-black/[0.03]
            dark:bg-white/[0.03]
            text-zinc-500
            transition-all
            duration-300
            hover:border-[rgb(var(--brand-2-rgb)/0.4)]
            hover:bg-[rgb(var(--brand-2-rgb)/0.1)]
            hover:text-[var(--brand-2)]
            dark:hover:text-[var(--brand-2)]
            hover:-translate-y-0.5
            "
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="transition-transform duration-300 group-hover:scale-110"
            >
              <path d="M18.9 1.9h3.6l-7.9 9 9.3 12.2h-7.3l-5.7-7.5-6.5 7.5H1L9.4 14 .5 1.9h7.5l5.2 6.9 5.7-6.9Zm-1.3 19h2L6.5 3.9H4.3L17.6 20.9Z" />
            </svg>
          </a>


        </div>

      </div>

    </footer>

  );

}