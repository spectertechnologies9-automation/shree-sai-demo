"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { BASE } from "@/lib/base";

export type SeqHandle = {
  /** 0..1 position in the sequence */
  set: (progress: number) => void;
};

type Props = {
  name: string;
  count: number;
  className?: string;
  /** Start loading immediately instead of waiting to approach the viewport */
  eager?: boolean;
  /** Called as frames arrive, for the opening loader */
  onProgress?: (loaded: number, total: number) => void;
  alt: string;
};

const pad = (n: number) => String(n).padStart(3, "0");

/**
 * Scroll-scrubbed image sequence cut from the showroom film.
 * Frames load coarse-to-fine (every 8th, 4th, 2nd, then all) so the scene is
 * scrubbable almost at once and sharpens as the rest arrive. Nothing loads
 * until the scene is within two viewports.
 */
const SeqCanvas = forwardRef<SeqHandle, Props>(function SeqCanvas(
  { name, count, className, eager, onProgress, alt },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frames = useRef<(HTMLImageElement | null)[]>([]);
  const ready = useRef<boolean[]>([]);
  const index = useRef(0);
  const drawn = useRef(-1);
  const raf = useRef(0);
  const progressCb = useRef(onProgress);
  progressCb.current = onProgress;

  const draw = () => {
    raf.current = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    // nearest frame that has actually arrived
    let i = index.current;
    if (!ready.current[i]) {
      let found = -1;
      for (let d = 1; d < count; d++) {
        if (ready.current[i - d]) { found = i - d; break; }
        if (ready.current[i + d]) { found = i + d; break; }
      }
      if (found < 0) return;
      i = found;
    }
    if (i === drawn.current && canvas.dataset.dirty !== "1") return;
    const img = frames.current[i];
    const ctx = canvas.getContext("2d");
    if (!img || !ctx) return;
    const cw = canvas.width, ch = canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    drawn.current = i;
    canvas.dataset.dirty = "0";
  };

  const request = () => {
    if (!raf.current) raf.current = requestAnimationFrame(draw);
  };

  useImperativeHandle(ref, () => ({
    set(p: number) {
      const i = Math.max(0, Math.min(count - 1, Math.round(p * (count - 1))));
      if (i !== index.current) {
        index.current = i;
        request();
      }
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const compact = window.matchMedia("(max-width: 820px)").matches;
    const variant = compact ? "m" : "d";
    let cancelled = false;
    let started = false;
    let loaded = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 1.25);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w && h && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
        canvas.dataset.dirty = "1";
        request();
      }
    };

    const load = (i: number) => {
      if (frames.current[i]) return;
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (cancelled) return;
        ready.current[i] = true;
        loaded++;
        progressCb.current?.(loaded, count);
        canvas.dataset.dirty = "1";
        request();
      };
      img.onerror = () => {
        loaded++;
        progressCb.current?.(loaded, count);
      };
      img.src = `${BASE}/seq/${name}/${variant}/${pad(i)}.webp`;
      frames.current[i] = img;
    };

    const start = () => {
      if (started) return;
      started = true;
      load(0);
      // The first frame is enough to paint. The rest wait for the page's own
      // load event so they never hold up first render on a slow connection.
      const rest = () => {
        if (cancelled) return;
        for (const step of [8, 4, 2, 1]) {
          for (let i = 0; i < count; i += step) load(i);
        }
        load(count - 1);
      };
      if (document.readyState === "complete") rest();
      else window.addEventListener("load", rest, { once: true });
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let io: IntersectionObserver | null = null;
    if (eager) start();
    else {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            start();
            io?.disconnect();
          }
        },
        { rootMargin: "200% 0px" },
      );
      io.observe(canvas);
    }

    return () => {
      cancelled = true;
      ro.disconnect();
      io?.disconnect();
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = 0;
      frames.current.forEach((img) => {
        if (img) img.onload = img.onerror = null;
      });
      frames.current = [];
      ready.current = [];
      drawn.current = -1;
    };
  }, [name, count, eager]);

  return <canvas ref={canvasRef} className={className} role="img" aria-label={alt} />;
});

export default SeqCanvas;
