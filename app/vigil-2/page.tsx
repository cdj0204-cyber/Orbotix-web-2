import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Vigil2DetailClient from "./Vigil2DetailClient";

export const metadata: Metadata = {
  title: "VYGIL-2 — ATX System | ORBOTIX INDUSTRIES",
  description: "VYGIL-2 platform by Orbotix Industries.",
};

export default function Vigil2Page() {
  return (
    <>
      <Navbar />
      <Vigil2DetailClient />
      <Footer />
    </>
  );
}
