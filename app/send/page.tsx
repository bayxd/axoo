import ConnectWallet from "@/components/ConnectWallet";
import SendCard from "@/components/send/SendCard";
import Footer from "@/components/dashboard/Footer";
import RequireGenesisPass from "@/components/nft/RequireGenesisPass";
import SendHistory from "@/components/send/SendHistory";
import CyberpunkBackground from "@/components/ui/CyberpunkBackground";

export default function SendPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white flex flex-col">
      <CyberpunkBackground />

      <ConnectWallet />

      <div className="flex-1 flex flex-col">
        <RequireGenesisPass>
          <div
            className="
              relative
              z-10
              w-full
              max-w-[18000px]
              mx-auto
              px-8
              xl:px-16
              pt-32
              pb-25
              space-y-16
              mt-5
            "
          >
            {/* Send Card */}
            <section className="flex justify-center">
              <SendCard />
            </section>

            {/* Send History */}
            <section className="flex justify-center">
              <div className="w-full max-w-200">
                <SendHistory />
              </div>
            </section>
          </div>
        </RequireGenesisPass>
      </div>

      <Footer />
    </main>
  );
}