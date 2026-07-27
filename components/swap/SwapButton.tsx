import { SwapStatus } from "@/types/SwapStatus";

type Props = {

  status: SwapStatus;

  tokenIn: string;

  tokenOut: string;

  onClick: () => void;

};

export default function SwapButton({

  status,

  tokenIn,

  tokenOut,

  onClick

}: Props) {

  const disabled =
    status !== "idle"
    &&
    status !== "success"
    &&
    status !== "failed";

  return (

    <button

      onClick={onClick}

      disabled={disabled}

      className="
      group
      relative
      w-full
      h-12
      mt-4
      rounded-xl
      text-sm
      font-bold
      tracking-wide
      uppercase
      overflow-hidden
      bg-linear-to-r
      from-[var(--brand-1)]
      via-[var(--brand-2)]
      to-[var(--brand-3)]
      hover:scale-[1.01]
      active:scale-[0.99]
      disabled:opacity-60
      disabled:hover:scale-100
      duration-300
      shadow-[0_0_20px_rgb(var(--brand-1-rgb)/0.25)]
      hover:shadow-[0_0_28px_rgb(var(--brand-1-rgb)/0.4)]
      "

    >

      <span className="relative z-10">

      {

        status === "estimating"

          ?

          "Estimating..."

          :

        status === "swapping"

          ?

          "Swapping..."

          :

        status === "pending"

          ?

          "Pending..."

          :

          `Swap ${tokenIn} → ${tokenOut}`

      }

      </span>

    </button>

  );

}