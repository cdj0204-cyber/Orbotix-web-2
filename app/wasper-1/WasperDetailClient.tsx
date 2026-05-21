"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const SCROLL_TOTAL = 30000; // 스크롤 거리 (클수록 영상 느리게 진행)

// ── 스크롤 오버레이 정의 ─────────────────────────────────────────────
// scrollAt  : 이 스크롤 위치(px)에서 텍스트 완전히 등장
// holdFor   : 유지 거리(px). 스크롤 2번 ≈ 200px
// side      : "left" | "right"
const OVERLAYS = [
  {
    id: "all-condition",
    scrollAt: 4500,
    holdFor: 3000,
    side: "right" as const,
    label: "01 / PERFORMANCE",
    title: "All-Condition\nPerformance",
    body: "Built for endurance, night operations, and variable environments, maintaining effectiveness in all-weather and electronic warfare scenarios.",
  },
  {
    id: "visual-navigation",
    scrollAt: 10500,
    holdFor: 1800,
    side: "right" as const,
    label: "02 / NAVIGATION",
    title: "Visual\nNavigation",
    body: "Autonomous navigation enables stable flight and terminal accuracy, even under GPS-denied or A2/AD conditions.",
  },
  {
    id: "ai-targeting",
    scrollAt: 13800,
    holdFor: 1950,
    side: "right" as const,
    label: "03 / TARGETING",
    title: "AI Targeting\n& Lock",
    body: "Onboard AI targeting algorithms classify and prioritize threats in real time, ensuring rapid and precise engagement.",
  },
];

const FADE = 200; // fade-in / fade-out 거리(px)

function getOpacity(scrolled: number, scrollAt: number, holdFor: number): number {
  const fadeInStart  = scrollAt - FADE;
  const fadeInEnd    = scrollAt;
  const fadeOutStart = scrollAt + holdFor;
  const fadeOutEnd   = scrollAt + holdFor + FADE;

  if (scrolled < fadeInStart)  return 0;
  if (scrolled < fadeInEnd)    return (scrolled - fadeInStart) / FADE;
  if (scrolled < fadeOutStart) return 1;
  if (scrolled < fadeOutEnd)   return 1 - (scrolled - fadeOutStart) / FADE;
  return 0;
}

export default function WasperDetailClient() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const videoRef      = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef(0);
  const rafRef        = useRef(0);
  const overlayRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const [videoReady, setVideoReady] = useState(false);

  const { scrollY } = useScroll();
  const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const textY       = useTransform(scrollY, [0, 300], [0, -40]);

  // ── 비디오 로드 감지 ────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState >= 2) { setVideoReady(true); return; }
    const onReady = () => setVideoReady(true);
    const fallback = window.setTimeout(() => setVideoReady(true), 4000);
    video.addEventListener("canplay", onReady, { once: true });
    return () => {
      video.removeEventListener("canplay", onReady);
      clearTimeout(fallback);
    };
  }, []);

  // ── RAF: video currentTime 보간 ─────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tick = () => {
      if (video.duration) {
        const diff = targetTimeRef.current - video.currentTime;
        if (Math.abs(diff) > 0.001) {
          video.currentTime = video.currentTime + diff * 0.12;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── 스크롤 → 비디오 시간 + 오버레이 opacity ─────────────────────
  useEffect(() => {
    const onScroll = () => {
      const container = containerRef.current;
      const video     = videoRef.current;
      if (!container || !video || !video.duration) return;

      const scrolled = window.scrollY - container.offsetTop;
      const progress = Math.max(0, Math.min(1, scrolled / SCROLL_TOTAL));
      targetTimeRef.current = progress * video.duration;

      // 오버레이 opacity 직접 업데이트 (리렌더 없이)
      OVERLAYS.forEach((ov, i) => {
        const el = overlayRefs.current[i];
        if (el) el.style.opacity = String(getOpacity(scrolled, ov.scrollAt, ov.holdFor));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-black">
      <div ref={containerRef} style={{ height: `calc(100vh + ${SCROLL_TOTAL}px)` }}>
        <div className="sticky top-0 h-screen overflow-hidden" style={{ zIndex: 0 }}>

          {/* 비디오 */}
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 1 }}
          >
            <source src="/video/Wasper/Wasper%20detail.mp4" type="video/mp4" />
          </video>

          {/* 블랙 커버: 로딩 전 */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-700"
            style={{ backgroundColor: "#000", zIndex: 2, opacity: videoReady ? 0 : 1 }}
          />

          {/* 하단 그라데이션 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.25) 100%)",
              zIndex: 3,
            }}
          />

          {/* 스캔라인 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.006) 2px, rgba(255,255,255,0.006) 4px)",
              zIndex: 4,
            }}
          />

          {/* 코너 브래킷 */}
          {["top-6 left-6 border-t border-l","top-6 right-6 border-t border-r","bottom-6 left-6 border-b border-l","bottom-6 right-6 border-b border-r"].map((cls) => (
            <div key={cls} className={`absolute w-6 h-6 border-white/20 pointer-events-none ${cls}`} style={{ zIndex: 5 }} />
          ))}

          {/* UNCLASSIFIED 배지 */}
          <div className="absolute top-20 right-8 hidden sm:block text-white/15 text-[8px] tracking-[0.3em] font-mono uppercase border border-white/10 px-2 py-1" style={{ zIndex: 5 }}>
            UNCLASSIFIED
          </div>

          {/* ── 스크롤 오버레이 텍스트들 ───────────────────────────── */}
          {OVERLAYS.map((ov, i) => (
            <div
              key={ov.id}
              ref={el => { overlayRefs.current[i] = el; }}
              className={`absolute top-1/2 -translate-y-1/2 pointer-events-none max-w-xs ${
                ov.side === "right" ? "right-10 sm:right-16 lg:right-20 text-right" : "left-10 sm:left-16 lg:left-20 text-left"
              }`}
              style={{ zIndex: 6, opacity: 0 }}
            >
              {/* 라벨 */}
              <p className="text-white/30 text-[9px] tracking-[0.4em] font-mono uppercase mb-3">
                {ov.label}
              </p>
              {/* 구분선 */}
              <div className={`w-8 h-px bg-white/30 mb-4 ${ov.side === "right" ? "ml-auto" : ""}`} />
              {/* 제목 */}
              <h2 className="text-white text-2xl sm:text-3xl font-medium tracking-tighter uppercase leading-tight mb-4 whitespace-pre-line">
                {ov.title}
              </h2>
              {/* 본문 */}
              <p className="text-white/50 text-sm leading-relaxed">
                {ov.body}
              </p>
            </div>
          ))}

          {/* 히어로 텍스트 */}
          <motion.div
            style={{ opacity: textOpacity, y: textY, zIndex: 5 }}
            className="absolute bottom-28 left-8 sm:left-12 lg:left-16"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-white/30 text-[10px] tracking-[0.5em] font-mono uppercase mb-4"
            >
              ORBOTIX INDUSTRIES / WASPER-1
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="text-6xl sm:text-7xl lg:text-8xl xl:text-[10rem] font-medium tracking-tighter text-white uppercase leading-none mb-4"
            >
              WASPER-1
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-white/40 text-sm sm:text-base tracking-[0.2em] uppercase"
            >
              Autonomous Tactical Aerial System
            </motion.p>
          </motion.div>

          {/* 스크롤 인디케이터 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
            style={{ opacity: textOpacity, zIndex: 5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          >
            <span className="text-white/20 text-[8px] tracking-[0.4em] font-mono uppercase">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
            />
          </motion.div>

        </div>
      </div>
    </div>
  );
}
