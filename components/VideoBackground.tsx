"use client";

import { useEffect, useRef, useState, memo } from "react";

const VideoBackground = memo(function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady]   = useState(false);
  const [inView, setInView] = useState(true);

  // canplaythrough → 준비 완료
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState >= 4) { setReady(true); return; }
    const onReady = () => setReady(true);
    video.addEventListener("canplaythrough", onReady, { once: true });
    return () => video.removeEventListener("canplaythrough", onReady);
  }, []);

  // Hero 영역 감지
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

  const shown = ready && inView;

  return (
    <>
      {/* 모바일 대체 */}
      <div
        className="fixed inset-0 md:hidden pointer-events-none"
        style={{
          backgroundImage: "url('/image/Blur.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
          opacity: shown ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      />

      {/* 비디오 레이어 (z-index 10) */}
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

      {/* 다크 오버레이: 항상 비디오 위에 black/0.45 (z-index 11) */}
      <div
        className="fixed inset-0 hidden md:block pointer-events-none"
        style={{
          backgroundColor: "rgba(0,0,0,0.45)",
          zIndex: 11,
          opacity: shown ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      />

      {/* 블랙 커버: 로딩 전 & 스크롤 아웃 시 (z-index 12) */}
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
