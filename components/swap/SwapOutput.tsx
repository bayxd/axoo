import TokenSelector from "../TokenSelector";

type Props = {
  amount?: string | number;
  tokenOut: string;
  balance: number;
  quoteAmount?: string | number;
};

export default function SwapOutput({
  amount,
  quoteAmount,
  tokenOut,
  balance
}: Props) {

  const displayAmount =
    quoteAmount !== undefined && quoteAmount !== null
      ? quoteAmount
      : amount;

  return (
    <div
      className="
        bg-zinc-100/80
        dark:bg-zinc-800/80
        border
        border-black/5
        dark:border-white/5
        rounded-2xl
        p-4
        mt-2
        hover:border-[rgb(var(--brand-3-rgb)/0.3)]
        hover:bg-zinc-200
        dark:hover:bg-zinc-800
        duration-300
      "
    >
      <div className="flex justify-between items-center">
        <p className="text-[10px] tracking-widest uppercase text-zinc-500 font-semibold">
          You Receive
        </p>

        <p className="text-[11px] font-mono text-zinc-500">
          Bal <span className="text-zinc-700 dark:text-zinc-300">{balance.toFixed(4)}</span> {tokenOut}
        </p>
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <div className="text-3xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
          {displayAmount}
        </div>

        <TokenSelector value={tokenOut} readOnly />
      </div>
    </div>
  );
}