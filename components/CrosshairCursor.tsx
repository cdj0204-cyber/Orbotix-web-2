"use client";

import { useEffect, useRef } from "react";

export default function CrosshairCursor() {
  const hRef   = useRef<HTMLDivElement>(null);
  const vRef   = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const txtRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      if (hRef.current)   hRef.current.style.transform   = `translateY(${y}px)`;
      if (vRef.current)   vRef.current.style.transform   = `translateX(${x}px)`;
      if (boxRef.current) boxRef.current.style.transform = `translate(${x - 5}px,${y - 5}px)`;

      if (txtRef.current) {
        const flipX = x > window.innerWidth  - 120;
        const flipY = y > window.innerHeight -  50;
        const tx = flipX ? x - 106 : x + 14;
        const ty = flipY ? y -  38 : y + 10;
        txtRef.current.style.transform = `translate(${tx}px,${ty}px)`;
        txtRef.current.innerHTML =
          `<div>${String(Math.round(y)).padStart(4, "0")} px</div>` +
          `<div>${String(Math.round(x)).padStart(4, "0")} px</div>`;
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const base: React.CSSProperties = {
    position: "fixed",
    pointerEvents: "none",
    willChange: "transform",
    zIndex: 9998,
  };

  return (
    <>
      {/* horizontal line */}
      <div ref={hRef} style={{
        ...base,
        left: 0, right: 0, top: 0,
        height: "1px",
        backgroundColor: "rgba(255,255,255,0.35)",
      }} />
      {/* vertical line */}
      <div ref={vRef} style={{
        ...base,
        top: 0, bottom: 0, left: 0,
        width: "1px",
        backgroundColor: "rgba(255,255,255,0.35)",
      }} />
      {/* intersection square */}
      <div ref={boxRef} style={{
        ...base,
        top: 0, left: 0,
        width: "10px", height: "10px",
        border: "1px solid rgba(255,255,255,0.7)",
      }} />
      {/* coordinates */}
      <div ref={txtRef} style={{
        ...base,
        top: 0, left: 0,
        fontFamily: "'Montserrat', sans-serif",
        fontSize: "9px",
        fontWeight: 300,
        letterSpacing: "0.12em",
        color: "rgba(255,255,255,0.5)",
        lineHeight: "1.7",
        whiteSpace: "nowrap",
      }} />
    </>
  );
}
