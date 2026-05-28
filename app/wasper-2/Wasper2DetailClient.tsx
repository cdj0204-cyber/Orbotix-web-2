"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// ── 상수 ─────────────────────────────────────────────────────────────
const FRAME_COUNT  = 318;
const SCROLL_TOTAL = 30000;
const FADE         = 200;

const FRAME_URL = (n: number) =>
  `/video/Wasper%20detail%202/frames/frame_${String(n).padStart(3, "0")}.jpg`;

// ── 오버레이 데이터 ───────────────────────────────────────────────────
const OVERLAYS = [
  {
    id: "airframe",
    scrollAt: 4000,
    holdFor: 3500,
    side: "right" as const,
    label: "01 / STRUCTURE",
    title: "Gen 2.0\nAirframe",
    body: "Redesigned carbon-composite airframe cuts structural weight by 38%, extending the operational envelope under high-G evasive maneuvers.",
  },
  {
    id: "payload",
    scrollAt: 11000,
    holdFor: 2000,
    side: "right" as const,
    label: "02 / PAYLOAD",
    title: "Modular\nWarhead",
    body: "Swappable payload bay supports shaped-charge, thermobaric, and EMP configurations — mission-reconfigurable in under 90 seconds.",
  },
  {
    id: "propulsion",
    scrollAt: 15000,
    holdFor: 2000,
    side: "right" as const,
    label: "03 / PROPULSION",
    title: "Dual-Motor\nRedundancy",
    body: "Twin contra-rotating motors maintain full flight authority on single-motor failure, ensuring mission completion under combat damage.",
  },
  {
    id: "overview",
    scrollAt: 22000,
    holdFor: 2500,
    side: "right" as const,
    label: "04 / OVERVIEW",
    title: "Gen 2.0\nUAV",
    body: "WASPER-2 is the next-generation\nloitering munition designed for\nhigh-value target engagement.",
  },
];

// ── 오버레이 opacity 계산 ─────────────────────────────────────────────
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

// ── 타자 효과 ─────────────────────────────────────────────────────────
function getVisualLines(el: HTMLElement, text: string): string[] {
  const words = text.split(" ");
  el.innerHTML = words.map(w => `<span>${w} </span>`).join("");
  const spans = Array.from(el.querySelectorAll<HTMLSpanElement>("span"));
  const lines: string[] = [];
  let currentLine = "";
  let currentTop: number | null = null;
  for (const span of spans) {
    const top  = Math.round(span.getBoundingClientRect().top);
    const word = (span.textContent ?? "").replace(/ $/, "");
    if (currentTop === null) {
      currentTop = top; currentLine = word;
    } else if (top > currentTop + 4) {
      lines.push(currentLine); currentLine = word; currentTop = top;
    } else {
      currentLine += " " + word;
    }
  }
  if (currentLine) lines.push(currentLine);
  el.innerHTML = "";
  return lines.length > 0 ? lines : [text];
}

function startTypewriter(overlayEl: HTMLDivElement) {
  const items = overlayEl.querySelectorAll<HTMLElement>("[data-tw]");
  let targetDuration = 0;
  items.forEach(item => {
    if (item.dataset.twBody === undefined) {
      targetDuration = Math.max(targetDuration, (item.dataset.original ?? "").length * 28);
    }
  });
  items.forEach(item => {
    const original = item.dataset.original ?? "";
    if (item.dataset.twBody !== undefined) {
      const lines = original.includes("\n") ? original.split("\n") : getVisualLines(item, original);
      const maxLen = Math.max(...lines.map(l => l.length), 1);
      const charSpeed = targetDuration > 0 ? targetDuration / maxLen : 28;
      item.innerHTML = lines.map(() => `<span style="display:block"></span>`).join("");
      const lineEls = item.querySelectorAll<HTMLSpanElement>("span");
      lines.forEach((line, li) => {
        let i = 0;
        const tick = () => {
          if (i >= line.length) return;
          lineEls[li].textContent = line.slice(0, i + 1);
          i++;
          setTimeout(tick, charSpeed);
        };
        tick();
      });
    } else {
      item.textContent = "";
      let i = 0;
      const tick = () => {
        if (i >= original.length) return;
        item.textContent = original.slice(0, i + 1);
        i++;
        setTimeout(tick, 28);
      };
      tick();
    }
  });
}

function resetTypewriter(overlayEl: HTMLDivElement) {
  const items = overlayEl.querySelectorAll<HTMLElement>("[data-tw]");
  items.forEach(item => { item.textContent = item.dataset.original ?? ""; });
}

// ── 카운터 ────────────────────────────────────────────────────────────
function StatCounter({ num, unit, decimals, label }: {
  num: number; unit: string; decimals: number; label: string;
}) {
  const [count, setCount] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      const DURATION = 2000;
      const start = performance.now();
      const tick = (now: number) => {
        const t      = Math.min((now - start) / DURATION, 1);
        const eased  = 1 - Math.pow(1 - t, 3);
        const current = parseFloat((num * eased).toFixed(decimals));
        setCount(current);
        if (t < 1) requestAnimationFrame(tick);
        else setCount(num);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [num, decimals]);

  return (
    <div ref={ref}>
      <div className="text-white text-[15px] font-medium uppercase tracking-widest mb-2">{label}</div>
      <div className="text-white text-4xl font-medium tracking-tight tabular-nums">
        {decimals > 0 ? count.toFixed(decimals) : count}{unit}
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────
export default function Wasper2DetailClient() {
  const containerRef    = useRef<HTMLDivElement>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const framesRef       = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const heroRef         = useRef<HTMLDivElement>(null);
  const overlayRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const prevOpacityRef  = useRef<number[]>(OVERLAYS.map(() => 0));

  const [loadProgress, setLoadProgress] = useState(0);
  const [loadDone, setLoadDone]         = useState(false);
  const [fadeOut, setFadeOut]           = useState(false);

  // ── Canvas: object-fit:cover 드로우 ──────────────────────────────────
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const frame  = framesRef.current[index];
    if (!canvas || !frame) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width,  ch = canvas.height;
    const fw = frame.naturalWidth, fh = frame.naturalHeight;
    if (!fw || !fh) return;

    const scale = Math.max(cw / fw, ch / fh);
    const sw = fw * scale, sh = fh * scale;
    const dx = (cw - sw) / 2, dy = (ch - sh) / 2;
    ctx.drawImage(frame, dx, dy, sw, sh);
  }, []);

  // ── Canvas 리사이즈 ───────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(currentFrameRef.current);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawFrame]);

  // ── 프레임 프리로드 (동시 8개) ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const imgs: HTMLImageElement[] = new Array(FRAME_COUNT);
    let loaded = 0;

    const loadOne = (i: number): Promise<void> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (!cancelled) {
            imgs[i] = img;
            loaded++;
            setLoadProgress(Math.round((loaded / FRAME_COUNT) * 100));
            if (loaded === FRAME_COUNT) {
              framesRef.current = imgs;
              drawFrame(0);
              setFadeOut(true);
              setTimeout(() => setLoadDone(true), 800);
            }
          }
          resolve();
        };
        img.onerror = () => { loaded++; resolve(); };
        img.src = FRAME_URL(i + 1);
      });

    // 8개 워커 동시 실행
    let idx = 0;
    const worker = async () => {
      while (idx < FRAME_COUNT) {
        if (cancelled) return;
        await loadOne(idx++);
      }
    };
    Array.from({ length: 8 }, worker);

    return () => { cancelled = true; };
  }, [drawFrame]);

  // ── Lenis + GSAP ScrollTrigger ────────────────────────────────────────
  useEffect(() => {
    if (!loadDone) return;
    const container = containerRef.current;
    if (!container) return;

    gsap.registerPlugin(ScrollTrigger);

    // Lenis 초기화
    const lenis = new Lenis({ lerp: 0.08 });

    lenis.on("scroll", ScrollTrigger.update);

    const lenisRaf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(lenisRaf);
    gsap.ticker.lagSmoothing(0);

    // ScrollTrigger: 스크롤 → 프레임 렌더 + 오버레이
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_TOTAL}`,
        scrub: true,
        onUpdate: (self) => {
          // ── 프레임 인덱스 계산 → Canvas 드로우 ──────────────────
          const frameIdx = Math.min(
            Math.round(self.progress * (FRAME_COUNT - 1)),
            FRAME_COUNT - 1,
          );
          if (frameIdx !== currentFrameRef.current) {
            currentFrameRef.current = frameIdx;
            drawFrame(frameIdx);
          }

          // ── 히어로 텍스트 페이드 아웃 ───────────────────────────
          const scrolled   = self.progress * SCROLL_TOTAL;
          const heroAlpha  = Math.max(0, 1 - scrolled / 300);
          const heroTransY = -40 * (1 - heroAlpha);
          if (heroRef.current) {
            heroRef.current.style.opacity   = String(heroAlpha);
            heroRef.current.style.transform = `translateY(calc(-50% + ${heroTransY}px))`;
          }

          // ── 오버레이 opacity + 타자 효과 ────────────────────────
          OVERLAYS.forEach((ov, i) => {
            const el = overlayRefs.current[i];
            if (!el) return;
            const newOp  = getOpacity(scrolled, ov.scrollAt, ov.holdFor);
            const prevOp = prevOpacityRef.current[i];
            el.style.opacity = String(newOp);
            if (prevOp < 0.05 && newOp >= 0.05) startTypewriter(el);
            if (prevOp >= 0.05 && newOp < 0.05) resetTypewriter(el);
            prevOpacityRef.current[i] = newOp;
          });
        },
      });
    }, container);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(lenisRaf);
    };
  }, [loadDone, drawFrame]);

  // ── 스펙 데이터 ───────────────────────────────────────────────────────
  const stats = [
    { l: "Max. Range",     num: 25,  unit: " km",   decimals: 0 },
    { l: "Max. Speed",     num: 85,  unit: " km/h", decimals: 0 },
    { l: "Max. Payload",   num: 4.5, unit: " kg",   decimals: 1 },
    { l: "Max. Endurance", num: 45,  unit: " min",  decimals: 0 },
  ];
  const features = [
    { title: "DUAL-MOTOR REDUNDANCY",  body: "Twin contra-rotating motors maintain full flight authority on single-motor failure, ensuring mission completion under combat damage." },
    { title: "MODULAR PAYLOAD BAY",    body: "Swappable payload supports shaped-charge, thermobaric, and EMP configurations — reconfigurable in under 90 seconds." },
    { title: "ENHANCED AI TARGETING",  body: "Second-generation onboard AI classifies and tracks multiple simultaneous threats, prioritizing high-value targets in cluttered environments." },
    { title: "EXTENDED RANGE",         body: "Upgraded power plant and aerodynamic refinements extend operational radius to 25 km, enabling standoff engagement from safe distances." },
    { title: "SWARM COORDINATION",     body: "Hardened mesh-radio protocol enables real-time coordination across up to 16 simultaneous units without ground-station relay." },
  ];

  return (
    <div className="bg-black">

      {/* ── 로딩 화면 ────────────────────────────────────────────────── */}
      {!loadDone && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center gap-10"
          style={{
            backgroundColor: "#000",
            zIndex: 9999,
            opacity: fadeOut ? 0 : 1,
            transition: "opacity 0.8s ease",
            pointerEvents: fadeOut ? "none" : "auto",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/image/Orbotix_Logo_Icon_W.png"
            alt="ORBOTIX"
            style={{ height: 36, objectFit: "contain", opacity: 0.9 }}
          />
          <div className="flex flex-col items-center gap-3 w-48">
            <div className="w-full h-px bg-white/10 overflow-hidden">
              <div
                className="h-full bg-white transition-[width] duration-200 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="text-white/30 text-[9px] tracking-[0.4em] font-mono uppercase">
              {loadProgress < 100 ? `Loading  ${loadProgress}%` : "Initializing..."}
            </span>
          </div>
        </div>
      )}

      {/* ── 스크롤 섹션 ──────────────────────────────────────────────── */}
      <div ref={containerRef} style={{ height: `calc(100vh + ${SCROLL_TOTAL}px)` }}>
        <div className="sticky top-0 h-screen overflow-hidden" style={{ zIndex: 0 }}>

          {/* Canvas — 프레임 렌더링 */}
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
              display: "block",
            }}
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
          {[
            "top-3 sm:top-[40px] left-3 sm:left-[40px] border-t border-l",
            "top-3 sm:top-[40px] right-3 sm:right-[40px] border-t border-r",
            "bottom-3 sm:bottom-[40px] left-3 sm:left-[40px] border-b border-l",
            "bottom-3 sm:bottom-[40px] right-3 sm:right-[40px] border-b border-r",
          ].map((cls) => (
            <div key={cls} className={`absolute w-5 h-5 sm:w-6 sm:h-6 border-white/20 pointer-events-none ${cls}`} style={{ zIndex: 5 }} />
          ))}

          {/* UNCLASSIFIED 배지 */}
          <div className="absolute top-20 right-[40px] hidden sm:block text-white/15 text-[8px] tracking-[0.3em] font-mono uppercase border border-white/10 px-2 py-1" style={{ zIndex: 5 }}>
            UNCLASSIFIED
          </div>

          {/* 스크롤 오버레이 */}
          {OVERLAYS.map((ov, i) => (
            <div
              key={ov.id}
              ref={el => { overlayRefs.current[i] = el; }}
              className={`absolute top-1/2 -translate-y-1/2 pointer-events-none max-w-[180px] sm:max-w-xs ${
                ov.side === "right" ? "right-3 sm:right-[40px] text-right" : "left-3 sm:left-[40px] text-left"
              }`}
              style={{ zIndex: 6, opacity: 0 }}
            >
              <p data-tw data-original={ov.label} className="text-white text-[7px] sm:text-[9px] tracking-[0.4em] font-mono uppercase mb-2 sm:mb-3">
                {ov.label}
              </p>
              <div className={`w-6 sm:w-8 h-px bg-white mb-3 sm:mb-4 ${ov.side === "right" ? "ml-auto" : ""}`} />
              <h2 data-tw data-original={ov.title} className="text-white text-lg sm:text-2xl lg:text-3xl font-medium tracking-tighter uppercase leading-tight mb-3 sm:mb-4 whitespace-pre-line">
                {ov.title}
              </h2>
              <p data-tw data-original={ov.body} data-tw-body className="text-white text-xs sm:text-sm leading-relaxed hidden sm:block">
                {ov.body}
              </p>
            </div>
          ))}

          {/* 히어로 텍스트 */}
          <div
            ref={heroRef}
            style={{ zIndex: 5, position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)" }}
            className="left-3 sm:left-[40px] px-3 sm:px-[40px]"
          >
            <p className="text-white text-sm sm:text-lg font-medium uppercase leading-none mb-1">
              ATA SYSTEM
            </p>
            <h1 className="text-[2.75rem] sm:text-[4.5rem] lg:text-[6.75rem] xl:text-[9rem] font-medium tracking-tighter text-white uppercase leading-none">
              WASPER-2
            </h1>
          </div>

          {/* 스크롤 인디케이터 */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
            style={{ zIndex: 5 }}
          >
            <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent animate-bounce" />
          </div>

        </div>
      </div>

      {/* ── 스펙 + 기능 섹션 ─────────────────────────────────────────── */}
      <section className="bg-black py-16 sm:py-28 lg:py-36 px-4 sm:px-10">
        <div className="mb-16 sm:mb-[250px]">
          <p className="text-sm sm:text-lg font-medium text-white uppercase leading-none mb-1">
            ATA SYSTEM
          </p>
          <div className="flex items-baseline gap-4 sm:gap-8 flex-wrap">
            <h2 className="text-[2.75rem] sm:text-[4.5rem] lg:text-[6.75rem] xl:text-[9rem] font-medium tracking-tighter text-white uppercase leading-none">
              WASPER-2
            </h2>
          </div>
        </div>

        {features.map((f, i) => (
          <div key={f.title} className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 py-4 sm:py-6 border-t border-white/[0.06]">
            <div>
              {stats[i] ? (
                <StatCounter
                  num={stats[i].num}
                  unit={stats[i].unit}
                  decimals={stats[i].decimals}
                  label={stats[i].l}
                />
              ) : null}
            </div>
            <div>
              <h4 className="text-white text-[13px] sm:text-[15px] font-medium uppercase tracking-widest mb-2">
                {String(i + 1).padStart(2, "0")}. {f.title}
              </h4>
              <p className="text-white text-base sm:text-lg leading-relaxed">{f.body}</p>
            </div>
          </div>
        ))}
      </section>

    </div>
  );
}
