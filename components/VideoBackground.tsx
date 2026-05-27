"use client";

import { useEffect, useRef, useState, memo } from "react";

const VideoBackground = memo(function VideoBackground() {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);   // 비디오 재생 가능 여부
  const [inView, setInView] = useState(true);  // Hero 섹션 가시성

  // ── 비디오 로드 완료 감지 ────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 이미 준비됐으면 즉시 처리
    if (video.readyState >= 3) { setReady(true); return; }

    const onReady = () => setReady(true);
    video.addEventListener("canplay", onReady, { once: true });
    video.addEventListener("canplaythrough", onReady, { once: true });

    // webm을 지원하지 않는 iOS Safari 등에서는 이벤트가 발생하지 않으므로
    // 5초 후 fallback → 정적 이미지(poster)가 그대로 노출됨
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
      {/* ── 레이어 1: 정적 blur 이미지 ─────────────────────────────
          · 항상 표시 → iOS Safari (webm 미지원) 자동 폴백
          · 비디오가 재생되면 위 레이어에 의해 가려짐              */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/image/Blur.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 10,
        }}
      />

      {/* ── 레이어 2: 다크 오버레이 ────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none bg-black/50"
        style={{ zIndex: 11 }}
      />

      {/* ── 레이어 3: 배경 비디오 (모든 디바이스) ──────────────────
          · muted + playsInline + autoPlay: 모바일 자동재생 필수
          · poster: 비디오 로드 전 또는 재생 불가 시 정적 이미지
          · opacity: 재생 준비 완료 후 페이드인               */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/image/Blur.png"
        className="fixed inset-0 w-full h-full object-cover pointer-events-none"
        style={{
          zIndex: 12,
          opacity: ready && inView ? 1 : 0,
          transition: "opacity 1s ease",
          willChange: "opacity",
          transform: "translateZ(0)",
        }}
      >
        <source src="/video/Main%20page/main%20video_1_webm.webm" type="video/webm" />
      </video>
    </>
  );
});

export default VideoBackground;
