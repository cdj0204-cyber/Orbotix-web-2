"use client";

import { useEffect, useRef, useCallback } from "react";

export default function BackgroundReveal() {
  const blurOverlayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const posRef = useRef({ x: -9999, y: -9999 });

  const applyMask = useCallback((x: number, y: number) => {
    if (!blurOverlayRef.current) return;
    // 역마스크: 커서 중심은 transparent(블러 없음) → 바깥은 black(블러 적용)
    const mask = `radial-gradient(circle 200px at ${x}px ${y}px, transparent 0%, transparent 55%, black 100%)`;
    blurOverlayRef.current.style.maskImage = mask;
    (blurOverlayRef.current.style as CSSStyleDeclaration & { webkitMaskImage: string }).webkitMaskImage = mask;
  }, []);

  useEffect(() => {
    // 초기: 커서 없음 → 전체 블러
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
      {/* 베이스: 선명한 원본 이미지 */}
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

      {/* 블러 오버레이: 커서 영역에 구멍을 뚫어 아래 선명한 이미지가 그대로 보이게 */}
      <div
        ref={blurOverlayRef}
        className="fixed inset-0"
        style={{
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          zIndex: 1,
        }}
      />

      {/* 다크 오버레이 */}
      <div className="fixed inset-0 bg-black/60" style={{ zIndex: 2 }} />
    </>
  );
}
