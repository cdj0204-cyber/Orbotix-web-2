import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Wasper1DetailClient from "./Wasper1DetailClient";

export const metadata: Metadata = {
  title: "VASPYR-1 — ATX System | ORBOTIX INDUSTRIES",
  description: "VASPYR-1 precision strike UAV platform by Orbotix Industries.",
};

export default function Wasper1Page() {
  return (
    <>
      <Navbar />
      <Wasper1DetailClient />
      <Footer />
    </>
  );
}
