import {
  SLIPPAGE_OPTIONS
}
from "@/constants/slippage";

type Props = {

  slippage: string;

  setSlippage:
    (
      value: string
    ) => void;

};

export default function SlippageSelector({

  slippage,

  setSlippage

}: Props) {

  return (

    <div
      className="
      mt-3
      flex
      items-center
      gap-1.5
      "
    >

      <span
        className="
        text-[10px]
        uppercase
        tracking-widest
        text-zinc-600
        font-semibold
        mr-1
        "
      >
        Slip
      </span>

      {

        SLIPPAGE_OPTIONS.map(

          (value) => (

            <button

              key={value}

              onClick={() =>

                setSlippage(

                  value

                )

              }

              className={`
                px-3
                py-1.5
                rounded-lg
                text-xs
                font-mono
                font-semibold
                duration-300
                border

                ${

                  slippage === value

                    ?

                    "bg-[var(--brand-1)] border-[var(--brand-1)] text-white shadow-[0_0_12px_rgb(var(--brand-1-rgb)/0.4)]"

                    :

                    "bg-zinc-100/80 dark:bg-zinc-800/80 border-black/5 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"

                }

              `}

            >

              {value}%

            </button>

          )

        )

      }

    </div>

  );

}