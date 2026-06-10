"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const news = [
  {
    date: "MAY 2, 2026",
    category: "PRESS RELEASE",
    title: "Orbotix Industries Completes $240M Series C to Accelerate ATX System Production",
    excerpt:
      "Funding led by Founders Fund and Andreessen Horowitz will expand manufacturing capacity and fast-track VASPYR-1 fleet deliveries to U.S. allied partners.",
  },
  {
    date: "APR 14, 2026",
    category: "TECHNOLOGY",
    title: "VYGIL-1 Achieves 72-Hour Continuous Autonomous Flight in Field Evaluation",
    excerpt:
      "The autonomous ISR platform completed its longest uninterrupted mission, validating terrain-following algorithms and onboard edge AI across varied environments.",
  },
  {
    date: "MAR 28, 2026",
    category: "PARTNERSHIP",
    title: "Orbotix and DoD Sign Multi-Year UMBRIX System Integration Contract",
    excerpt:
      "A landmark agreement to deploy UMBRIX persistent surveillance architecture across three critical infrastructure sites in the Indo-Pacific theater.",
  },
];

export default function Newsroom() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="newsroom" className="relative bg-black pt-28 sm:pt-40 pb-28 sm:pb-36">
      <div ref={ref} className="px-10">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <h2 className="text-white text-[25px] font-medium uppercase tracking-normal leading-none">
            Newsroom
          </h2>
          <button className="text-white/30 text-[10px] tracking-[0.3em] uppercase hover:text-white transition-colors">
            All News →
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {news.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className="group bg-white/[0.16] p-7 hover:bg-white/[0.24] transition-all duration-300 cursor-pointer flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-white/30 text-[9px] tracking-[0.3em] uppercase font-mono">
                  {item.category}
                </span>
                <span className="text-white/20 text-[9px] tracking-[0.15em] font-mono">
                  {item.date}
                </span>
              </div>

              <h3 className="text-white text-base font-medium tracking-tight leading-snug mb-4 group-hover:text-white/90 transition-colors flex-1">
                {item.title}
              </h3>

              <p className="text-white/40 text-sm leading-relaxed mb-6">{item.excerpt}</p>

              <div className="flex items-center gap-2 text-white/30 text-[10px] tracking-[0.2em] uppercase group-hover:text-white/60 transition-colors">
                Read more
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                  <line x1="0" y1="4" x2="12" y2="4" stroke="currentColor" strokeWidth="1" />
                  <polyline points="9,1 13,4 9,7" stroke="currentColor" strokeWidth="1" fill="none" />
                </svg>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
