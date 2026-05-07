"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const capabilities = [
  "Persistent wide-area AI surveillance — 24/7, no operator fatigue",
  "Computer vision with multi-spectral sensor fusion (optical, IR, LIDAR)",
  "Behavioral anomaly detection: flags deviations from baseline patterns",
  "Automated threat classification with <0.3s response latency",
  "Encrypted edge processing — data never leaves the operational theater",
  "Seamless handoff between stationary sensors and mobile VIGIL-1 assets",
];

export default function VMBRASystem() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="vmbra-system" className="relative py-28 sm:py-36">
      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-white/30 text-[10px] tracking-[0.4em] uppercase font-mono mb-16"
        >
          02 / VMBRA SYSTEM
        </motion.p>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tighter text-white uppercase leading-none mb-6">
              VIGILANT
              <br />
              MESH-BASED
              <br />
              RECON &amp;
              <br />
              AWARENESS
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-10 max-w-md">
              VMBRA is Orbotix&apos;s AI-driven persistent surveillance architecture.
              A distributed network of stationary sensor nodes and mobile aerial assets
              creates an unblinking eye over any operational area — processing,
              classifying, and alerting without human bottlenecks.
            </p>

            <ul className="space-y-3 mb-10">
              {capabilities.map((c, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
                  className="flex items-start gap-3 text-sm text-white/60"
                >
                  <span className="mt-1.5 flex-shrink-0 w-1 h-1 bg-white/50 rounded-full" />
                  {c}
                </motion.li>
              ))}
            </ul>

            <button
              onClick={() => document.querySelector("#vigil-1")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3 border border-white text-white text-xs tracking-[0.25em] uppercase font-bold hover:bg-white hover:text-black transition-all duration-200"
            >
              View VIGIL-1 →
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative aspect-square max-w-md mx-auto bg-white/[0.02]">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 300 300" fill="none" className="w-[85%]">
                  <circle cx="150" cy="150" r="130" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <circle cx="150" cy="150" r="100" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" strokeDasharray="3 3" />
                  <circle cx="150" cy="150" r="70" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <circle cx="150" cy="150" r="40" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <line x1="150" y1="20" x2="150" y2="280" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
                  <line x1="20" y1="150" x2="280" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
                  <line x1="57" y1="57" x2="243" y2="243" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                  <line x1="243" y1="57" x2="57" y2="243" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                  <path d="M 150 150 L 150 50 A 100 100 0 0 1 237 205 Z" fill="rgba(255,255,255,0.03)">
                    <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="6s" repeatCount="indefinite" />
                  </path>
                  <circle cx="190" cy="100" r="5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5">
                    <animate attributeName="r" values="5;10;5" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="100" cy="190" r="4" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1">
                    <animate attributeName="r" values="4;8;4" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.2;1" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="200" cy="200" r="3" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1">
                    <animate attributeName="r" values="3;7;3" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="150" cy="150" r="6" fill="white" opacity="0.8" />
                  <circle cx="150" cy="150" r="2" fill="white" />
                  <text x="192" y="90" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="monospace">TGT-01</text>
                  <text x="103" y="183" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">TGT-02</text>
                  <text x="205" y="195" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">TGT-03</text>
                </svg>
              </div>

              <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex justify-between items-center">
                <span className="text-white/20 text-[8px] tracking-[0.3em] font-mono uppercase">VMBRA // ACTIVE</span>
                <span className="text-white/20 text-[8px] tracking-[0.2em] font-mono">3 CONTACTS</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
