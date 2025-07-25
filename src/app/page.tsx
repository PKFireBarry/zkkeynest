import Hero from "@/components/Hero";
import EncryptionExplanation from "@/components/EncryptionExplanation";
import PerfectFor from "@/components/PerfectFor";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PricingSection from "@/components/PricingSection";
import TrustCredibility from "@/components/TrustCredibility";
import ComplianceSection from "@/components/ComplianceSection";
import ValueProposition from "@/components/ValueProposition";
import FAQ from "@/components/FAQ";


export default function Home() {
  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-background text-foreground font-sans flex flex-col">
      <Navbar showAllHomeSections />
      <Hero />
      <PerfectFor />
      <EncryptionExplanation />
      <ValueProposition />
      <TrustCredibility />
      <PricingSection />
      <ComplianceSection />
      <FAQ />
      <Footer />
    </div>
  );
}

