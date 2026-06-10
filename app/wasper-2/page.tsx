import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Wasper2DetailClient from "./Wasper2DetailClient";

export const metadata: Metadata = {
  title: "VASPYR-2 — ATX System | ORBOTIX INDUSTRIES",
  description: "VASPYR-2 next-generation loitering munition platform by Orbotix Industries.",
};

export default function Wasper2Page() {
  return (
    <>
      <Navbar />
      <Wasper2DetailClient />
      <Footer />
    </>
  );
}
