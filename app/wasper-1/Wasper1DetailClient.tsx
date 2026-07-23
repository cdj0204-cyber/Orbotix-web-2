"use client";

import { useEffect, useRef, useState } from "react";

/* 2단계 텍스트 크기만 사용: 헤더(섹션 타이틀) / 본문(다른 섹션과 동일) */
const HEADER = "text-white text-[25px] font-medium uppercase tracking-normal leading-none";
const BODY = "text-white text-base sm:text-lg leading-relaxed";

const specs = [
  { label: "Weight", value: "2.3 kg" },
  { label: "Range", value: "15 km" },
  { label: "Max Speed", value: "70 km/h" },
  { label: "Endurance", value: "< 30 min" },
];

const features = [
  {
    title: "EO/IR PRECISION IMAGING",
    body: "Capture high-resolution visual and thermal imagery for long-range observation, day and night reconnaissance, and intelligence collection.",
  },
  {
    title: "RESILIENT COMMUNICATIONS",
    body: "Maintain secure command, control, and real-time video transmission through encrypted frequency-hopping communications in degraded environments.",
  },
  {
    title: "SWARMING OPERATION",
    body: "Coordinate multiple UAVs in swarming drone operations to increase operational reach, mission flexibility, and strike effectiveness.",
  },
  {
    title: "CUSTOM C2 PLATFORM",
    body: "Mission planning, live video monitoring, and intuitive flight management through Orbotix's proprietary ground control software.",
  },
];

const conops = [
  {
    title: "Precision Effects",
    body: "Deliver precision effects against designated targets while reducing collateral impact. WASPER-1 enables accurate target engagement across dynamic operational environments.",
  },
  {
    title: "Beyond Line-of-Sight Engagement",
    body: "Extend operational reach by engaging designated targets beyond the direct line of sight, allowing operators to respond to threats while maintaining safe stand-off distances.",
  },
  {
    title: "Precision Guidance",
    body: "ATA supports target acquisition and terminal guidance throughout the final phase of flight, helping operators maintain precision from launch to mission execution.",
  },
  {
    title: "Mission Adaptability",
    body: "Support a wide range of operational scenarios with a single precision strike platform. WASPER-1 adapts to evolving mission requirements while delivering consistent operational performance.",
  },
  {
    title: "Rapid Mission Execution",
    body: "Respond quickly to emerging threats with a platform designed for rapid deployment and immediate mission execution, enabling operators to act as operational conditions evolve.",
  },
];

/* 이미지 자리를 회색 영역 + 번호로 표시 (추후 실제 이미지로 교체) */
function Placeholder({ n, className = "" }: { n: number; className?: string }) {
  return (
    <div className={`relative bg-white/10 border border-white/10 flex items-center justify-center ${className}`}>
      <span className={`${BODY} group-hover:text-black transition-colors`}>{String(n).padStart(2, "0")}</span>
    </div>
  );
}

function VideoBlock({
  src,
  className = "",
  loop = true,
  playOnView = false,
  zoom = 1,
  fit = "cover",
  nativeAspect = 16 / 9,
}: {
  src: string;
  className?: string;
  loop?: boolean;
  playOnView?: boolean;
  zoom?: number;
  fit?: "cover" | "contain";
  nativeAspect?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  /* contain 모드일 때: 컨테이너 높이가 확대된(zoom) 영상 높이에 항상 맞춰지도록 자동 계산 */
  const containerStyle =
    fit === "contain" ? { aspectRatio: `${nativeAspect / zoom}` } : undefined;

  useEffect(() => {
    if (!playOnView) return;
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.currentTime = 0;
          video.play();
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [playOnView]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={containerStyle}>
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
        style={zoom !== 1 ? { transform: `scale(${zoom})` } : undefined}
        src={src}
        autoPlay={!playOnView}
        loop={loop}
        muted
        playsInline
      />
    </div>
  );
}

export default function Wasper1DetailClient() {
  const [activeConcept, setActiveConcept] = useState(0);

  return (
    <div className="bg-black">
      {/* ── 0. 메인 이미지 ── */}
      <section className="pt-16 px-4 sm:px-10">
        <VideoBlock src="/video/VASPYR-1/WASPER_intro_high.mp4" className="w-full aspect-[1920/900]" />
      </section>

      {/* ── 1. 타이틀 + 설명 ── */}
      <section className="px-4 sm:px-10 pt-16 sm:pt-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 items-start">
          <h1 className="text-white text-[200px] font-medium uppercase tracking-normal leading-none">
            VASPYR-1
          </h1>
          <p className={`${BODY} mt-5 sm:mt-7`}>
            Precision Strike UAV
            <br />
            VASPYR-1 is engineered for precision strike missions across dynamic operational environments, combining autonomous navigation,
            <br />
            AI-assisted targeting, and rapid deployment to support mission-critical strike operations.
          </p>
        </div>
      </section>

      {/* ── 2. 이미지(썸네일+메인) + DETAIL SPEC ── */}
      <section className="px-4 sm:px-10 pt-[164px] sm:pt-[196px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* 왼쪽: DETAIL SPEC */}
          <div>
            <h2 className={`${HEADER} mb-6`}>Detail Spec</h2>
            <div className="grid grid-cols-2 gap-x-8">
              <div className="flex flex-col divide-y divide-white border-t border-white">
                {specs.map((s) => (
                  <div key={s.label} className="flex items-center justify-between pt-1 sm:pt-1.5 pb-2 sm:pb-3">
                    <span className={BODY}>{s.label}</span>
                    <span className={BODY}>{s.value}</span>
                  </div>
                ))}
              </div>
              <div />
            </div>
          </div>

          {/* 오른쪽: 영상 (전체 폭) */}
          <VideoBlock
            src="/video/VASPYR-1/WASPER_turnning.mp4"
            className="w-full"
            loop={false}
            playOnView
            zoom={1.4}
            fit="contain"
          />
        </div>
      </section>

      {/* ── 3. FEATURES (4단 그리드) ── */}
      <section className="px-4 sm:px-10 pt-[164px] sm:pt-[196px]">
        <h2 className={`${HEADER} mb-6`}>Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={f.title} className="group bg-white/10 hover:bg-white p-6 transition-colors cursor-pointer">
              <Placeholder n={7 + i} className="w-full aspect-[4/3] mb-4" />
              <h3 className={`text-white text-base sm:text-lg font-medium uppercase tracking-normal leading-snug mb-4 group-hover:text-black transition-colors`}>
                {f.title}
              </h3>
              <p className={`${BODY} group-hover:text-black transition-colors`}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. CONCEPT OF OPERATION ── */}
      <section className="px-4 sm:px-10 pt-[264px] sm:pt-[296px]">
        <h2 className={`${HEADER} mb-6`}>Concept of Operation</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 번호 + 타이틀 목록 */}
          <div className="flex flex-col gap-3">
            {conops.map((c, i) => (
              <button
                key={c.title}
                onClick={() => setActiveConcept(i)}
                className={`text-[25px] font-medium uppercase tracking-normal leading-none text-left transition-colors ${
                  i === activeConcept
                    ? "text-white underline underline-offset-4"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {String(i + 1).padStart(2, "0")}. {c.title}
              </button>
            ))}
          </div>

          {/* 오른쪽: 본문 + 이미지 */}
          <div>
            <p className={`${BODY} mb-6`}>{conops[activeConcept].body}</p>
            <Placeholder n={11 + activeConcept} className="w-full aspect-[4/3]" />
          </div>
        </div>
      </section>

      {/* ── 5. OPERATION DEMO ── */}
      <section className="px-4 sm:px-10 pt-16 sm:pt-24 pb-16 sm:pb-24">
        <p className={`${BODY} mb-2`}>VASPYR-1</p>
        <h2 className={`${HEADER} mb-6`}>Operation Demo</h2>
        <VideoBlock src="/video/VASPYR-1/WASPER_DEMO.mp4" className="w-full aspect-video" />
      </section>
    </div>
  );
}
