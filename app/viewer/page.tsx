import Link from "next/link";
import ViewerClient from "@/components/ViewerClient";

export const metadata = {
  title: "VIGIL-1 — 3D Model Viewer | ORBOTIX INDUSTRIES",
  description: "Interactive 3D model of the VIGIL-1 autonomous surveillance drone.",
};

export default function ViewerPage() {
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex flex-col">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/image/Orbotix_Logo_Icon_W.png"
            alt="Orbotix"
            className="h-6 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <span className="hidden sm:block text-white/30 text-[9px] tracking-[0.35em] font-mono uppercase group-hover:text-white/50 transition-colors">
            Orbotix Industries
          </span>
        </Link>

        {/* center label */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
          <span className="text-white text-[11px] tracking-[0.4em] font-mono uppercase">
            VIGIL-1
          </span>
          <span className="text-white/25 text-[8px] tracking-[0.3em] font-mono uppercase">
            3D Model Viewer
          </span>
        </div>

        {/* classification tag */}
        <div className="text-white/20 text-[8px] tracking-[0.3em] font-mono uppercase border border-white/10 px-2 py-1 hidden sm:block">
          UNCLASSIFIED
        </div>
      </header>

      {/* ── Canvas ───────────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0">
        <ViewerClient modelPath="/models/vigil_compressed.glb" />

        {/* corner bracket decorations */}
        {[
          "top-4 left-4 border-t border-l",
          "top-4 right-4 border-t border-r",
          "bottom-4 left-4 border-b border-l",
          "bottom-4 right-4 border-b border-r",
        ].map((cls) => (
          <div
            key={cls}
            className={`absolute w-5 h-5 border-white/15 pointer-events-none ${cls}`}
          />
        ))}

        {/* scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)",
          }}
        />
      </div>

      {/* ── Bottom spec bar ──────────────────────────────────────────────── */}
      <footer className="relative z-20 border-t border-white/[0.06] px-6 py-3 flex flex-wrap gap-x-8 gap-y-1">
        {[
          ["DESIGNATION", "VIGIL-1"],
          ["CLASS", "Autonomous Fixed-Wing UAV"],
          ["ENDURANCE", "72 hrs"],
          ["RADIUS", "480 km"],
          ["ACOUSTIC SIG", "< 12 m"],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-white/25 text-[8px] tracking-[0.25em] font-mono uppercase">
              {label}
            </span>
            <span className="text-white/60 text-[8px] tracking-[0.15em] font-mono">
              {value}
            </span>
          </div>
        ))}
      </footer>
    </div>
  );
}
