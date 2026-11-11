"use client";

import { useEffect, useRef, useState } from "react";
import { scenes } from "@/lib/site";
import { gsap, ScrollTrigger, scrollToTarget } from "@/lib/motion";

/** Journey indicator: a gold thread that fills with the page, with a stop for every scene. */
export default function ProgressRail() {
  const fill = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const setY = fill.current ? gsap.quickSetter(fill.current, "scaleY") : null;
    const setX = bar.current ? gsap.quickSetter(bar.current, "scaleX") : null;
    const page = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        setY?.(self.progress);
        setX?.(self.progress);
      },
    });
    const stops = scenes.map((s, i) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => self.isActive && setActive(i),
      }),
    );
    return () => {
      page.kill();
      stops.forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      {/* phones: a hairline across the top */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] lg:hidden">
        <div ref={bar} className="h-full origin-left scale-x-0 bg-gradient-to-r from-gold-dark via-gold-light to-gold" />
      </div>

      <nav aria-label="Scenes" className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 mix-blend-difference lg:block">
        <div className="absolute bottom-2 right-[5px] top-2 w-px bg-white/25">
          <div ref={fill} className="h-full w-full origin-top scale-y-0 bg-white" />
        </div>
        <ol className="relative flex flex-col gap-7">
          {scenes.map((s, i) => (
            <li key={s.id} className="group flex items-center justify-end gap-3">
              <span
                className={`label pointer-events-none whitespace-nowrap text-white transition-[opacity,transform] duration-500 ease-palace group-hover:translate-x-0 group-hover:opacity-100 ${
                  active === i ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
                }`}
              >
                {s.label}
              </span>
              <a
                href={`#${s.id}`}
                aria-label={`Go to ${s.label}`}
                aria-current={active === i ? "step" : undefined}
                data-cursor="link"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget(`#${s.id}`);
                }}
                className="grid h-[11px] w-[11px] place-items-center"
              >
                <span className={`block rounded-full bg-white transition-all duration-500 ${active === i ? "h-[9px] w-[9px]" : "h-[5px] w-[5px] opacity-70"}`} />
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
