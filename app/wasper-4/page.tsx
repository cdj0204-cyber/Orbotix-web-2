import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Wasper4DetailClient from "./Wasper4DetailClient";

export const metadata: Metadata = {
  title: "VASPYR-4 — ATX System | ORBOTIX INDUSTRIES",
  description: "VASPYR-4 next-generation loitering munition platform by Orbotix Industries.",
};

export default function Wasper4Page() {
  return (
    <>
      <Navbar />
      <Wasper4DetailClient />
      <Footer />
    </>
  );
}
