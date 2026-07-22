"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const news = [
  {
    date: "MAY 2, 2026",
    title: "Orbotix Industries Completes $240M Series C to Accelerate ATX System Production",
    image: "/image/ATA%20system/ATA%20system_main.png",
  },
  {
    date: "APR 14, 2026",
    title: "VYGIL-1 Achieves 72-Hour Continuous Autonomous Flight in Field Evaluation",
    image: "/image/Vigil/Vigil%2001.png",
  },
  {
    date: "MAR 28, 2026",
    title: "Orbotix and DoD Sign Multi-Year UMBRIX System Integration Contract",
    image: "/image/VMBRA%20system/VMBRA_main.png",
  },
];

function ArrowIcon() {
  return (
    <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
      <line x1="0" y1="4" x2="12" y2="4" stroke="currentColor" strokeWidth="1" />
      <polyline points="9,1 13,4 9,7" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}

export default function Newsroom() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="newsroom" className="relative bg-black pt-56 sm:pt-80 pb-28 sm:pb-36 px-4 sm:px-10">
      <div ref={ref}>
        <h2 className="text-white text-[25px] font-medium uppercase tracking-normal leading-none mb-10 sm:mb-14">
          Newsroom
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 items-start">
          {/* ── 왼쪽 단 ── */}
          <div>
            <p className="text-white text-base sm:text-lg leading-relaxed mb-6">
              The latest company developments, operational milestones, and industry perspectives from the Orbotix team.
            </p>
            <button className="inline-flex items-center gap-2 text-white text-base sm:text-lg uppercase hover:underline underline-offset-4">
              See All News
              <ArrowIcon />
            </button>
          </div>

          {/* ── 오른쪽 단 ── */}
          <div className="flex flex-col">
            {news.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className={`group grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 sm:gap-8 items-start pb-4 sm:pb-5 cursor-pointer ${
                i === 0 ? "" : "border-t border-white pt-4 sm:pt-5"
              } ${i === news.length - 1 ? "border-b" : ""}`}
            >
              <div>
                <h3 className="text-white text-base sm:text-lg font-medium tracking-tight leading-snug mb-4 sm:mb-6 underline-offset-4 group-hover:underline">
                  {item.title}
                </h3>

                <div className="flex items-center gap-6">
                  <span className="text-white text-base sm:text-lg">{item.date}</span>
                  <span className="flex items-center gap-2 text-white text-base sm:text-lg">
                    Read More
                    <ArrowIcon />
                  </span>
                </div>
              </div>

              <div className="relative w-full sm:w-[160px] lg:w-[200px] aspect-[4/3] overflow-hidden shrink-0">
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
              </div>
            </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
