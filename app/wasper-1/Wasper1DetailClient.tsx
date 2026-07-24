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
    title: "Autonomous Strike",
    body: "Designed for precision strike missions through autonomous terminal guidance following operator target selection.",
  },
  {
    title: "Operations in GNSS-Denied Environments",
    body: "Maintain mission continuity in GNSS-denied and Electronic Warfare (EW) environments through secure, resilient communications designed for contested operations.",
  },
  {
    title: "SWARMING OPERATION",
    body: "Coordinate multiple UAVs in swarming drone operations to increase operational reach, mission flexibility, and strike effectiveness.",
  },
  {
    title: "Terminal Guidance",
    body: "Maintain precision during the final phase of flight to support accurate target engagement.",
  },
  {
    title: "Payload Dropping",
    body: "Deliver mission payloads with precision to support tactical operations across a range of operational scenarios.",
  },
];

const featureVideos: Record<number, string> = {
  8: "/video/VASPYR-1/9_Swarm.mp4",
  9: "/video/VASPYR-1/8_GNSS.mp4",
};

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
function Placeholder({ n, className = "", light = false }: { n: number; className?: string; light?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center ${
        light ? "bg-black/10 border border-black/10" : "bg-white/10 border border-white/10"
      } ${className}`}
    >
      <span className={`text-base sm:text-lg leading-relaxed ${light ? "text-black" : "text-white"}`}>
        {String(n).padStart(2, "0")}
      </span>
    </div>
  );
}

function VideoBlock({
  src,
  className = "",
  loop = true,
  playOnView = false,
  hoverPlay = false,
  zoom = 1,
  fit = "cover",
  nativeAspect = 16 / 9,
}: {
  src: string;
  className?: string;
  loop?: boolean;
  playOnView?: boolean;
  hoverPlay?: boolean;
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

  const handleMouseEnter = () => {
    if (!hoverPlay) return;
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
  };
  const handleMouseLeave = () => {
    if (!hoverPlay) return;
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
        style={zoom !== 1 ? { transform: `scale(${zoom})` } : undefined}
        src={src}
        autoPlay={!playOnView && !hoverPlay}
        loop={loop}
        muted
        playsInline
      />
    </div>
  );
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="8" viewBox="0 0 16 8" fill="none" className={className}>
      <line x1="0" y1="4" x2="12" y2="4" stroke="currentColor" strokeWidth="1" />
      <polyline points="9,1 13,4 9,7" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" className={className}>
      <polyline
        points="1,1 9,8 1,15"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Wasper1DetailClient() {
  const [activeConcept, setActiveConcept] = useState(0);
  const featuresScrollRef = useRef<HTMLDivElement>(null);

  const scrollFeatures = (dir: 1 | -1) => {
    const el = featuresScrollRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const amount = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.31;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

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
            WASPER-1 integrates autonomous mission capabilities that enhance operational flexibility, coordinated strike execution,
            <br />
            and mission effectiveness — making it ideally suited for precision strike and target engagement missions in contested
            <br />
            operational environments.
          </p>
        </div>
      </section>

      {/* ── 2. 이미지(썸네일+메인) + DETAIL SPEC ── */}
      <section className="px-4 sm:px-10 pt-[300px]">
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

      {/* ── 3. FEATURES (카드 캐러셀: 3개 + 4번째 일부) ── */}
      <section className="px-4 sm:px-10 pt-[300px]">
        <div className="flex items-end justify-between mb-6">
          <h2 className={HEADER}>Features</h2>
          <a href="#" className="flex items-center gap-2 text-white text-sm sm:text-base hover:underline underline-offset-4">
            Download Technical Specifications
            <ArrowIcon />
          </a>
        </div>
        <div className="relative">
          <button
            onClick={() => scrollFeatures(-1)}
            aria-label="Previous"
            className="absolute top-1/2 -translate-y-1/2 left-4 z-10 w-10 h-20 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition-colors"
          >
            <ChevronIcon className="-scale-x-100" />
          </button>
          <button
            onClick={() => scrollFeatures(1)}
            aria-label="Next"
            className="absolute top-1/2 -translate-y-1/2 right-4 z-10 w-10 h-20 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition-colors"
          >
            <ChevronIcon />
          </button>

          <div
            ref={featuresScrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {features.map((f, i) => (
              <div
                key={f.title}
                className="shrink-0 basis-[85%] sm:basis-[31%] snap-start bg-white p-6"
              >
                {featureVideos[7 + i] ? (
                  <VideoBlock
                    src={featureVideos[7 + i]}
                    className="w-full aspect-[4/3] mb-4"
                    hoverPlay
                  />
                ) : (
                  <Placeholder n={7 + i} light className="w-full aspect-[4/3] mb-4" />
                )}
                <h3 className="text-black text-base sm:text-lg font-medium uppercase tracking-normal leading-snug mb-4">
                  {String(i + 1).padStart(2, "0")}. {f.title}
                </h3>
                <p className="text-black text-base sm:text-lg leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. POWERED BY ATA ── */}
      <section className="pt-[300px]">
        <div className="relative w-full aspect-[16/7]">
          <img
            src="/image/VASPYR-1/ATA%20system_main.png"
            alt="Powered by ATA System"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 px-4 sm:px-10 pt-8 sm:pt-12">
            <div className="max-w-xl">
              <h2 className={`${HEADER} mb-6`}>Powered by ATA System</h2>
              <p className={BODY}>
                Developed by Orbotix, ATA is the proprietary software behind WASPER-1, supporting autonomous mission functions under human command.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. CONCEPT OF OPERATION ── */}
      <section className="px-4 sm:px-10 pt-[300px]">
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
            <Placeholder n={12 + activeConcept} className="w-full aspect-[4/3]" />
          </div>
        </div>
      </section>

      {/* ── 6. OPERATION DEMO ── */}
      <section className="px-4 sm:px-10 pt-[300px] pb-16 sm:pb-24">
        <h2 className={`${HEADER} mb-6`}>Operation Demo</h2>
        <div className="group relative">
          <VideoBlock src="/video/VASPYR-1/WASPER_DEMO.mp4" className="w-full aspect-[16/7]" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors pointer-events-none flex items-center justify-center">
            <button
              type="button"
              className="pointer-events-auto px-8 py-3 border border-white text-white text-sm sm:text-base font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black"
            >
              Request Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
