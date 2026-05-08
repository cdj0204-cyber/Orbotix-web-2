import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AssetPreloader from "@/components/AssetPreloader";
import Values from "@/components/Values";
import WASPER1 from "@/components/WASPER1";
import VIGIL1 from "@/components/VIGIL1";
import Newsroom from "@/components/Newsroom";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <AssetPreloader />
      <Navbar />
      <main>
        <Hero />
        <Values />
        <WASPER1 />
        <VIGIL1 />
        <Newsroom />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
