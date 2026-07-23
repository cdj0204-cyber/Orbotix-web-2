"use client";

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
    title: "AUTONOMOUS FLIGHT",
    body: "Autonomous navigation enables stable flight and terminal accuracy, even under GPS-denied or A2/AD conditions.",
  },
  {
    title: "AI TARGETING & LOCK",
    body: "Onboard AI targeting algorithms classify and prioritize threats in real time, ensuring rapid and precise engagement.",
  },
  {
    title: "SWARM CAPABILITY",
    body: "Multiple autonomous drones operate in synchronized formations, overwhelming defenses and adapting dynamically to mission needs.",
  },
  {
    title: "RAPID DEPLOYMENT",
    body: "Compact form factor and intuitive interface allow launch within seconds, reducing preparation time and operator exposure.",
  },
];

/* 이미지 자리를 회색 영역 + 번호로 표시 (추후 실제 이미지로 교체) */
function Placeholder({ n, className = "" }: { n: number; className?: string }) {
  return (
    <div className={`relative bg-white/10 border border-white/10 flex items-center justify-center ${className}`}>
      <span className={BODY}>{String(n).padStart(2, "0")}</span>
    </div>
  );
}

export default function Wasper1DetailClient() {
  return (
    <div className="bg-black">
      {/* ── 0. 메인 이미지 ── */}
      <section className="pt-16 px-4 sm:px-10">
        <Placeholder n={1} className="w-full aspect-[1920/900]" />
      </section>

      {/* ── 1. 타이틀 + 설명 ── */}
      <section className="px-4 sm:px-10 pt-16 sm:pt-24">
        <h1 className={`${HEADER} mb-6`}>VASPYR-1</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <p className={BODY}>Precision Strike UAV</p>
          <p className={BODY}>
            VASPYR-1 is engineered for precision strike missions across dynamic operational
            environments, combining autonomous navigation, AI-assisted targeting, and rapid
            deployment to support mission-critical strike operations.
          </p>
        </div>
      </section>

      {/* ── 2. 이미지(썸네일+메인) + DETAIL SPEC ── */}
      <section className="px-4 sm:px-10 pt-16 sm:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* 왼쪽: 썸네일 4개 + 중앙 이미지 */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-3 shrink-0">
              {[2, 3, 4, 5].map((n) => (
                <Placeholder key={n} n={n} className="w-16 h-16 sm:w-20 sm:h-20" />
              ))}
            </div>
            <Placeholder n={6} className="flex-1 aspect-square" />
          </div>

          {/* 오른쪽: DETAIL SPEC */}
          <div>
            <h2 className={`${HEADER} mb-6`}>Detail Spec</h2>
            <div className="flex flex-col divide-y divide-white/10 border-t border-b border-white/10">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center justify-between py-4 sm:py-6">
                  <span className={BODY}>{s.label}</span>
                  <span className={BODY}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURES (4단 그리드) ── */}
      <section className="px-4 sm:px-10 pt-16 sm:pt-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={f.title}>
              <Placeholder n={7 + i} className="w-full aspect-[4/3] mb-4" />
              <h3 className={`${HEADER} mb-4`}>{f.title}</h3>
              <p className={BODY}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. CONCEPT OF OPERATION ── */}
      <section className="px-4 sm:px-10 pt-16 sm:pt-24">
        <h2 className={`${HEADER} mb-6`}>Concept of Operation</h2>
        <div className="flex items-center gap-4 mb-6">
          <span className={`${BODY} text-white/40`}>Deploy</span>
          <span className={BODY}>/</span>
          <span className={`${BODY} underline underline-offset-4`}>Strike</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className={`${BODY} mb-4`}>Neutralize threats with precision.</p>
              <p className={BODY}>
                VASPYR-1 delivers precise terminal engagement against high-value targets,
                combining autonomous guidance with real-time operator confirmation to minimize
                collateral risk and maximize mission success.
              </p>
            </div>
            <span className={`${BODY} mt-8`}>02 / 02</span>
          </div>
          <Placeholder n={11} className="w-full aspect-[4/3]" />
        </div>
      </section>

      {/* ── 5. OPERATION DEMO ── */}
      <section className="px-4 sm:px-10 pt-16 sm:pt-24 pb-16 sm:pb-24">
        <p className={`${BODY} mb-2`}>VASPYR-1</p>
        <h2 className={`${HEADER} mb-6`}>Operation Demo</h2>
        <Placeholder n={12} className="w-full aspect-video" />
      </section>
    </div>
  );
}
