import ConnectWallet from "@/components/ConnectWallet";
import BridgeCard from "@/components/bridge/BridgeCard";
import BridgeHistory from "@/components/bridge/BridgeHistory";
import Footer from "@/components/dashboard/Footer";
import RequireGenesisPass from "@/components/nft/RequireGenesisPass";
import CyberpunkBackground from "@/components/ui/CyberpunkBackground";

export default function BridgePage() {

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
            max-w-[1100px]
            mx-auto
            px-8
            xl:px-16
            pt-32
            pb-25
            space-y-10
            "
          >

            <div
              className="
              max-w-[1100px]
              mx-auto
              space-y-10
              mt-5
              "
            >

              <BridgeCard />

              <BridgeHistory />

            </div>

          </div>

        </RequireGenesisPass>

      </div>

      <Footer />

    </main>

  );

}