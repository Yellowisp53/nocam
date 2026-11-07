import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { Hero } from "@/components/sections/Hero";
import { Niches } from "@/components/sections/Niches";
import { Works } from "@/components/sections/Works";
import { Cases } from "@/components/sections/Cases";
import { Services } from "@/components/sections/Services";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { Process } from "@/components/sections/Process";
import { AvatarStudio } from "@/components/sections/AvatarStudio";
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
        <Services />
        <HowWeWork />
        <Process />
        <Pricing />
        <AvatarStudio />
        <Faq />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <AuthDialog />
    </>
  );
}
