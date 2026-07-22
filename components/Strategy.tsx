export default function Strategy() {
  return (
    <section className="bg-black pt-[50px] pb-24 sm:pb-36 lg:pb-44 px-4 sm:px-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 items-start">
        {/* 왼쪽 단은 비워둠 */}
        <div />

        {/* ── 오른쪽 단 ── */}
        <p className="text-white text-base sm:text-lg leading-relaxed">
          Modern operations demand faster decision-making, greater situational awareness,
          <br />
          and the ability to respond effectively in dynamic environments.
          <br />
          We develop autonomous UAV systems designed to support operational readiness
          <br />
          across defense and security applications.
        </p>
      </div>
    </section>
  );
}
