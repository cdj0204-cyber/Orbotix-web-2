import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AssetPreloader from "@/components/AssetPreloader";
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
        <ProductShowcase />
        <SystemShowcase />
        <Newsroom />
      </main>
      <Footer />
    </>
  );
}
