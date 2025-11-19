import { CodeExamplesSection } from "@/components/landing/code-examples-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { InstallationSection } from "@/components/landing/installation-section";
import { InteractiveDemoSection } from "@/components/landing/interactive-demo-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />
      <FeaturesSection />
      <InteractiveDemoSection />
      <CodeExamplesSection />
      <InstallationSection />
    </div>
  );
}
