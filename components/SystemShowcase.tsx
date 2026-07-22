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
    category: "DEFENSE",
    title: "DEFENSE",
    subtitle: "Target acquisition, combat support, and precision strike operations.",
    image: "/image/Defense/Swarm_02%20-%20CC.png",
    href: "#",
  },
  {
    category: "SECURITY",
    title: "SECURITY",
    subtitle: "Critical infrastructure protection, incident assessment, and rapid response operations.",
    image: "/image/VMBRA%20system/VMBRA_main.png",
    href: "#",
  },
];

export default function SystemShowcase() {
  return (
    <section className="bg-black px-4 sm:px-10 pt-56 sm:pt-80 pb-0">
      <h2 className="text-white text-[25px] font-medium uppercase tracking-normal leading-none mb-6 sm:mb-8">
        Solution
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {SYSTEMS.map((s) => (
          <div
            key={s.title}
            className="group relative overflow-hidden aspect-[16/10]"
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
                  "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)",
              }}
            />

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
