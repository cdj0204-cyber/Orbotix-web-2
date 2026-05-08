"use client";

import { useEffect } from "react";

// 메인 페이지 하위 섹션에서 사용하는 heavy assets
// 페이지 로드 직후 백그라운드 fetch → HTTP 캐시에 적재
// → 해당 섹션 스크롤 시 ModelViewer가 캐시에서 즉시 로드
const ASSETS = [
  "/models/wasper_compressed.glb",  // WASPER-1 (3.4 MB)
  "/models/vigil_compressed.glb",   // VIGIL-1  (2.6 MB)
  "/draco/draco_wasm_wrapper.js",   // Draco WASM wrapper
  "/draco/draco_decoder.wasm",      // Draco decoder
  "/draco/draco_decoder.js",        // Draco decoder (JS fallback)
];

export default function AssetPreloader() {
  useEffect(() => {
    // 히어로 영상 로딩과 경쟁하지 않도록 1.5초 지연 후 순차 prefetch
    const timer = window.setTimeout(() => {
      ASSETS.forEach((url) =>
        fetch(url, { cache: "default" }).catch(() => {})
      );
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return null; // 렌더링 없음 — 사이드 이펙트 전용
}
