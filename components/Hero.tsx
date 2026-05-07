"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import VideoBackground from "@/components/VideoBackground";

/* ── 잔물결 텍스트 컴포넌트 ─────────────────────────────────────── */
function WaveText({ text, className }: { text: string; className?: string }) {
  const charRefs  = useRef<(HTMLSpanElement | null)[]>([]);
  const mouse     = useRef({ x: -9999, y: -9999 });
  const moveTime  = useRef(0);
  const curY      = useRef<number[]>([]);
  const rafId     = useRef(0);
  const chars     = Array.from(text);

  const animate = useCallback(() => {
    const elapsed = (Date.now() - moveTime.current) / 1000;

    charRefs.current.forEach((el, i) => {
      if (!el) return;

      const r    = el.getBoundingClientRect();
      const cx   = r.left + r.width  / 2;
      const cy   = r.top  + r.height / 2;
      const dist = Math.hypot(cx - mouse.current.x, cy - mouse.current.y);

      // 파문 영향 범위: 220px
      let target = 0;
      if (dist < 220 && elapsed < 1.4) {
        const decay     = Math.exp(-elapsed * 3.2);          // 시간에 따라 감쇄
        const proximity = 1 - dist / 220;                    // 거리에 따라 감쇄
        const phase     = dist / 26 - elapsed * 9;           // 파문 전파 속도
        target = Math.sin(phase) * proximity * decay * 7;    // 최대 ±7px
      }

      // 스프링: 현재 값 → 목표 값으로 부드럽게 보간
      curY.current[i] = (curY.current[i] ?? 0) + (target - (curY.current[i] ?? 0)) * 0.28;

      el.style.transform = Math.abs(curY.current[i]) > 0.05
        ? `translateY(${curY.current[i].toFixed(2)}px)`
        : "";
    });

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    curY.current = new Array(chars.length).fill(0);

    const onMove = (e: MouseEvent) => {
      mouse.current   = { x: e.clientX, y: e.clientY };
      moveTime.current = Date.now();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [animate, chars.length]);

  return (
    <span className={className}>
      {chars.map((char, i) => (
        <span
          key={i}
          ref={(el) => { charRefs.current[i] = el; }}
          style={{ display: "inline-block", willChange: "transform" }}
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}

/* ── Hero 섹션 ──────────────────────────────────────────────────── */
export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6"
    >
      <VideoBackground />

      <div className="relative max-w-5xl mx-auto" style={{ zIndex: 20 }}>
        {/* ORBOTIX INDUSTRIES */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-white/40 text-sm tracking-normal uppercase font-medium mb-6"
        >
          <WaveText text="ORBOTIX INDUSTRIES" />
        </motion.p>

        {/* 메인 헤드라인 */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="text-5xl sm:text-7xl lg:text-8xl xl:text-[96px] font-medium text-white tracking-tighter leading-none uppercase"
        >
          <WaveText text="Building" />
          <br />
          <WaveText text="tomorrow's" />
          <br />
          <WaveText text="defense," />
          <br />
          <WaveText text="today." />
        </motion.h1>
      </div>

      {/* 스크롤 큐 */}
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
