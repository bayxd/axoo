import RequireGenesisPass from "@/components/nft/RequireGenesisPass";
import ConnectWallet from "@/components/ConnectWallet";
import SwapCard from "@/components/swap/SwapCard";
import SwapHistory from "@/components/swap/SwapHistory";
import Footer from "@/components/dashboard/Footer";
import CyberpunkBackground from "@/components/ui/CyberpunkBackground";

export default function SwapPage() {

  return (

    <main
      className="
      relative
      min-h-screen
      overflow-hidden
      text-white
      flex
      flex-col
      "
    >

      <CyberpunkBackground />

      <ConnectWallet />

      <div className="flex-1 flex flex-col">

        <RequireGenesisPass>
        <div
          className="
          relative
          z-10
          w-full
          max-w-7xl
          mx-auto
          px-6
          pt-32
          pb-10
          "
        >

          {/* Swap Card */}

          <section
            className="
            max-w-[1100px]
            mx-auto
            mt-5
            "
          >

            <SwapCard />

          </section>


          {/* History + Activity */}

          <section
            className="
            max-w-[1100px]
            mx-auto
            mt-20
            space-y-8
            "
          >


            <SwapHistory />



          </section>

        </div>

        </RequireGenesisPass>

      </div>

      <Footer />

    </main>

  );

}