"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
    >
      {/* Top classification line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-20 left-0 right-0 flex justify-center"
      >
        <span className="text-white/20 text-[10px] tracking-[0.4em] uppercase font-mono">
          ADVANCED AUTONOMOUS SYSTEMS
        </span>
      </motion.div>

      {/* Main headline */}
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-white/40 text-sm tracking-[0.5em] uppercase font-semibold mb-6"
        >
          ORBOTIX INDUSTRIES
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="text-5xl sm:text-7xl lg:text-8xl xl:text-[96px] font-medium text-white tracking-tighter leading-none uppercase"
        >
          Building
          <br />
          tomorrow&apos;s
          <br />
          defense,
          <br />
          <span className="text-white/40">today.</span>
        </motion.h1>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-14 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={() => document.querySelector("#mission")?.scrollIntoView({ behavior: "smooth" })}
            className="px-10 py-4 border border-white text-white text-xs tracking-[0.25em] uppercase font-bold hover:bg-white hover:text-black transition-all duration-200"
          >
            Our Mission
          </button>
          <button
            onClick={() => document.querySelector("#ata-system")?.scrollIntoView({ behavior: "smooth" })}
            className="px-10 py-4 text-white/40 text-xs tracking-[0.25em] uppercase font-bold hover:text-white transition-colors duration-200"
          >
            Explore Systems →
          </button>
        </motion.div>
      </div>

      {/* Bottom scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent"
        />
        <span className="text-white/20 text-[9px] tracking-[0.3em] uppercase">Scroll</span>
      </motion.div>
    </section>
  );
}
