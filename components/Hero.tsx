"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import VideoBackground from "@/components/VideoBackground";

/* ── Scale the headline so it exactly fills the container width ──── */
function useFitLineWidth(active: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);

  useEffect(() => {
    if (!active) {
      setFontSize(null);
      return;
    }
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const BASE = 100; // reference px used to measure natural (unscaled) width
    const recalc = () => {
      const prevInlineFont = text.style.fontSize;
      text.style.fontSize = `${BASE}px`;
      const naturalWidth = text.scrollWidth;
      const available = container.clientWidth;
      text.style.fontSize = prevInlineFont;
      if (naturalWidth > 0 && available > 0) {
        setFontSize((available / naturalWidth) * BASE);
      }
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(container);

    // Web fonts can finish loading after this first measurement, which
    // silently changes the text's natural width and throws off the fit.
    let cancelled = false;
    if (document.fonts && document.fonts.status !== "loaded") {
      document.fonts.ready.then(() => {
        if (!cancelled) recalc();
      });
    }

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [active]);

  return { containerRef, textRef, fontSize };
}

/* ── Hero section ────────────────────────────────────────────────── */
export default function Hero() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { containerRef, textRef, fontSize } = useFitLineWidth(isDesktop);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-10"
    >
      <VideoBackground />

      <div ref={containerRef} className="relative w-full" style={{ zIndex: 20 }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-[clamp(33px,3.2vw,90px)] font-medium text-white tracking-tighter leading-none uppercase lg:whitespace-nowrap"
          style={isDesktop && fontSize ? { fontSize: `${fontSize}px` } : undefined}
        >
          Orbotix Industries
        </motion.p>

        <motion.h1
          ref={textRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-[clamp(33px,3.2vw,90px)] font-medium text-white tracking-tighter leading-none uppercase lg:whitespace-nowrap"
          style={isDesktop && fontSize ? { fontSize: `${fontSize}px` } : undefined}
        >
          Building tomorrow&apos;s defense, today.
        </motion.h1>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        style={{ zIndex: 20 }}
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
