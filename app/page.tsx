import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AssetPreloader from "@/components/AssetPreloader";
import Strategy from "@/components/Strategy";
import ProductShowcase from "@/components/ProductShowcase";
import SystemShowcase from "@/components/SystemShowcase";
import Newsroom from "@/components/Newsroom";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <AssetPreloader />
      <Navbar />
      <main>
        <Hero />
        <Strategy />
        <ProductShowcase />
        <SystemShowcase />
        <Newsroom />
      </main>
      <Footer />
    </>
  );
}
