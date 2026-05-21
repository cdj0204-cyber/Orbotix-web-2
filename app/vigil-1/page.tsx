import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import VigilDetailClient from "./VigilDetailClient";

export const metadata: Metadata = {
  title: "VIGIL-1 — Autonomous Persistent Surveillance | ORBOTIX INDUSTRIES",
  description:
    "VIGIL-1 drone-in-a-box system for autonomous multi-sensor surveillance operations.",
};

export default function Vigil1Page() {
  return (
    <>
      <Navbar />
      <VigilDetailClient />
    </>
  );
}
