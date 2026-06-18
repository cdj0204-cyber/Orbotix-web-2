import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Wasper3DetailClient from "./Wasper3DetailClient";

export const metadata: Metadata = {
  title: "VASPYR-3 — ATX System | ORBOTIX INDUSTRIES",
  description: "VASPYR-3 next-generation loitering munition platform by Orbotix Industries.",
};

export default function Wasper3Page() {
  return (
    <>
      <Navbar />
      <Wasper3DetailClient />
      <Footer />
    </>
  );
}
