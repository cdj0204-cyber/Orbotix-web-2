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
    title: "SILENT OPERATIONS",
    body: "Ultra-low acoustic signature — detectable only at <12m in ambient noise conditions.",
  },
  {
    title: "PERSISTENT ISR",
    body: "72-hour endurance missions with onboard data compression and burst-transmission.",
  },
  {
    title: "EDGE INFERENCE",
    body: "Onboard AI classifies, tracks, and reports targets with no external connectivity.",
  },
  {
    title: "TERRAIN FOLLOWING",
    body: "Autonomous terrain-following at <5m AGL eliminates radar and visual detection.",
  },
];

export default function VIGIL1() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="vigil-1" className="relative py-28 sm:py-36 bg-white/[0.015]">
      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-white/30 text-[10px] tracking-[0.4em] uppercase font-mono mb-8"
        >
          02.1 / VIGIL-1
        </motion.p>

        {/* ── 3D Viewer ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="relative w-full mb-12 rounded-none overflow-hidden border border-white/[0.06]"
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
              VIGIL-1 / 3D
            </span>
          </div>

          <ModelViewer modelPath="/models/vigil_compressed.glb" />
        </motion.div>

        {/* ── Text + Stats ─────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 mb-16 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-start h-full"
          >
            <div>
              <p className="text-sm sm:text-base lg:text-[15px] font-medium tracking-tighter text-white uppercase leading-none mb-3">
                VMBRA SYSTEM
              </p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tighter text-white uppercase leading-none">
                VIGIL 01
              </h2>
            </div>
            <button className="mt-auto self-start px-6 py-3 border border-white text-white text-xs tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-all duration-200">
              VIEW VIGIL 01
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-2 gap-4 content-start"
          >
            {[
              { v: "72 hrs", l: "Endurance" },
              { v: "< 12m", l: "Acoustic Range" },
              { v: "480 km", l: "Operational Radius" },
              { v: "< 5m AGL", l: "Terrain Following" },
            ].map((s) => (
              <div key={s.l} className="bg-white/[0.03] p-5">
                <div className="text-white text-2xl font-medium tracking-tight mb-1">{s.v}</div>
                <div className="text-white/30 text-[10px] tracking-[0.2em] uppercase">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Feature cards ────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="bg-white/[0.03] p-6"
            >
              <div className="text-white/20 text-[9px] tracking-[0.3em] font-mono mb-3">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h4 className="text-white text-xs tracking-[0.2em] font-semibold uppercase mb-3">
                {f.title}
              </h4>
              <p className="text-white/40 text-sm leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
