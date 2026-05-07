"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const highlights = [
  "Operates autonomously in GPS-denied, comms-degraded environments",
  "Onboard edge AI with 400+ TOPS processing — zero cloud dependency",
  "Multi-domain deployment: air, ground, maritime",
  "Self-healing mesh network — up to 512 coordinated units",
  "Real-time friend/foe identification with 99.7% classification accuracy",
  "Modular payload architecture: ISR, EW, kinetic, logistics",
];

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="relative w-full aspect-video bg-white/[0.02] flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border border-white/20 rounded-full" />
        <div className="absolute inset-4 border border-white/10 rounded-full" />
        <div className="absolute inset-[7px] bg-white/5 rounded-full" />
      </div>
      <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-mono">
        {label}
      </span>
    </div>
  );
}

export default function ATASystem() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="ata-system" className="relative py-28 sm:py-36">
      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-white/30 text-[10px] tracking-[0.4em] uppercase font-mono mb-16"
        >
          01 / ATA SYSTEM
        </motion.p>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tighter text-white uppercase leading-none mb-6">
              AUTONOMOUS
              <br />
              THREAT
              <br />
              ANNIHILATION
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-10 max-w-md">
              The ATA System is Orbotix&apos;s flagship autonomous defense platform. Designed
              for multi-domain operations, ATA delivers persistent, scalable, and lethal
              autonomous capability across the full spectrum of conflict — without placing
              operators in harm&apos;s way.
            </p>

            <div>
              <p className="text-white text-xs tracking-[0.3em] uppercase font-bold mb-5">
                Operational Highlights
              </p>
              <ul className="space-y-3">
                {highlights.map((h, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
                    className="flex items-start gap-3 text-sm text-white/60"
                  >
                    <span className="mt-1.5 flex-shrink-0 w-1 h-1 bg-white/50 rounded-full" />
                    {h}
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
              onClick={() => document.querySelector("#wasper-1")?.scrollIntoView({ behavior: "smooth" })}
              className="mt-10 px-8 py-3 border border-white text-white text-xs tracking-[0.25em] uppercase font-bold hover:bg-white hover:text-black transition-all duration-200"
            >
              View WASPER-1 →
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            <ImagePlaceholder label="ATA SYSTEM / FIELD DEPLOYMENT" />
            <div className="grid grid-cols-3 gap-4">
              {["AIR DOMAIN", "GROUND OPS", "MARITIME"].map((label) => (
                <div key={label} className="aspect-square bg-white/[0.02] flex items-center justify-center">
                  <span className="text-white/20 text-[9px] tracking-widest text-center font-mono">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
