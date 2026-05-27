"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValueEvent,
} from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import VMBRASystem from "@/components/VMBRASystem";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <span className="text-white/20 text-[9px] tracking-[0.5em] font-mono uppercase">
        Initializing
      </span>
    </div>
  ),
});

// VIGIL-1 GLB의 4개 mesh → 파트 이름·설명 매핑
// 실제 클릭 테스트 후 이름이 맞지 않으면 key를 교체하면 됩니다
const VIGIL_PARTS = {
  "o object_1": {
    tag: "01 / AIRFRAME",
    name: "HEX-FOLD FRAME",
    description: "Six-arm foldable carbon composite airframe. Engineered for long-endurance surveillance with minimal radar cross-section.",
  },
  "o Chamfer2": {
    tag: "02 / AVIONICS",
    name: "FLIGHT CONTROLLER",
    description: "Redundant flight control unit with triple-IMU sensor fusion. Ensures stable autonomous flight under GPS-denied conditions.",
  },
  "o Cut-Extrude1": {
    tag: "03 / PAYLOAD",
    name: "SENSOR GIMBAL",
    description: "3-axis stabilized gimbal with 5K optical, thermal, and wide-angle imaging. 360° pan / ±90° tilt coverage.",
  },
  "o object_23": {
    tag: "04 / DEPLOYMENT",
    name: "LANDING GEAR",
    description: "Retractable landing assembly with vibration damping. Supports precision touchdown on uneven terrain during field operations.",
  },
} as const;

const features = [
  {
    index: "01",
    title: "DRONE-IN-A-BOX",
    subtitle: "Rapid Deployment System",
    body: "The compact drone-in-a-box design enables swift and efficient deployment, ensuring timely action during critical operations. Fully operational within minutes — no crew required.",
    stat: { value: "< 5 min", label: "Deploy Time" },
    tag: "DEPLOYMENT",
  },
  {
    index: "02",
    title: "MULTI-SENSOR FUSION",
    subtitle: "TOF · LiDAR · Vision",
    body: "Integrates Time-of-Flight, LiDAR, and advanced vision sensors into a unified perception layer. Enables precise 3D mapping across industrial complexes, power plants, and critical infrastructure.",
    stat: { value: "3-Layer", label: "Sensor Array" },
    tag: "SENSORS",
  },
  {
    index: "03",
    title: "5K TRIPLE CAMERA",
    subtitle: "5K · Thermal · Wide-Angle",
    body: "A 3-axis, 3-camera system delivers ultra-high-resolution 5K imaging alongside thermal vision and wide-angle coverage. Detect and classify targets in any condition, day or night.",
    stat: { value: "5K + IR", label: "Dual Vision" },
    tag: "IMAGING",
  },
  {
    index: "04",
    title: "AI THREAT ANALYSIS",
    subtitle: "Real-Time Edge Intelligence",
    body: "Onboard AI performs real-time threat evaluation and autonomous navigation — classifying, tracking, and reporting targets with zero external connectivity required.",
    stat: { value: "Edge AI", label: "On-Device" },
    tag: "INTELLIGENCE",
  },
  {
    index: "05",
    title: "VMBRA INTEGRATION",
    subtitle: "Mesh Intelligence Network",
    body: "Connects with the VMBRA AI visual threat detection system. The V-Station charging hub functions as the central intelligence processor — vehicle-mounted for portable, persistent coverage.",
    stat: { value: "V-Station", label: "Hub Integration" },
    tag: "NETWORK",
  },
];

const specs = [
  { label: "ENDURANCE", value: "72 hrs" },
  { label: "OPERATIONAL RADIUS", value: "480 km" },
  { label: "ACOUSTIC RANGE", value: "< 12 m" },
  { label: "TERRAIN FOLLOWING", value: "< 5m AGL" },
  { label: "IMAGING", value: "5K + Thermal" },
  { label: "SENSORS", value: "TOF · LiDAR · Vision" },
  { label: "DEPLOY TIME", value: "< 5 min" },
  { label: "SYSTEM TYPE", value: "Drone-in-a-Box" },
];

function FeatureSection({ feature }: { feature: (typeof features)[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });

  return (
    <div
      ref={ref}
      className="min-h-screen flex items-center px-8 sm:px-12 lg:px-16 xl:px-20 py-24 lg:py-0"
    >
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="max-w-lg w-full"
      >
        {/* header row */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-white/15 text-[9px] tracking-[0.5em] font-mono uppercase">
            {feature.tag}
          </span>
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/20 text-[9px] tracking-[0.3em] font-mono">
            {feature.index} / 05
          </span>
        </div>

        <h2 className="text-4xl sm:text-5xl xl:text-6xl font-medium tracking-tighter text-white uppercase leading-none mb-3">
          {feature.title}
        </h2>
        <p className="text-white/30 text-xs tracking-[0.25em] uppercase font-semibold mb-6">
          {feature.subtitle}
        </p>
        <p className="text-white/50 text-base leading-relaxed mb-10">
          {feature.body}
        </p>

        <div className="border border-white/10 p-5 inline-block">
          <div className="text-white text-2xl font-medium tracking-tight mb-1">
            {feature.stat.value}
          </div>
          <div className="text-white/30 text-[10px] tracking-[0.3em] uppercase font-mono">
            {feature.stat.label}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SpecsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-28 sm:py-36 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-white/25 text-[9px] tracking-[0.5em] font-mono uppercase mb-4"
        >
          Technical Specifications
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-medium tracking-tighter text-white uppercase mb-16"
        >
          SYSTEM SPECS
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06]">
          {specs.map((spec, i) => (
            <motion.div
              key={spec.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
              className="bg-black p-6 lg:p-8"
            >
              <div className="text-white/20 text-[9px] tracking-[0.35em] font-mono uppercase mb-3">
                {spec.label}
              </div>
              <div className="text-white text-xl sm:text-2xl font-medium tracking-tight">
                {spec.value}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-28 sm:py-36 border-t border-white/[0.06] bg-white/[0.015]"
    >
      <div className="max-w-4xl mx-auto px-8 sm:px-12 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-white/25 text-[9px] tracking-[0.5em] font-mono uppercase mb-6"
        >
          ORBOTIX INDUSTRIES / VIGIL-1
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tighter text-white uppercase leading-none mb-6"
        >
          REQUEST A BRIEFING
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-white/40 text-base leading-relaxed mb-12 max-w-xl mx-auto"
        >
          Contact our team for system specifications, deployment options, and
          integration with the VMBRA intelligence network.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/#contact-cta"
            className="px-10 py-4 bg-white text-black text-xs tracking-widest uppercase font-semibold hover:bg-white/90 transition-colors"
          >
            Contact Us
          </Link>
          <Link
            href="/"
            className="px-10 py-4 border border-white/30 text-white text-xs tracking-widest uppercase font-semibold hover:border-white/60 transition-colors"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function VigilDetailClient() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: featuresRef,
    offset: ["start start", "end end"],
  });

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, -80]);

  const [activeFeature, setActiveFeature] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(features.length - 1, Math.floor(v * features.length));
    setActiveFeature(idx);
  });

  return (
    <div className="overflow-x-hidden relative" style={{ zIndex: 1 }}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-end overflow-hidden"
      >
        {/* Full-screen 3D model */}
        <div className="absolute inset-0">
          <ModelViewer modelPath="/models/vigil_compressed.glb" parts={VIGIL_PARTS} />
        </div>

        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.006) 2px, rgba(255,255,255,0.006) 4px)",
          }}
        />

        {/* Corner brackets */}
        {[
          "top-6 left-6 border-t border-l",
          "top-6 right-6 border-t border-r",
          "bottom-6 left-6 border-b border-l",
          "bottom-6 right-6 border-b border-r",
        ].map((cls) => (
          <div
            key={cls}
            className={`absolute w-6 h-6 border-white/20 pointer-events-none z-10 ${cls}`}
          />
        ))}

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/60 to-transparent z-10 pointer-events-none" />

        {/* Classification badge */}
        <div className="absolute top-20 right-8 z-20 text-white/15 text-[8px] tracking-[0.3em] font-mono uppercase border border-white/10 px-2 py-1 hidden sm:block">
          UNCLASSIFIED
        </div>

        {/* Hero text */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-20 w-full px-8 sm:px-12 lg:px-16 pb-28"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/30 text-[10px] tracking-[0.5em] font-mono uppercase mb-4"
          >
            ORBOTIX INDUSTRIES / VIGIL-1
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="text-6xl sm:text-7xl lg:text-8xl xl:text-[10rem] font-medium tracking-tighter text-white uppercase leading-none mb-4"
          >
            VIGIL-1
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-white/40 text-sm sm:text-base tracking-[0.2em] uppercase"
          >
            Autonomous Persistent Surveillance System
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="text-white/20 text-[8px] tracking-[0.4em] font-mono uppercase">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── Features: sticky scroll ──────────────────────────────────────── */}
      <section ref={featuresRef} className="relative">
        {/* Progress dots — desktop only */}
        <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-40 pointer-events-none">
          {features.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-400 ${
                activeFeature === i
                  ? "w-1 h-6 bg-white/60"
                  : "w-1 h-1 bg-white/20"
              }`}
            />
          ))}
        </div>

        <div className="lg:flex">
          {/* Left: sticky 3D model (desktop) */}
          <div className="hidden lg:block lg:w-1/2 sticky top-0 h-screen overflow-hidden">
            {/* right-edge fade */}
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-r from-transparent to-black pointer-events-none z-10" />
            {/* top-edge fade */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />
            <ModelViewer modelPath="/models/vigil_compressed.glb" parts={VIGIL_PARTS} />
          </div>

          {/* Right: scrolling feature panels */}
          <div className="lg:w-1/2">
            {/* Mobile model — shown once at top */}
            <div className="lg:hidden w-full h-[60vw] max-h-80 relative">
              <ModelViewer modelPath="/models/vigil_compressed.glb" parts={VIGIL_PARTS} />
            </div>

            {features.map((feature) => (
              <FeatureSection key={feature.index} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ── VMBRA System ─────────────────────────────────────────────────── */}
      <VMBRASystem hideButton />

      {/* ── Specs ────────────────────────────────────────────────────────── */}
      <SpecsSection />

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <CTASection />
    </div>
  );
}
