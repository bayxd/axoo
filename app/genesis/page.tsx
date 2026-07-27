import ConnectWallet from "@/components/ConnectWallet";
import Footer from "@/components/dashboard/Footer";
import RequireGenesisPass from "@/components/nft/RequireGenesisPass";
import GenesisPassCard from "@/components/nft/GenesisPassCard";
import CyberpunkBackground from "@/components/ui/CyberpunkBackground";

export default function GenesisPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white flex flex-col">
      <CyberpunkBackground />

      <ConnectWallet />

      <div className="flex-1 flex flex-col">
        <RequireGenesisPass>
          <div className="relative z-10 w-full max-w-[1800px] mx-auto px-8 xl:px-16 pt-32 pb-25 mt-5">
            <GenesisPassCard />
          </div>
        </RequireGenesisPass>
      </div>

      <Footer />
    </main>
  );
}