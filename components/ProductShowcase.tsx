"use client";

import Link from "next/link";

interface ProductCard {
  category: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
}

const PRODUCTS: ProductCard[] = [
  {
    category: "ATX SYSTEM",
    title: "VASPYR-2",
    subtitle: "Precision Strike. Rapid Deployment.",
    image: "/image/Wasper/Wasper_Main%204.png",
    href: "/wasper-2",
  },
  {
    category: "UMBRIX SYSTEM",
    title: "VYGIL-1",
    subtitle: "Rapid-Response ISR. Real-Time Situational Awareness.",
    image: "/image/Vigil/Vigil%2001.png",
    href: "/vigil-1",
  },
];

export default function ProductShowcase() {
  return (
    <section className="bg-black px-4 sm:px-10 pt-28 sm:pt-40 pb-0">
      <h2 className="text-white text-[25px] font-medium uppercase tracking-normal leading-none mb-6 sm:mb-8">
        Technology
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {PRODUCTS.map((p) => (
          <div
            key={p.title}
            className="group relative overflow-hidden aspect-[16/10]"
            style={{ backgroundColor: "#f0f0f0" }}
          >
            {/* 배경 렌더링 이미지 */}
            <img
              src={p.image}
              alt={p.title}
              className="absolute inset-0 w-full h-full object-contain transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />

            {/* 가독성용 그라데이션 (상·하단) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)",
              }}
            />

            {/* 하단 타이틀 + 버튼 */}
            <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 right-6">
              <h3 className="text-white text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tighter uppercase leading-none mb-2">
                {p.title}
              </h3>
              <p className="text-white/80 text-sm sm:text-base tracking-wide mb-5 sm:mb-6">
                {p.subtitle}
              </p>

              <div className="flex items-center gap-3">
                <Link
                  href={p.href}
                  className="px-6 sm:px-7 h-8 sm:h-9 inline-flex items-center justify-center bg-white text-black text-sm sm:text-base font-semibold hover:bg-white/85 transition-colors"
                >
                  Learn More
                </Link>
                <Link
                  href="#"
                  className="px-6 sm:px-7 h-8 sm:h-9 inline-flex items-center justify-center bg-black/30 backdrop-blur-sm border border-white/40 text-white text-sm sm:text-base font-semibold hover:bg-white hover:text-black hover:border-white transition-all"
                >
                  Ask Quote
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
