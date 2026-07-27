type Props = {

  result: any;

};

export default function SwapResultCard({

  result

}: Props) {

  if (!result) return null;

  const txHash =
    result?.result?.txHash;

  return (

    <div
      className="
      mt-4
      rounded-xl
      border
      border-emerald-500/20
      bg-emerald-500/5
      p-4
      "
    >

      <div
        className="
        flex
        items-center
        justify-between
        "
      >

        <h3
          className="
          text-emerald-400
          font-bold
          text-sm
          "
        >
          Swap Completed
        </h3>

        <span
          className="
          text-[10px]
          font-mono
          rounded-full
          bg-emerald-500/20
          px-2.5
          py-1
          text-emerald-400
          "
        >
          {result?.status?.progress?.status}
        </span>

      </div>

      <div
        className="
        mt-3
        space-y-2
        text-xs
        "
      >

        <div className="flex justify-between">

          <span className="text-zinc-500">

            Received

          </span>

          <span className="font-mono font-semibold">

            {result?.result?.amountOut}{" "}

            {result?.result?.tokenOut}

          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-zinc-500">

            Transaction

          </span>

          <span
            className="
            font-mono
            "
          >

            {txHash?.slice(0,8)}

            ...

            {txHash?.slice(-6)}

          </span>

        </div>

      </div>

      <a

        href={result?.result?.explorerUrl}

        target="_blank"

        rel="noreferrer"

        className="
        mt-4
        block
        rounded-lg
        bg-zinc-800
        border
        border-white/5
        py-2.5
        text-center
        text-xs
        font-semibold
        hover:bg-zinc-700
        hover:border-[rgb(var(--brand-1-rgb)/0.3)]
        duration-300
        "

      >

        View on ArcScan ↗

      </a>

    </div>

  );

}