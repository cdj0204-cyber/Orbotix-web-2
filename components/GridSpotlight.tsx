"use client";

import { useEffect, useRef } from "react";

export default function BackgroundReveal() {
  const bokehLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bokehLayerRef.current;
    if (!el) return;

    // window가 아닌 document.documentElement에서 mouseenter/leave 수신
    const onEnter = () => { el.style.opacity = "0"; };
    const onLeave = () => { el.style.opacity = "1"; };

    document.documentElement.addEventListener("mouseenter", onEnter);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      document.documentElement.removeEventListener("mouseenter", onEnter);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      {/* 레이어 1: 선명한 원본 이미지 */}
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

      {/* 레이어 2: 아웃포커싱 레이어
          - 커서 없음(기본): opacity 1 → 아웃포커싱 이미지 표시
          - 커서 진입: opacity 0 으로 1s 전환 → 아래 선명한 원본 이미지 노출
          - filter: blur만 사용 (screen blend 제거 → 더 자연스러운 피사계심도 느낌)
          - scale(1.12): blur 시 엣지에 생기는 하얀 번짐 방지
      */}
      <div
        ref={bokehLayerRef}
        className="fixed inset-0"
        style={{
          backgroundImage: "url('/image/original.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          filter: "blur(22px) brightness(1.04)",
          transform: "scale(1.12)",
          opacity: 1,
          transition: "opacity 1s ease",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* 레이어 3: 다크 오버레이 */}
      <div
        className="fixed inset-0 bg-black/55"
        style={{ zIndex: 0, pointerEvents: "none" }}
      />
    </>
  );
}
