"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
  {
    id: "overview",
    scrollAt: 22000,
    holdFor: 2500,
    side: "right" as const,
    label: "04 / OVERVIEW",
    title: "Gen 2.0\nUAV",
    body: "WASPER-1 is an autonomous UAV\ndesigned to execute precision strikes\nwhile minimizing operator risk.",
  },
];

const FADE = 200; // fade-in / fade-out 거리(px)

// ── 타자 효과 ────────────────────────────────────────────────────────

// 실제 렌더된 줄 위치를 측정해 배열로 반환
function getVisualLines(el: HTMLElement, text: string): string[] {
  const words = text.split(" ");
  el.innerHTML = words.map(w => `<span>${w} </span>`).join("");
  const spans = Array.from(el.querySelectorAll<HTMLSpanElement>("span"));
  const lines: string[] = [];
  let currentLine = "";
  let currentTop: number | null = null;

  for (const span of spans) {
    const top  = Math.round(span.getBoundingClientRect().top);
    const word = (span.textContent ?? "").replace(/ $/, "");
    if (currentTop === null) {
      currentTop = top; currentLine = word;
    } else if (top > currentTop + 4) {
      lines.push(currentLine);
      currentLine = word; currentTop = top;
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

  // 라벨·제목 기준 최대 완료 시간 계산 (28ms/char)
  let targetDuration = 0;
  items.forEach(item => {
    if (item.dataset.twBody === undefined) {
      targetDuration = Math.max(targetDuration, (item.dataset.original ?? "").length * 28);
    }
  });

  items.forEach(item => {
    const original = item.dataset.original ?? "";

    if (item.dataset.twBody !== undefined) {
      // \n 있으면 직접 분리, 없으면 렌더 위치 감지
      const lines = original.includes("\n")
        ? original.split("\n")
        : getVisualLines(item, original);
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
      // 라벨·제목: 일반 타자 효과 (28ms/char)
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
  items.forEach(item => {
    item.textContent = item.dataset.original ?? "";
  });
}

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

// ── 카운터 애니메이션 컴포넌트 ───────────────────────────────────────
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
        const t = Math.min((now - start) / DURATION, 1);
        // ease-out cubic (속도계처럼 빠르게 올라갔다 천천히 멈춤)
        const eased = 1 - Math.pow(1 - t, 3);
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

const FRAME_COUNT = 318; // 추출된 JPEG 프레임 수 (8fps × 39.77s)

export default function WasperDetailClient() {
  const containerRef   = useRef<HTMLDivElement>(null);
  const imgARef        = useRef<HTMLImageElement>(null);
  const imgBRef        = useRef<HTMLImageElement>(null);
  const framePathsRef  = useRef<string[]>(
    Array.from({ length: FRAME_COUNT }, (_, i) =>
      `/video/Wasper/frames/frame_${String(i + 1).padStart(3, "0")}.jpg`
    )
  );
  const imageStore     = useRef<HTMLImageElement[]>([]); // GC 방지용 참조 보관
  const overlayRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const prevOpacityRef = useRef<number[]>(OVERLAYS.map(() => 0));
  const progressRef    = useRef(0);   // 현재 표시 중인 progress
  const targetProg     = useRef(0);   // 스크롤로 지정된 목표 progress
  const velocityRef    = useRef(0);   // 스프링 감쇠용 속도
  const rafRef         = useRef(0);
  // swap crossfade 상태
  const frontRef       = useRef<'a' | 'b'>('a'); // 현재 전면 이미지
  const prevIdxRef     = useRef(-1);              // 마지막으로 표시한 프레임 인덱스
  const lastSwapRef    = useRef(0);               // 마지막 swap 시각 (ms)

  const [loadProgress, setLoadProgress] = useState(0);
  const [loadDone, setLoadDone]         = useState(false);
  const [fadeOut, setFadeOut]           = useState(false);

  const { scrollY } = useScroll();
  const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const textY       = useTransform(scrollY, [0, 300], [0, -40]);

  // ── swap crossfade: 잔상 없이 부드럽게 ─────────────────────────────
  // · 한 번에 정확히 하나의 프레임만 불투명(opacity 1) → 잔상 zero
  // · 프레임이 바뀔 때만 swap; 빠른 스크롤엔 즉시(transition 없이) 전환
  const CROSSFADE_MS = 40; // 느린 스크롤 시 크로스페이드 지속 시간

  const drawFrame = (progress: number) => {
    const paths = framePathsRef.current;
    const imgA  = imgARef.current;
    const imgB  = imgBRef.current;
    if (!imgA || !imgB || paths.length === 0) return;

    const idx = Math.round(progress * (FRAME_COUNT - 1));
    if (idx === prevIdxRef.current) return; // 프레임 변화 없음 → skip
    prevIdxRef.current = idx;

    const now     = performance.now();
    const isRapid = (now - lastSwapRef.current) < CROSSFADE_MS;
    lastSwapRef.current = now;
    const dur     = isRapid ? 0 : CROSSFADE_MS;
    const trans   = dur > 0 ? `opacity ${dur}ms ease` : 'none';

    if (frontRef.current === 'a') {
      // B에 새 프레임 로드 후 B를 전면으로
      imgB.src = paths[idx];
      imgA.style.transition = trans;
      imgB.style.transition = trans;
      imgA.style.opacity = '0';
      imgB.style.opacity = '1';
      frontRef.current = 'b';
    } else {
      // A에 새 프레임 로드 후 A를 전면으로
      imgA.src = paths[idx];
      imgA.style.transition = trans;
      imgB.style.transition = trans;
      imgA.style.opacity = '1';
      imgB.style.opacity = '0';
      frontRef.current = 'a';
    }
  };

  // ── 이미지 시퀀스 프리로드 (브라우저 캐시 워밍 + GC 방지) ─────────
  useEffect(() => {
    let cancelled = false;
    let loaded = 0;
    const paths = framePathsRef.current;
    const imgs: HTMLImageElement[] = [];

    const onOne = () => {
      if (cancelled) return;
      loaded++;
      setLoadProgress(Math.round((loaded / FRAME_COUNT) * 100));
      if (loaded === FRAME_COUNT) {
        drawFrame(0);      // 첫 프레임 즉시 표시
        setFadeOut(true);
        setTimeout(() => setLoadDone(true), 800);
      }
    };

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.onload  = onOne;
      img.onerror = onOne;
      img.src = paths[i];
      imgs.push(img);
    }

    imageStore.current = imgs; // GC 방지: 참조 유지

    return () => {
      cancelled = true;
      imageStore.current = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── RAF: 스프링-감쇠 물리 → drawFrame ───────────────────────────
  // · 순수 lerp 대신 velocity 를 따로 관리 → 스크롤 멈춰도 관성으로
  //   자연스럽게 미끄러지며 정지 (아이폰 물리 스크롤과 같은 느낌)
  // · DAMPING: 마찰 계수 (클수록 빨리 멈춤)
  // · SPRING : 목표 인력 (클수록 빠르게 추종)
  const DAMPING = 0.78;
  const SPRING  = 0.12;

  useEffect(() => {
    const tick = () => {
      const diff = targetProg.current - progressRef.current;
      // 속도 = 이전 속도 × 감쇠 + 목표 인력
      velocityRef.current = velocityRef.current * DAMPING + diff * SPRING;
      // 아주 작은 속도는 0으로 수렴 (무한 micro-update 방지)
      if (Math.abs(velocityRef.current) > 0.000005) {
        progressRef.current = Math.max(0, Math.min(1, progressRef.current + velocityRef.current));
      }
      drawFrame(progressRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 스크롤 → progress + 오버레이 opacity ─────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrolled = window.scrollY - container.offsetTop;
      const progress = Math.max(0, Math.min(1, scrolled / SCROLL_TOTAL));
      targetProg.current = progress;

      // 오버레이 opacity + 타자 효과 트리거
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
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── 스펙 + 기능 데이터 ────────────────────────────────────────────
  const stats = [
    { v: "15 km",   l: "Max. Range",     num: 15,  unit: " km",   decimals: 0 },
    { v: "70 km/h", l: "Max. Speed",     num: 70,  unit: " km/h", decimals: 0 },
    { v: "2.3 kg",  l: "Max. Weight",    num: 2.3, unit: " kg",   decimals: 1 },
    { v: "30 min",  l: "Max. Endurance", num: 30,  unit: " min",  decimals: 0 },
  ];
  const features = [
    { title: "AUTONOMOUS FLIGHT",       body: "Autonomous navigation enables stable flight and terminal accuracy, even under GPS-denied or A2/AD conditions." },
    { title: "AI TARGETING & LOCK",     body: "Onboard AI targeting algorithms classify and prioritize threats in real time, ensuring rapid and precise engagement." },
    { title: "SWARM CAPABILITY",        body: "Multiple autonomous drones operate in synchronized formations, overwhelming defenses and adapting dynamically to mission needs." },
    { title: "RAPID DEPLOYMENT",        body: "Compact form factor and intuitive interface allow launch within seconds, reducing preparation time and operator exposure." },
    { title: "ALL-CONDITION PERFORMANCE", body: "Built for endurance, night operations, and variable environments, maintaining effectiveness in all-weather and electronic warfare scenarios." },
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
          {/* ORBOTIX 로고 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/image/Orbotix_Logo_Icon_W.png"
            alt="ORBOTIX"
            style={{ height: 36, objectFit: "contain", opacity: 0.9 }}
          />

          {/* 진행 바 + 퍼센트 */}
          <div className="flex flex-col items-center gap-3 w-48">
            <div className="w-full h-px bg-white/10 overflow-hidden">
              <div
                className="h-full bg-white"
                style={{ width: `${loadProgress}%`, transition: "width 0.2s ease" }}
              />
            </div>
            <span className="text-white/30 text-[9px] tracking-[0.4em] font-mono uppercase">
              {loadProgress < 100 ? `Loading  ${loadProgress}%` : "Initializing..."}
            </span>
          </div>
        </div>
      )}

      <div ref={containerRef} style={{ height: `calc(100vh + ${SCROLL_TOTAL}px)` }}>
        <div className="sticky top-0 h-screen overflow-hidden" style={{ zIndex: 0 }}>

          {/* 이미지 시퀀스 렌더링 — swap crossfade (잔상 zero, 빠른 스크롤엔 즉시 전환) */}
          <div className="absolute inset-0" style={{ zIndex: 1, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgARef}
              src="/video/Wasper/frames/frame_001.jpg"
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgBRef}
              src="/video/Wasper/frames/frame_001.jpg"
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
                opacity: 0,
              }}
            />
          </div>

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

          {/* ── 스크롤 오버레이 텍스트들 ───────────────────────────── */}
          {OVERLAYS.map((ov, i) => (
            <div
              key={ov.id}
              ref={el => { overlayRefs.current[i] = el; }}
              className={`absolute top-1/2 -translate-y-1/2 pointer-events-none max-w-[180px] sm:max-w-xs ${
                ov.side === "right" ? "right-3 sm:right-[40px] text-right" : "left-3 sm:left-[40px] text-left"
              }`}
              style={{ zIndex: 6, opacity: 0 }}
            >
              {/* 라벨 */}
              <p data-tw data-original={ov.label} className="text-white text-[7px] sm:text-[9px] tracking-[0.4em] font-mono uppercase mb-2 sm:mb-3">
                {ov.label}
              </p>
              {/* 구분선 */}
              <div className={`w-6 sm:w-8 h-px bg-white mb-3 sm:mb-4 ${ov.side === "right" ? "ml-auto" : ""}`} />
              {/* 제목 */}
              <h2 data-tw data-original={ov.title} className="text-white text-lg sm:text-2xl lg:text-3xl font-medium tracking-tighter uppercase leading-tight mb-3 sm:mb-4 whitespace-pre-line">
                {ov.title}
              </h2>
              {/* 본문 */}
              <p data-tw data-original={ov.body} data-tw-body className="text-white text-xs sm:text-sm leading-relaxed hidden sm:block">
                {ov.body}
              </p>
            </div>
          ))}

          {/* 히어로 텍스트 */}
          <motion.div
            style={{ opacity: textOpacity, y: textY, zIndex: 5 }}
            className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-[40px]"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-white text-sm sm:text-lg font-medium uppercase leading-none mb-1"
            >
              ATA SYSTEM
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="text-[2.75rem] sm:text-[4.5rem] lg:text-[6.75rem] xl:text-[9rem] font-medium tracking-tighter text-white uppercase leading-none"
            >
              WASPER-1
            </motion.h1>
          </motion.div>

          {/* 스크롤 인디케이터 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
            style={{ opacity: textOpacity, zIndex: 5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
            />
          </motion.div>

        </div>
      </div>

      {/* ── 3D 뷰어 섹션 ─────────────────────────────────────────────── */}
      <section className="bg-black px-4 sm:px-10 py-12 sm:py-20">
        <div
          className="relative w-full overflow-hidden border border-white/[0.06]"
          style={{ height: "clamp(320px, 100vw, 1200px)" }}
        >
          {/* 코너 브래킷 */}
          {["top-3 left-3 border-t border-l","top-3 right-3 border-t border-r","bottom-3 left-3 border-b border-l","bottom-3 right-3 border-b border-r"].map((cls) => (
            <div key={cls} className={`absolute w-4 h-4 border-white/20 pointer-events-none z-10 ${cls}`} />
          ))}
          {/* 스캔라인 */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px)" }}
          />
          {/* HUD 라벨 */}
          <div className="absolute top-4 right-10 z-10 pointer-events-none">
            <span className="text-white/20 text-[8px] tracking-[0.3em] font-mono uppercase">WASPER-1 / 3D</span>
          </div>
          <ModelViewer modelPath="/models/wasper_compressed.glb" cameraZ={2.5} rotationY={Math.PI} />
        </div>
      </section>

      {/* ── 영상 이후: 스펙 + 기능 섹션 ─────────────────────────────── */}
      <section className="bg-black py-16 sm:py-28 lg:py-36 px-4 sm:px-10">

        {/* 타이틀 */}
        <div className="mb-16 sm:mb-[250px]">
          <p className="text-sm sm:text-lg font-medium text-white uppercase leading-none mb-1">
            ATA SYSTEM
          </p>
          <div className="flex items-baseline gap-4 sm:gap-8 flex-wrap">
            <h2 className="text-[2.75rem] sm:text-[4.5rem] lg:text-[6.75rem] xl:text-[9rem] font-medium tracking-tighter text-white uppercase leading-none">
              WASPER-1
            </h2>
          </div>
        </div>

        {/* 5행: 모바일 1열, sm 이상 2열 */}
        {features.map((f, i) => (
          <div
            key={f.title}
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 py-4 sm:py-6"
          >
            {/* 스펙 (4개까지만) */}
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

            {/* 기능 */}
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
