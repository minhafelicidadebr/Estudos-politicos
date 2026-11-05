import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import SocialProofBar from "@/components/landing/SocialProofBar";
import ValuePropSection from "@/components/landing/ValuePropSection";
import MethodologyVisualSection from "@/components/landing/MethodologyVisualSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PedagogicalFeaturesSection from "@/components/landing/PedagogicalFeaturesSection";
import ARPlusTeaserSection from "@/components/landing/ARPlusTeaserSection";
import AdvancedModulesShowcase from "@/components/landing/AdvancedModulesShowcase";
import PricingSection from "@/components/landing/PricingSection";
import FinalCTASection from "@/components/landing/FinalCTASection";

const Index = () => {
  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <SocialProofBar />
        <ValuePropSection />
        <MethodologyVisualSection />
        <HowItWorksSection />
        <PedagogicalFeaturesSection />
        <ARPlusTeaserSection />
        <AdvancedModulesShowcase />
        <PricingSection />
        <FinalCTASection />
      </main>
      <Footer />
    </>
  );
};

export default Index;
