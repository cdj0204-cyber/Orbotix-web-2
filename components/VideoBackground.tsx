"use client";

import { useEffect, useRef, useState, memo } from "react";

const VideoBackground = memo(function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [inView, setInView] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // 초기 렌더 시 모바일 여부 판별
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 데스크탑: 비디오 로드 완료 감지
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState >= 4) { setVideoReady(true); return; }
    const onReady = () => setVideoReady(true);
    video.addEventListener("canplaythrough", onReady, { once: true });
    // 일부 브라우저에서 canplaythrough 미발생 대비 fallback
    const fallback = window.setTimeout(() => setVideoReady(true), 3000);
    return () => {
      video.removeEventListener("canplaythrough", onReady);
      clearTimeout(fallback);
    };
  }, []);

  // Hero 영역 가시성 감지
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
        else video.pause();
      },
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // 모바일: inView만으로 표시 (비디오 로드 불필요)
  // 데스크탑: videoReady && inView
  const mobileVisible = inView;
  const desktopVisible = videoReady && inView;
  const shown = isMobile ? mobileVisible : desktopVisible;

  return (
    <>
      {/* ── 모바일 배경 이미지 (md 미만) ─────────────────────────── */}
      <div
        className="fixed inset-0 md:hidden pointer-events-none"
        style={{
          backgroundImage: "url('/image/Blur.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 10,
          opacity: mobileVisible ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      />

      {/* 모바일 다크 오버레이 */}
      <div
        className="fixed inset-0 md:hidden pointer-events-none"
        style={{
          backgroundColor: "rgba(0,0,0,0.55)",
          zIndex: 11,
          opacity: mobileVisible ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      />

      {/* ── 데스크탑 비디오 (md 이상) ────────────────────────────── */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover hidden md:block pointer-events-none"
        style={{
          zIndex: 10,
          opacity: 1,
          willChange: "transform",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        <source src="/video/Main%20page/main%20video_1_webm.webm" type="video/webm" />
      </video>

      {/* 데스크탑 다크 오버레이 */}
      <div
        className="fixed inset-0 hidden md:block pointer-events-none"
        style={{
          backgroundColor: "rgba(0,0,0,0.45)",
          zIndex: 11,
          opacity: desktopVisible ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      />

      {/* ── 공통 블랙 커버: 로딩 전 & 스크롤 아웃 시 ─────────────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundColor: "#000",
          zIndex: 12,
          opacity: shown ? 0 : 1,
          transition: "opacity 0.8s ease",
        }}
      />
    </>
  );
});

export default VideoBackground;
