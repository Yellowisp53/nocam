import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Niches } from "@/components/sections/Niches";
import { Works } from "@/components/sections/Works";
import { Cases } from "@/components/sections/Cases";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { Process } from "@/components/sections/Process";
import { Calculator } from "@/components/sections/Calculator";
import { Pricing } from "@/components/sections/Pricing";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Niches />
        <Works />
        <Cases />
        <About />
        <Services />
        <HowWeWork />
        <Process />
        <Pricing />
        <Calculator />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
