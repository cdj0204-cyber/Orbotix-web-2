"use client";

import { useEffect, useRef, useCallback } from "react";

export default function BackgroundReveal() {
  const blurLayerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const posRef = useRef({ x: -9999, y: -9999 });

  const applyMask = useCallback((x: number, y: number) => {
    if (!blurLayerRef.current) return;
    // 커서 중심 → 선명(아래 원본 이미지 노출), 바깥 → 보케 레이어 표시
    const mask = `radial-gradient(circle 280px at ${x}px ${y}px, transparent 0%, transparent 22%, rgba(0,0,0,0.55) 48%, black 68%)`;
    blurLayerRef.current.style.maskImage = mask;
    (blurLayerRef.current.style as CSSStyleDeclaration & { webkitMaskImage: string }).webkitMaskImage = mask;
  }, []);

  useEffect(() => {
    applyMask(-9999, -9999);

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() =>
        applyMask(posRef.current.x, posRef.current.y)
      );
    };

    const onLeave = () => {
      cancelAnimationFrame(rafRef.current);
      applyMask(-9999, -9999);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [applyMask]);

  return (
    <>
      {/* SVG 필터 정의 — 보케(렌즈 아웃포커싱) 효과 */}
      {/* blur + screen blend → 밝은 부분이 퍼지며 빛번짐 발생 (진짜 렌즈 특성) */}
      <svg
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        aria-hidden="true"
      >
        <defs>
          <filter id="bokeh" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
            {/* 1차 블러: 피사계심도 흐림 */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur1" />
            {/* screen 블렌드: 밝은 영역이 퍼지는 보케 특성 */}
            <feBlend in="blur1" in2="SourceGraphic" mode="screen" result="bokeh" />
            {/* 2차 블러: 전체 부드러움 */}
            <feGaussianBlur in="bokeh" stdDeviation="7" result="softened" />
            {/* 밝기/채도 보정: 아웃포커스 영역 특유의 밝고 포화된 느낌 */}
            <feComponentTransfer in="softened">
              <feFuncR type="linear" slope="1.08" />
              <feFuncG type="linear" slope="1.08" />
              <feFuncB type="linear" slope="1.12" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* 레이어 1: 선명한 원본 이미지 (커서 아래 노출됨) */}
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: "url('/image/original.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      />

      {/* 레이어 2: 보케 레이어 — SVG 필터로 진짜 아웃포커싱 */}
      <div
        ref={blurLayerRef}
        className="fixed inset-0"
        style={{
          backgroundImage: "url('/image/original.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          filter: "url(#bokeh)",
          transform: "scale(1.1)", /* 필터 엣지 번짐 방지 */
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* 레이어 3: 다크 오버레이 */}
      <div className="fixed inset-0 bg-black/55" style={{ zIndex: 0, pointerEvents: "none" }} />
    </>
  );
}
