"use client";

import { useEffect, useId, useRef, useState } from "react";

type Props = {
  x: number; // percent
  y: number; // percent
  title: string;
  body: string;
  kicker?: string;
  className?: string;
  /** Hidden hotspots close themselves and leave the tab order */
  active?: boolean;
};

/**
 * A point of interest over real footage. Opens a small note beside itself —
 * never a modal — and closes on outside press, Escape, or when its shot ends.
 */
export default function Hotspot({ x, y, title, body, kicker, className = "", active = true }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!active) setOpen(false);
  }, [active]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const right = x > 55;
  const low = y > 60;

  return (
    <div
      ref={root}
      className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 ${className}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <button
        type="button"
        className="hotspot-dot"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`${open ? "Close" : "Open"} note: ${title}`}
        tabIndex={active ? 0 : -1}
        data-cursor="open"
        onClick={() => setOpen((v) => !v)}
      />
      <div
        id={id}
        role="note"
        aria-hidden={!open}
        className={`absolute w-[min(17rem,72vw)] border border-gold/40 bg-ink/80 p-5 backdrop-blur-md transition-[opacity,transform,clip-path] duration-500 ease-palace
          ${right ? "right-full mr-2 max-md:right-auto max-md:left-1/2 max-md:mr-0 max-md:-translate-x-1/2" : "left-full ml-2 max-md:left-1/2 max-md:ml-0 max-md:-translate-x-1/2"}
          ${low ? "bottom-1/2 max-md:bottom-full max-md:mb-1" : "top-1/2 max-md:top-full max-md:mt-1"}
          ${open ? "opacity-100 [clip-path:inset(0)]" : "pointer-events-none opacity-0 [clip-path:inset(0_0_100%_0)]"}`}
      >
        {kicker ? <p className="label mb-2 text-gold">{kicker}</p> : null}
        <p className="font-serif text-xl leading-tight text-ivory">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-ivory/75">{body}</p>
      </div>
    </div>
  );
}
