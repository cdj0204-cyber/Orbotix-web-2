"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const values = [
  {
    word: "PROTECT",
    body: "We engineer systems that create an impenetrable shield around our allies — autonomous platforms that guard critical assets and personnel with zero margin for error.",
  },
  {
    word: "CONNECT",
    body: "Seamless data fusion across air, land, sea, and space. Our mesh-networked architectures ensure every node shares a single, accurate operational picture in real time.",
  },
  {
    word: "ADAPT",
    body: "The threat landscape evolves. Our AI-driven platforms learn continuously, updating behavioral models and response protocols without human intervention.",
  },
];

export default function Values() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-28 sm:py-36">
      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {values.map((v, i) => (
            <motion.div
              key={v.word}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div className="text-white/10 text-[80px] sm:text-[100px] font-medium leading-none tracking-tighter mb-4 select-none">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-2xl sm:text-3xl font-medium tracking-tighter text-white uppercase mb-4">
                {v.word}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">{v.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
