"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function ContactCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="contact-cta"
      className="relative py-28 sm:py-40 bg-white/[0.02] overflow-hidden"
    >
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden
      >
        <span className="text-white/[0.025] text-[18vw] font-black tracking-tighter uppercase whitespace-nowrap">
          CONTACT
        </span>
      </div>

      <div ref={ref} className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-white/30 text-xs tracking-[0.5em] uppercase font-semibold mb-6">
            AUTHORIZED INQUIRIES ONLY
          </p>
          <h2 className="text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tighter text-white uppercase leading-none mb-8">
            READY TO
            <br />
            WORK WITH US?
          </h2>
          <p className="text-white/40 text-base leading-relaxed mb-12 max-w-xl mx-auto">
            Government agencies, allied defense organizations, and strategic partners —
            reach out to begin the procurement or partnership process.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contact@orbotix.tech"
              className="px-10 py-4 border border-white text-white text-xs tracking-[0.25em] uppercase font-bold hover:bg-white hover:text-black transition-all duration-200"
            >
              Request a Briefing
            </a>
            <button className="px-10 py-4 text-white/40 text-xs tracking-[0.25em] uppercase font-bold hover:text-white transition-colors duration-200">
              Download Capabilities Deck →
            </button>
          </div>

          <div className="mt-16 grid sm:grid-cols-3 gap-6 text-center">
            {[
              { label: "SECURE EMAIL", value: "contact@orbotix.tech" },
              { label: "CLEARANCE", value: "SECRET / NOFORN" },
              { label: "RESPONSE SLA", value: "< 48 hours" },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-white/20 text-[9px] tracking-[0.3em] uppercase font-mono mb-2">
                  {item.label}
                </div>
                <div className="text-white/70 text-sm font-mono">{item.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
