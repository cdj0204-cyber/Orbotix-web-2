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
    title: "AUTONOMOUS FLIGHT",
    body: "Autonomous navigation enables stable flight and terminal accuracy, even under GPS-denied or A2/AD conditions.",
  },
  {
    title: "AI TARGETING & LOCK",
    body: "Onboard AI targeting algorithms classify and prioritize threats in real time, ensuring rapid and precise engagement.",
  },
  {
    title: "SWARM CAPABILITY",
    body: "Multiple autonomous drones operate in synchronized formations, overwhelming defenses and adapting dynamically to mission needs.",
  },
  {
    title: "RAPID DEPLOYMENT",
    body: "Compact form factor and intuitive interface allow launch within seconds, reducing preparation time and operator exposure.",
  },
  {
    title: "ALL-CONDITION PERFORMANCE",
    body: "Built for endurance, night operations, and variable environments, maintaining effectiveness in all-weather and electronic warfare scenarios.",
  },
];

export default function WASPER1() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="wasper-1" className="relative py-16 sm:py-28 lg:py-36 bg-black">
      <div ref={ref} className="px-4 sm:px-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-white/30 text-[15px] tracking-[0.4em] uppercase font-mono mb-8"
        >
          01.1 / VASPYR-1
        </motion.p>

        {/* ── 3D Viewer ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="relative w-full mb-12 overflow-hidden border border-white/[0.06]"
          style={{ height: "clamp(240px, 60vw, 560px)" }}
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
              VASPYR-1 / 3D
            </span>
          </div>

          <ModelViewer modelPath="/models/wasper_compressed.glb" cameraZ={2.5} rotationY={Math.PI} />
        </motion.div>

        {/* ── Title row (좌측만) ───────────────────────────────────────── */}
        <div className="mb-16 sm:mb-[250px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-8 lg:w-1/2"
          >
            <div>
              <p className="text-sm sm:text-lg font-medium text-white uppercase leading-none mb-1">
                ATX SYSTEM
              </p>
              <div className="flex items-baseline gap-4 sm:gap-8 flex-wrap">
                <h2 className="text-[2.75rem] sm:text-[4.5rem] lg:text-[6.75rem] xl:text-[9rem] font-medium tracking-tighter text-white uppercase leading-none">
                  VASPYR 01
                </h2>
                <button className="text-white text-sm sm:text-lg font-medium uppercase underline underline-offset-4 hover:text-white/60 transition-colors duration-200 whitespace-nowrap">
                  VIEW MORE
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Stats + Features (5행 2열) ──────────────────────────────── */}
        {(() => {
          const stats = [
            { v: "15 km",   l: "Max. Range"     },
            { v: "70 km/h", l: "Max. Speed"     },
            { v: "2.3 kg",  l: "Max. Weight"    },
            { v: "30 min",  l: "Max. Endurance" },
          ];
          return features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 py-4 sm:py-6"
            >
              {/* 스펙 (4개까지만) */}
              <div>
                {stats[i] ? (
                  <>
                    <div className="text-white text-[13px] sm:text-[15px] font-medium uppercase tracking-widest mb-2">{stats[i].l}</div>
                    <div className="text-white text-3xl sm:text-4xl font-medium tracking-tight">{stats[i].v}</div>
                  </>
                ) : null}
              </div>

              {/* 기능 */}
              <div>
                <h4 className="text-white text-[13px] sm:text-[15px] font-medium uppercase tracking-widest mb-2">
                  {String(i + 1).padStart(2, "0")}. {f.title}
                </h4>
                <p className="text-white text-base sm:text-lg leading-relaxed">{f.body}</p>
              </div>
            </motion.div>
          ));
        })()}
      </div>
    </section>
  );
}
