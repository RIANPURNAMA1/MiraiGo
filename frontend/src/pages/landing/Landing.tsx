import Header from "./components/Header";
import Hero from "./components/Hero";
import Pricing from "./components/Pricing";
import ValueProposition from "./components/ValueProposition";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import CTASection from "./components/CTASection";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Pricing />
      <ValueProposition />
      <Features />
      <Testimonials />
      <CTASection />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}