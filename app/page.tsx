import GridSpotlight from "@/components/GridSpotlight";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Values from "@/components/Values";
import WASPER1 from "@/components/WASPER1";
import VMBRASystem from "@/components/VMBRASystem";
import VIGIL1 from "@/components/VIGIL1";
import Newsroom from "@/components/Newsroom";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <GridSpotlight />
      <Navbar />
      <main>
        <Hero />
        <Values />
        <WASPER1 />
        <VMBRASystem />
        <VIGIL1 />
        <Newsroom />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
