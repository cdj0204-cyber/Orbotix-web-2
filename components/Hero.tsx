"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import VideoBackground from "@/components/VideoBackground";

const WAVE_R   = 220;
const MAX_DISP = 7;
const MIN_PX   = 2;
const MAX_PX   = 10;
const PAD_Y    = 20;

/* ── Pixel-wave text ─────────────────────────────────────────────── */
function WaveText({ text, className }: { text: string; className?: string }) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const charRefs   = useRef<(HTMLSpanElement | null)[]>([]);
  const mouse      = useRef({ x: -9999, y: -9999 });
  const moveTime   = useRef(0);
  const curY       = useRef<number[]>([]);
  const rafId      = useRef(0);
  const fontStr    = useRef("");
  const colorStr   = useRef("#fff");
  const spriteMap  = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const chars      = Array.from(text);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const animate = useCallback(() => {
    const elapsed = (Date.now() - moveTime.current) / 1000;
    const canvas  = canvasRef.current;
    const wrapper = wrapperRef.current;

    if (canvas && wrapper) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const wr = wrapper.getBoundingClientRect();

        charRefs.current.forEach((el, i) => {
          if (!el) return;
          const ch   = el.textContent || "";
          const r    = el.getBoundingClientRect();
          const cx   = r.left + r.width  / 2;
          const cy   = r.top  + r.height / 2;
          const dist = Math.hypot(cx - mouse.current.x, cy - mouse.current.y);

          // wave spring
          let target = 0;
          if (dist < WAVE_R && elapsed < 1.4) {
            const decay = Math.exp(-elapsed * 3.2);
            const prox  = 1 - dist / WAVE_R;
            const phase = dist / 26 - elapsed * 9;
            target = Math.sin(phase) * prox * decay * MAX_DISP;
          }
          curY.current[i] = (curY.current[i] ?? 0) + (target - (curY.current[i] ?? 0)) * 0.28;
          const yOff = curY.current[i];

          const active = ch !== " " && dist < WAVE_R && elapsed < 1.4 && Math.abs(yOff) > 0.5;

          if (active) {
            el.style.opacity   = "0";
            el.style.transform = "";

            // pixel size: MIN_PX near cursor → MAX_PX far
            const ps  = Math.max(MIN_PX, Math.min(MAX_PX, MIN_PX + (dist / WAVE_R) * (MAX_PX - MIN_PX)));
            const psi = Math.round(ps);
            const key = `${ch}|${psi}|${Math.round(r.width)}|${Math.round(r.height)}`;

            let sprite = spriteMap.current.get(key);
            if (!sprite) {
              // render char at 1/psi scale, then drawImage scales it back up → blocky pixel grid
              const sw = Math.max(1, Math.ceil(r.width  / psi));
              const sh = Math.max(1, Math.ceil(r.height / psi));
              sprite = document.createElement("canvas");
              sprite.width  = sw;
              sprite.height = sh;
              const tc = sprite.getContext("2d");
              if (tc && fontStr.current) {
                tc.font         = fontStr.current.replace(/(\d+\.?\d*)px/, (_, s) => `${parseFloat(s) / psi}px`);
                tc.fillStyle    = colorStr.current;
                tc.textBaseline = "middle";
                tc.fillText(ch, 0, sh / 2);
              }
              spriteMap.current.set(key, sprite);
            }

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(sprite, r.left - wr.left, r.top - wr.top + PAD_Y + yOff, r.width, r.height);
          } else {
            el.style.opacity   = "1";
            el.style.transform = Math.abs(yOff) > 0.05 ? `translateY(${yOff.toFixed(2)}px)` : "";
          }
        });
      }
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  // Sync canvas dimensions when text size changes (responsive)
  useEffect(() => {
    const canvas  = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const sync = () => {
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      canvas.width  = w;
      canvas.height = h + PAD_Y * 2;
      canvas.style.position      = "absolute";
      canvas.style.left          = "0";
      canvas.style.top           = `-${PAD_Y}px`;
      canvas.style.width         = `${w}px`;
      canvas.style.height        = `${h + PAD_Y * 2}px`;
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex        = "2";
      spriteMap.current.clear();

      const el = charRefs.current.find(e => e && e.textContent !== " ");
      if (el) {
        const s = window.getComputedStyle(el);
        fontStr.current  = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
        colorStr.current = s.color;
      }
    };

    const ro = new ResizeObserver(sync);
    ro.observe(wrapper);
    sync();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    curY.current = new Array(chars.length).fill(0);
    const onMove = (e: MouseEvent) => {
      mouse.current    = { x: e.clientX, y: e.clientY };
      moveTime.current = Date.now();
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    rafId.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [animate, chars.length]);

  return (
    <span ref={wrapperRef} className={className} style={{ display: "inline-block", position: "relative" }}>
      <canvas ref={canvasRef} />
      {chars.map((char, i) => (
        <span
          key={i}
          ref={el => { charRefs.current[i] = el; }}
          style={{ display: "inline-block", willChange: "transform" }}
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}

/* ── Crosshair cursor (hero + values, fades at transition) ───────── */
function CrosshairCursor() {
  const hRef   = useRef<HTMLDivElement>(null);
  const vRef   = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const txtRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setFade = (lineAlpha: number, boxAlpha: number, txtAlpha: number) => {
      if (hRef.current)   hRef.current.style.opacity   = String(lineAlpha);
      if (vRef.current)   vRef.current.style.opacity   = String(lineAlpha);
      if (boxRef.current) boxRef.current.style.opacity = String(boxAlpha);
      if (txtRef.current) txtRef.current.style.opacity = String(txtAlpha);
    };

    const applyPosition = (x: number, y: number) => {
      const hero  = document.getElementById("hero");
      const vals  = document.getElementById("values-section");
      const hRect = hero?.getBoundingClientRect();
      const vRect = vals?.getBoundingClientRect();

      const inHero   = hRect && x >= hRect.left && x <= hRect.right && y >= hRect.top   && y <= hRect.bottom;
      const inValues = vRect && x >= vRect.left && x <= vRect.right && y >= vRect.top   && y <= vRect.bottom;

      if (!inHero && !inValues) { setFade(0, 0, 0); return; }

      // Gradient fade: full opacity in hero, fades to 0 through the values section
      let fade = 1;
      if (inValues && vRect) {
        fade = Math.max(0, 1 - (y - vRect.top) / vRect.height);
      }

      if (hRef.current)   hRef.current.style.transform   = `translateY(${y}px)`;
      if (vRef.current)   vRef.current.style.transform   = `translateX(${x}px)`;
      if (boxRef.current) boxRef.current.style.transform = `translate(${x - 5}px,${y - 5}px)`;

      if (txtRef.current) {
        const tx = x > window.innerWidth  - 120 ? x - 106 : x + 14;
        const ty = y > window.innerHeight -  50 ? y -  38 : y + 10;
        txtRef.current.style.transform = `translate(${tx}px,${ty}px)`;
        txtRef.current.innerHTML =
          `<div>${String(Math.round(y)).padStart(4, "0")} px</div>` +
          `<div>${String(Math.round(x)).padStart(4, "0")} px</div>`;
      }

      setFade(0.8 * fade, 1.0 * fade, 0.8 * fade);
    };

    // ── Mouse ──────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => applyPosition(e.clientX, e.clientY);

    // ── Touch ──────────────────────────────────────────────────────
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      applyPosition(t.clientX, t.clientY);
    };
    const onTouchEnd = () => setFade(0, 0, 0);

    window.addEventListener("mousemove",  onMouseMove, { passive: true });
    window.addEventListener("touchstart", onTouch,     { passive: true });
    window.addEventListener("touchmove",  onTouch,     { passive: true });
    window.addEventListener("touchend",   onTouchEnd,  { passive: true });

    return () => {
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove",  onTouch);
      window.removeEventListener("touchend",   onTouchEnd);
    };
  }, []);

  const base: React.CSSProperties = {
    position: "fixed", opacity: 0, pointerEvents: "none",
    willChange: "transform", zIndex: 9000,
  };

  return (
    <>
      <div ref={hRef}   style={{ ...base, left: 0, right: 0,  top: 0, height: "1px", backgroundColor: "rgba(255,255,255,0.8)" }} />
      <div ref={vRef}   style={{ ...base, top: 0,  bottom: 0, left: 0, width: "1px",  backgroundColor: "rgba(255,255,255,0.8)" }} />
      <div ref={boxRef} style={{ ...base, top: 0,  left: 0,   width: "10px", height: "10px", border: "1px solid rgba(255,255,255,1.0)" }} />
      <div ref={txtRef} style={{ ...base, top: 0,  left: 0,   fontFamily: "'Montserrat',sans-serif", fontSize: "9px", fontWeight: 300, letterSpacing: "0.12em", color: "rgba(255,255,255,0.8)", lineHeight: "1.7", whiteSpace: "nowrap", textAlign: "left" }} />
    </>
  );
}

/* ── Hero section ────────────────────────────────────────────────── */
export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6"
    >
      <VideoBackground />
      <CrosshairCursor />

      <div className="relative max-w-5xl mx-auto" style={{ zIndex: 20 }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-white/40 text-sm tracking-normal uppercase font-medium mb-6"
        >
          <WaveText text="ORBOTIX INDUSTRIES" />
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="text-5xl sm:text-7xl lg:text-8xl xl:text-[96px] font-medium text-white tracking-tighter leading-none uppercase"
        >
          <WaveText text="Building" />
          <br />
          <WaveText text="tomorrow's" />
          <br />
          <WaveText text="defense," />
          <br />
          <WaveText text="today." />
        </motion.h1>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        style={{ zIndex: 20 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent"
        />
        <span className="text-white/20 text-[9px] tracking-[0.3em] uppercase">Scroll</span>
      </motion.div>
    </section>
  );
}
