"use client";

import Link from "next/link";

interface SystemCard {
  category: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
}

const SYSTEMS: SystemCard[] = [
  {
    category: "ATX SYSTEM",
    title: "ATX SYSTEM",
    subtitle: "Autonomous Strike Platform",
    image: "/image/ATA%20system/ATA%20system_main.png",
    href: "#",
  },
  {
    category: "UMBRIX SYSTEM",
    title: "UMBRIX SYSTEM",
    subtitle: "Persistent Surveillance Network",
    image: "/image/VMBRA%20system/VMBRA_main.png",
    href: "#",
  },
];

export default function SystemShowcase() {
  return (
    <section className="bg-black px-4 sm:px-10 pt-28 sm:pt-40 pb-0">
      <h2 className="text-white text-[25px] font-medium uppercase tracking-normal leading-none mb-6 sm:mb-8">
        Systems
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {SYSTEMS.map((s) => (
          <div
            key={s.title}
            className="group relative overflow-hidden aspect-[16/10] sm:aspect-[16/9]"
          >
            {/* 배경 렌더링 이미지 */}
            <img
              src={s.image}
              alt={s.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />

            {/* 가독성용 그라데이션 (하단) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.85) 100%)",
              }}
            />

            {/* 상단 카테고리 라벨 */}
            <span className="absolute top-6 left-6 sm:top-8 sm:left-8 text-white text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase">
              {s.category}
            </span>

            {/* 하단 타이틀 + 버튼 */}
            <div className="absolute bottom-7 left-6 sm:bottom-10 sm:left-8 right-6">
              <h3 className="text-white text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tighter uppercase leading-none mb-2">
                {s.title}
              </h3>
              <p className="text-white/80 text-sm sm:text-base tracking-wide mb-5 sm:mb-6">
                {s.subtitle}
              </p>

              <div className="flex items-center gap-3">
                <Link
                  href={s.href}
                  className="px-7 sm:px-9 py-2.5 bg-white text-black text-[11px] sm:text-xs font-semibold tracking-widest uppercase hover:bg-white/85 transition-colors"
                >
                  View Details
                </Link>
                <Link
                  href={s.href}
                  className="px-7 sm:px-9 py-2.5 bg-black/30 backdrop-blur-sm border border-white/40 text-white text-[11px] sm:text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-black hover:border-white transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
