"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      <span className="text-white/20 text-[9px] tracking-[0.4em] font-mono uppercase">
        Loading Model
      </span>
    </div>
  ),
});

const features = [
  {
    title: "SWARM COORDINATION",
    body: "Self-healing mesh network synchronizes up to 512 units with zero single-point-of-failure architecture.",
  },
  {
    title: "OPEN PAYLOAD",
    body: "Modular hardpoints accept kinetic, EW, ISR, and logistics modules interchangeably in under 4 minutes.",
  },
  {
    title: "EDGE AI",
    body: "400+ TOPS onboard processing enables friend/foe classification and target engagement with no cloud dependency.",
  },
  {
    title: "ALL-DOMAIN",
    body: "Air, ground, and maritime deployment profiles — multi-domain coordination through a single command interface.",
  },
];

export default function WASPER1() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="wasper-1" className="relative py-28 sm:py-36 bg-white/[0.015]">
      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-white/30 text-[10px] tracking-[0.4em] uppercase font-mono mb-8"
        >
          01.1 / WASPER-1
        </motion.p>

        {/* ── 3D Viewer ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="relative w-full mb-12 overflow-hidden border border-white/[0.06]"
          style={{ height: "clamp(320px, 50vw, 560px)" }}
        >
          {/* corner brackets */}
          {[
            "top-3 left-3 border-t border-l",
            "top-3 right-3 border-t border-r",
            "bottom-3 left-3 border-b border-l",
            "bottom-3 right-3 border-b border-r",
          ].map((cls) => (
            <div
              key={cls}
              className={`absolute w-4 h-4 border-white/20 pointer-events-none z-10 ${cls}`}
            />
          ))}

          {/* scanline */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px)",
            }}
          />

          {/* HUD label */}
          <div className="absolute top-4 right-10 z-10 pointer-events-none">
            <span className="text-white/20 text-[8px] tracking-[0.3em] font-mono uppercase">
              WASPER-1 / 3D
            </span>
          </div>

          <ModelViewer modelPath="/models/wasper_compressed.glb" cameraZ={2.5} rotationY={Math.PI} />
        </motion.div>

        {/* ── Title row (좌측만) ───────────────────────────────────────── */}
        <div className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-8 lg:w-1/2"
          >
            <div>
              <p className="text-xs font-medium text-white uppercase leading-none mb-1">
                ATA SYSTEM
              </p>
              <div className="flex items-end gap-8">
                <h2 className="text-[4.5rem] sm:text-6xl lg:text-[9rem] font-medium tracking-tighter text-white uppercase leading-none whitespace-nowrap">
                  WASPER 01
                </h2>
                <button className="text-white text-xs font-medium uppercase underline underline-offset-4 hover:text-white/60 transition-colors duration-200 whitespace-nowrap">
                  VIEW MORE
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Stats row (4분할 가로배치) ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 mb-9"
        >
          {[
            { v: "420 km/h", l: "Max Speed" },
            { v: "350 km", l: "Operational Range" },
            { v: "14 hrs", l: "Endurance" },
            { v: "Up to 512", l: "Swarm Size" },
          ].map((s) => (
            <div key={s.l} className="pt-4">
              <div className="text-white text-xs font-medium uppercase mb-1">{s.l}</div>
              <div className="text-white text-2xl font-medium tracking-tight">{s.v}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Feature list (4분할 가로배치) ───────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-0">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="pt-6 pb-6"
            >
              <h4 className="text-white text-xs font-medium uppercase mb-3">
                {String(i + 1).padStart(2, "0")}. {f.title}
              </h4>
              <p className="text-white text-xs leading-relaxed font-medium">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
