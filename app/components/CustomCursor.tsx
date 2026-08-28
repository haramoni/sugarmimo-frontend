"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, textarea, select, label, [data-cursor]";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!cursor || !finePointer.matches || reducedMotion.matches) return;

    const root = document.documentElement;
    const target = { x: -100, y: -100 };
    const current = { x: -100, y: -100 };
    let hovering = false;
    let positioned = false;
    let previousTime = performance.now();
    let frameId = 0;

    root.classList.add("custom-cursor-active");

    const render = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000, 0.04);
      const springProgress = 1 - Math.exp(-24 * delta);

      previousTime = time;
      current.x += (target.x - current.x) * springProgress;
      current.y += (target.y - current.y) * springProgress;
      cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      frameId = window.requestAnimationFrame(render);
    };

    const handleMouseMove = (event: MouseEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;

      if (!positioned) {
        current.x = event.clientX;
        current.y = event.clientY;
        positioned = true;
      }

      cursor.classList.add("is-visible");

      const interactive =
        event.target instanceof Element &&
        Boolean(event.target.closest(INTERACTIVE_SELECTOR));

      if (interactive !== hovering) {
        hovering = interactive;
        cursor.classList.toggle("is-hovering", interactive);
      }
    };

    const hideCursor = () => cursor.classList.remove("is-visible");

    frameId = window.requestAnimationFrame(render);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("blur", hideCursor);
    root.addEventListener("mouseleave", hideCursor);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("blur", hideCursor);
      root.removeEventListener("mouseleave", hideCursor);
      root.classList.remove("custom-cursor-active");
    };
  }, []);

  return (
    <div ref={cursorRef} aria-hidden className="sm-custom-cursor z-10">
      <Image
        src="/brand/heart.webp"
        alt=""
        width={10}
        height={6}
        draggable={false}
        className="sm-custom-cursor-heart"
      />
      <span className="sm-custom-cursor-ring" />
    </div>
  );
}
