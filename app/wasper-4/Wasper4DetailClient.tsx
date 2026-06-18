"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import dynamic from "next/dynamic";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), { ssr: false });

// ── 상수 ─────────────────────────────────────────────────────────────
const FRAME_COUNT  = 799;
const SCROLL_TOTAL = 28000;   // 474프레임을 매핑하는 스크롤 거리 (작을수록 스크롤당 프레임이 빨라짐)
const FADE         = 200;

const FRAME_URL = (n: number) =>
  `/video/Wasper%20detail%203/frames/frame_${String(n).padStart(3, "0")}.jpg`;

// 프레임 번호(1-indexed, frame_001~frame_799) → 스크롤 위치(px).
// drawFrame 인덱스 f = progress*(FRAME_COUNT-1) 이므로 프레임 N은 progress=(N-1)/(COUNT-1).
// 마지막 프레임(799)은 정확히 SCROLL_TOTAL(=끝)에 매핑된다.
const FRAME_AT = (frame: number) =>
  Math.round(((frame - 1) / (FRAME_COUNT - 1)) * SCROLL_TOTAL);

// ── 오버레이 데이터 ───────────────────────────────────────────────────
const OVERLAYS = [
  {
    id: "airframe",
    scrollAt: FRAME_AT(162),   // 162번 프레임
    holdFor: 3267,
    side: "right" as const,
    label: "01 / STRUCTURE",
    title: "Gen 2.0\nAirframe",
    body: "Redesigned carbon-composite airframe cuts structural weight by 38%, extending the operational envelope under high-G evasive maneuvers.",
  },
  {
    id: "payload",
    scrollAt: FRAME_AT(324),   // 324번 프레임
    holdFor: 1867,
    side: "right" as const,
    label: "02 / PAYLOAD",
    title: "Modular\nWarhead",
    body: "Swappable payload bay supports shaped-charge, thermobaric, and EMP configurations — mission-reconfigurable in under 90 seconds.",
  },
  {
    id: "propulsion",
    scrollAt: FRAME_AT(486),   // 486번 프레임
    holdFor: 1867,
    side: "right" as const,
    label: "03 / PROPULSION",
    title: "Dual-Motor\nRedundancy",
    body: "Twin contra-rotating motors maintain full flight authority on single-motor failure, ensuring mission completion under combat damage.",
  },
  {
    id: "overview",
    scrollAt: FRAME_AT(637),   // 637번 프레임
    holdFor: 2333,
    side: "right" as const,
    label: "04 / OVERVIEW",
    title: "Gen 2.0\nUAV",
    body: "VASPYR-4 is the next-generation\nloitering munition designed for\nhigh-value target engagement.",
  },
  {
    id: "swarm",
    scrollAt: FRAME_AT(799),   // 799번 프레임 (마지막 = 끝)
    holdFor: 2000,
    side: "right" as const,
    label: "05 / NETWORK",
    title: "Swarm\nCoordination",
    body: "Hardened mesh-radio protocol synchronizes up to 16 units in real time, executing coordinated multi-axis strikes without ground-station relay.",
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
  const ref       = useRef<HTMLDivElement>(null);
  const rafRef    = useRef(0);
  const isRunning = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // 뷰포트 진입 → 애니메이션 시작
        if (isRunning.current) return;
        isRunning.current = true;
        const DURATION = 2000;
        const start = performance.now();
        const tick = (now: number) => {
          const t       = Math.min((now - start) / DURATION, 1);
          const eased   = 1 - Math.pow(1 - t, 3);
          const current = parseFloat((num * eased).toFixed(decimals));
          setCount(current);
          if (t < 1) {
            rafRef.current = requestAnimationFrame(tick);
          } else {
            setCount(num);
            isRunning.current = false;
          }
        };
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // 뷰포트 이탈 → 카운트 리셋 (다음 진입 시 재생)
        cancelAnimationFrame(rafRef.current);
        isRunning.current = false;
        setCount(0);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
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
export default function Wasper4DetailClient() {
  const containerRef    = useRef<HTMLDivElement>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  // 개별 슬롯으로 관리 — 로드된 프레임만 즉시 접근 가능
  const framesRef       = useRef<(HTMLImageElement | null)[]>(
    new Array(FRAME_COUNT).fill(null)
  );
  const currentFrameRef = useRef(0);   // 마지막으로 그린 소수점 프레임 위치 (정수 아님)
  const overlayRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const prevOpacityRef  = useRef<number[]>(OVERLAYS.map(() => 0));
  // 진입 시 블랙 → 영상 페이드용 오버레이
  const fadeRef         = useRef<HTMLDivElement>(null);

  // ── Canvas: object-fit:cover + 인접 프레임 크로스 블렌딩 ──────────────
  // 소수점 위치 f를 받아 floor/ceil 두 프레임을 비율 t로 겹쳐 그린다.
  // 느린 감속 구간에서도 프레임 사이가 '탁탁' 끊기지 않고 연속적으로 이어진다.
  const drawFrame = useCallback((f: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maxIdx = FRAME_COUNT - 1;
    const pos = Math.max(0, Math.min(f, maxIdx));
    const i0  = Math.floor(pos);
    const i1  = Math.min(i0 + 1, maxIdx);
    const t   = pos - i0;

    // 해당 인덱스가 아직 로드 전이면 가장 가까운 이전 프레임으로 대체
    const resolve = (idx: number): HTMLImageElement | null => {
      let frame = framesRef.current[idx];
      if (!frame) {
        for (let i = idx - 1; i >= 0; i--) {
          if (framesRef.current[i]) { frame = framesRef.current[i]; break; }
        }
      }
      return frame;
    };

    const cw = canvas.width, ch = canvas.height;
    const drawCover = (img: HTMLImageElement) => {
      const fw = img.naturalWidth, fh = img.naturalHeight;
      if (!fw || !fh) return;
      const scale = Math.max(cw / fw, ch / fh);
      const sw = fw * scale, sh = fh * scale;
      const dx = (cw - sw) / 2, dy = (ch - sh) / 2;
      ctx.drawImage(img, dx, dy, sw, sh);
    };

    const frame0 = resolve(i0);
    if (!frame0) return;

    // 베이스 프레임(불투명) — cover라 캔버스를 가득 덮으므로 clear 불필요
    ctx.globalAlpha = 1;
    drawCover(frame0);

    // 다음 프레임을 비율 t로 덧그려 크로스페이드 (i0*(1-t) + i1*t)
    if (t > 0.001 && i1 !== i0) {
      const frame1 = resolve(i1);
      if (frame1 && frame1 !== frame0) {
        ctx.globalAlpha = t;
        drawCover(frame1);
        ctx.globalAlpha = 1;
      }
    }
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

  // ── 프레임 백그라운드 프리로드 (동시 8개) ────────────────────────────
  // 로딩 화면 없음 — 유저가 타이틀/스펙을 읽는 동안 조용히 로드
  useEffect(() => {
    let cancelled = false;

    const loadOne = (i: number): Promise<void> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (!cancelled) {
            framesRef.current[i] = img;
            // frame 0 준비되면 즉시 canvas에 표시
            if (i === 0) drawFrame(0);
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = FRAME_URL(i + 1);
      });

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

  // ── Lenis + GSAP ScrollTrigger (마운트 즉시 초기화) ──────────────────
  // loadDone 대기 없음 — 프레임 로드 전이면 canvas가 검정으로 유지됨
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    gsap.registerPlugin(ScrollTrigger);

    // 모바일(터치)은 데스크탑보다 빠르게 멈추게 — syncTouch로 터치 관성을 Lenis가 제어:
    //   touchInertiaExponent↓(코스트 감소) + syncTouchLerp↑(빠른 수렴). 데스크탑은 휠 lerp 0.3 유지.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const lenis = new Lenis(
      isTouch
        ? { lerp: 0.3, syncTouch: true, syncTouchLerp: 0.12, touchInertiaExponent: 1.2 }
        : { lerp: 0.3 }
    );
    lenis.on("scroll", ScrollTrigger.update);
    const lenisRaf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(lenisRaf);
    gsap.ticker.lagSmoothing(0);

    // ── 스냅 이동 지점 (SCROLL_TOTAL 좌표계) ───────────────────────────
    // 진입 정착 → 각 오버레이. 단, 인접 지점 사이마다 '중간 정착점'을 하나씩 끼워
    // 휠 1회=중간, 휠 2회=오버레이 → 오버레이당 2번 스크롤이 필요하게 만든다.
    // 마지막 오버레이(scrollAt 28000)가 곧 끝 지점이다.
    const entryOffset = Math.round(window.innerHeight);        // 페이드가 0이 되는 지점
    const ANCHORS = [entryOffset, ...OVERLAYS.map((o) => o.scrollAt)];
    const SNAP_POINTS: number[] = [];
    ANCHORS.forEach((p, i) => {
      if (i > 0) SNAP_POINTS.push(Math.round((ANCHORS[i - 1] + p) / 2));  // 중간 정착점
      SNAP_POINTS.push(p);
    });

    let canvasST: any;
    let snapActive = false;   // 캔버스 섹션이 화면을 점유 중인가 (스냅 모드 ON)
    let snapping   = false;   // 스냅 애니메이션 진행 중 (입력 잠금)
    let snapIndex  = 0;       // 현재 머문 지점 인덱스

    // 지정 인덱스로 부드럽게 스냅 — 이동 거리에 비례해 길이를 잡아 영상 스크럽 속도 균일화
    const animateTo = (i: number, durOverride?: number) => {
      // 마지막 오버레이는 끝(canvasST.end)과 겹치므로 1px 안쪽으로 클램프 —
      // 정확히 end에 닿으면 onLeave가 발화해 스냅 모드가 풀려버린다.
      const target = Math.min(canvasST.start + SNAP_POINTS[i], canvasST.end - 1);
      const dist   = Math.abs(target - lenis.scroll);
      const dur    = durOverride ?? Math.min(1.6, Math.max(0.7, dist / 6000));
      snapIndex = i;
      snapping  = true;
      lenis.scrollTo(target, {
        duration: dur,
        lock: true,                                   // 이동 중 사용자 입력 무시
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        onComplete: () => { snapping = false; },
      });
    };

    // 한 칸 이동 요청 (휠/스와이프 공통). 범위를 벗어나면 스냅 모드 해제 → 일반 스크롤로 탈출
    const step = (dir: number, e: Event): boolean => {
      if (snapping) { e.preventDefault(); e.stopPropagation(); return true; }
      const next = snapIndex + dir;
      if (next < 0 || next >= SNAP_POINTS.length) {
        snapActive = false;        // 위/아래로 빠져나감 — Lenis가 일반 스크롤 처리
        return false;
      }
      e.preventDefault();
      e.stopPropagation();
      animateTo(next);
      return true;
    };

    const onWheel = (e: WheelEvent) => {
      if (!snapActive) return;
      step(e.deltaY > 0 ? 1 : -1, e);
    };

    // 터치: 스와이프 방향 1회 = 한 칸. 임계값 전엔 네이티브 스크롤만 차단
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (!snapActive) return;
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!snapActive) return;
      if (snapping) { e.preventDefault(); e.stopPropagation(); return; }
      const dy = touchStartY - e.touches[0].clientY;   // 위로 스와이프 → 양수 → 다음
      if (Math.abs(dy) < 40) { e.preventDefault(); e.stopPropagation(); return; }
      touchStartY = e.touches[0].clientY;
      step(dy > 0 ? 1 : -1, e);
    };

    // 캔버스 섹션 경계를 지날 때 스냅 모드 ON/OFF
    const activate = (fromTop: boolean) => {
      if (snapActive) return;
      snapActive = true;
      animateTo(fromTop ? 0 : SNAP_POINTS.length - 1, 0.5);   // 진입 즉시 관성 제거 후 정착
    };
    const deactivate = () => { snapActive = false; };

    const ctx = gsap.context(() => {
      // 진입 페이드: 섹션이 화면 아래에서 올라오기 시작해 상단 고정 이후까지
      // 2화면 구간에 걸쳐 블랙 오버레이를 1 → 0 으로 스크럽 (기존보다 2배 느린 전환)
      ScrollTrigger.create({
        trigger: container,
        start: "top bottom",
        end: () => "+=" + window.innerHeight * 2,
        scrub: true,
        onUpdate: (self) => {
          if (fadeRef.current) {
            fadeRef.current.style.opacity = String(1 - self.progress);
          }
        },
      });

      canvasST = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_TOTAL}`,
        scrub: true,
        // 섹션에 진입하면 스냅 모드, 위/아래로 완전히 벗어나면 해제
        onEnter:     () => activate(true),
        onEnterBack: () => activate(false),
        onLeave:     deactivate,
        onLeaveBack: deactivate,
        onUpdate: (self) => {
          // 프레임 위치(소수점) → 인접 프레임 크로스 블렌딩 드로우
          // 변화가 미세할 땐(< 0.0015 프레임) 다시 그리지 않음.
          const f = self.progress * (FRAME_COUNT - 1);
          if (Math.abs(f - currentFrameRef.current) > 0.0015) {
            currentFrameRef.current = f;
            drawFrame(f);              // 스냅 없음 — 멈추면 그 소수점 위치 그대로 정지
          }

          // 오버레이 opacity + 타자 효과
          const scrolled = self.progress * SCROLL_TOTAL;
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

    // 캡처 단계에서 가로채 Lenis 기본 휠/터치 처리를 차단(stopPropagation)하고 직접 스냅
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: false, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });

    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true } as any);
      window.removeEventListener("touchstart", onTouchStart, { capture: true } as any);
      window.removeEventListener("touchmove", onTouchMove, { capture: true } as any);
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(lenisRaf);
    };
  }, [drawFrame]);

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

      {/* ── 0. 메인 이미지 섹션 ───────────────────────────────────────── */}
      <section className="pt-16 px-4 sm:px-10">
        <div className="w-full aspect-[1920/900] overflow-hidden">
          <img
            src="/image/Wasper/Wasper_Main 4.png"
            alt="VASPYR-4"
            className="w-full h-full object-cover object-top"
          />
        </div>
      </section>

      {/* ── 1. 히어로 타이틀 섹션 (즉시 표시) ───────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 sm:px-10">
        <div className="flex items-start gap-1 sm:gap-3 lg:gap-4">

          {/* 왼쪽 카테고리 라벨 (TITLE) — 오른쪽 첫 번째 줄(ATX SYSTEM) 캡 상단에 정렬 */}
          <div className="hidden sm:block shrink-0 w-[120px] lg:w-[160px] mt-4">
            <span
              className="text-white text-base font-medium uppercase tracking-widest"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              TITLE
            </span>
          </div>

          {/* 오른쪽: ATX SYSTEM + VASPYR-2 동일 크기 2줄 */}
          <div className="flex flex-col items-start">
            <p className="text-[2.75rem] sm:text-[4.5rem] lg:text-[6.75rem] xl:text-[9rem] font-medium tracking-tighter text-white uppercase leading-none">
              ATX SYSTEM
            </p>
            <h1 className="text-[2.75rem] sm:text-[4.5rem] lg:text-[6.75rem] xl:text-[9rem] font-medium tracking-tighter text-white uppercase leading-none">
              VASPYR-4
            </h1>
          </div>

        </div>

        {/* 스크롤 인디케이터 — 우측 하단 */}
        <div className="absolute bottom-10 right-10 flex flex-col items-center gap-2 pointer-events-none">
          <svg
            className="animate-bounce text-white/40"
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ── 2. 스펙 + 기능 섹션 (즉시 표시) ─────────────────────────── */}
      <section className="bg-black pt-16 sm:pt-28 lg:pt-36 pb-32 sm:pb-56 lg:pb-72 px-4 sm:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 items-start">

          {/* ── SPEC 단 ── */}
          <div className="flex gap-1 sm:gap-3 lg:gap-4 items-start">
            {/* 라벨 */}
            <div className="hidden sm:block shrink-0 w-[120px] lg:w-[160px]">
              <span
                className="text-white text-base font-medium uppercase tracking-widest"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                SPEC
              </span>
            </div>
            {/* 스탯 목록 */}
            <div className="flex-1">
              {stats.map((s, idx) => (
                <div key={s.l} className={idx === 0 ? "pb-4 sm:pb-6" : "py-4 sm:py-6"}>
                  <StatCounter
                    num={s.num}
                    unit={s.unit}
                    decimals={s.decimals}
                    label={s.l}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── FEATURES 단 ── */}
          <div className="flex gap-1 sm:gap-3 lg:gap-4 items-start mt-12 sm:mt-0">
            {/* 라벨 */}
            <div className="hidden sm:block shrink-0 w-[120px] lg:w-[160px]">
              <span
                className="text-white text-base font-medium uppercase tracking-widest"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                FEATURES
              </span>
            </div>
            {/* 피처 목록 */}
            <div className="flex-1">
              {features.map((f, i) => (
                <div key={f.title} className={i === 0 ? "pb-4 sm:pb-6" : "py-4 sm:py-6"}>
                  <h4 className="text-white text-[13px] sm:text-[15px] font-medium uppercase tracking-widest mb-2">
                    {String(i + 1).padStart(2, "0")}. {f.title}
                  </h4>
                  <p className="text-white text-base sm:text-lg leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. 캔버스 스크롤 섹션 (백그라운드 로드 완료 후 재생) ──────── */}
      <div ref={containerRef} style={{ height: `calc(100vh + ${SCROLL_TOTAL}px)` }}>
        <div className="sticky top-0 h-screen overflow-hidden" style={{ zIndex: 0 }}>

          {/* Canvas */}
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

          {/* 진입 페이드 블랙 오버레이 (스크롤로 1→0) */}
          <div
            ref={fadeRef}
            className="absolute inset-0 pointer-events-none bg-black"
            style={{ zIndex: 8, opacity: 1 }}
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

        </div>
      </div>

      {/* ── 4. 3D 모델 뷰어 ──────────────────────────────────────────────── */}
      <section className="bg-black" style={{ height: "100vh" }}>
        <ModelViewer
          modelPath="/models/wasper_compressed.glb"
          cameraZ={2.2}
          rotationY={0}
        />
      </section>

    </div>
  );
}
