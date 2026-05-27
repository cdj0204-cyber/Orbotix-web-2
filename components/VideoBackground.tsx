"use client";

import { useEffect, useRef, useState, memo } from "react";

const VideoBackground = memo(function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);  // 비디오 재생 가능 여부
  const [inView, setInView] = useState(true); // Hero 섹션 가시성

  // ── 비디오 로드 완료 감지 ────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.readyState >= 3) { setReady(true); return; }

    const onReady = () => setReady(true);
    video.addEventListener("canplay", onReady, { once: true });
    video.addEventListener("canplaythrough", onReady, { once: true });

    // webm 미지원(iOS Safari 등)은 이벤트 미발생 → 5초 후 fallback
    const fallback = setTimeout(() => setReady(true), 5000);

    return () => {
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("canplaythrough", onReady);
      clearTimeout(fallback);
    };
  }, []);

  // ── Hero 가시성 → play / pause ───────────────────────────────────
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setInView(visible);
        const video = videoRef.current;
        if (!video) return;
        if (visible) video.play().catch(() => {});
        else         video.pause();
      },
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* 비디오 로드 전 / 재생 불가 시 검정 배경 (body bg-black과 동일) */}
      <div
        className="fixed inset-0 pointer-events-none bg-black"
        style={{ zIndex: 10 }}
      />

      {/* 배경 비디오 (모든 디바이스) — muted + playsInline + autoPlay 필수 */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover pointer-events-none"
        style={{
          zIndex: 11,
          opacity: ready && inView ? 1 : 0,
          transition: "opacity 1s ease",
          willChange: "opacity",
          transform: "translateZ(0)",
        }}
      >
        <source src="/video/Main%20page/main%20video_1_webm.webm" type="video/webm" />
      </video>

      {/* 다크 오버레이 */}
      <div
        className="fixed inset-0 pointer-events-none bg-black/50"
        style={{ zIndex: 12 }}
      />
    </>
  );
});

export default VideoBackground;
