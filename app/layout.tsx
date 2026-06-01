import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ORBOTIX INDUSTRIES — Building tomorrow's defense, today",
  description:
    "Advanced autonomous systems for defense — ATX System, VASPYR-1, UMBRIX System, VYGIL-1.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} antialiased`}>
      <body className="bg-black text-white min-h-screen">{children}</body>
    </html>
  );
}
