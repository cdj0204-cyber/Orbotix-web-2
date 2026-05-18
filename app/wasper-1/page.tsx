import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import WasperDetailClient from "./WasperDetailClient";

export const metadata: Metadata = {
  title: "WASPER-1 — ATA System | ORBOTIX INDUSTRIES",
  description: "WASPER-1 autonomous tactical aerial system by Orbotix Industries.",
};

export default function Wasper1Page() {
  return (
    <>
      <Navbar />
      <WasperDetailClient />
    </>
  );
}
