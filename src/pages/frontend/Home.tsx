import { CallToAction } from "@/components/sections/home/CallToAction";
import { Hero } from "@/components/sections/home/Hero";
import { Specialties } from "@/components/sections/home/Specialties";
import { WhyChoose } from "@/components/sections/home/WhyChoose";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function Home() {
  return (
    <>
      <Hero />
      <ScrollReveal delayMs={60}>
        <WhyChoose />
      </ScrollReveal>
      <ScrollReveal delayMs={60}>
        <Specialties />
      </ScrollReveal>
      <ScrollReveal delayMs={60}>
        <CallToAction />
      </ScrollReveal>
    </>
  );
}
