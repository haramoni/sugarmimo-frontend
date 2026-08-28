"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import {
  hasAgeConfirmation,
  subscribeToAgeConfirmation,
} from "./age-confirmation-store";

const INTRO_CLOSE_AT = 2350;
const INTRO_END_AT = 3200;
const INTRO_SESSION_KEY = "sm-intro-after-age-v3";

export function LandingMotion() {
  const [showIntro, setShowIntro] = useState(true);
  const [closing, setClosing] = useState(false);
  const ageConfirmed = useSyncExternalStore(
    subscribeToAgeConfirmation,
    hasAgeConfirmation,
    () => false,
  );

  useEffect(() => {
    if (!ageConfirmed) return;

    const root = document.documentElement;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const alreadySeen =
      window.sessionStorage.getItem(INTRO_SESSION_KEY) === "1";

    if (reducedMotion || alreadySeen) {
      root.classList.add("sm-intro-skip");
      const skipFrame = window.requestAnimationFrame(() =>
        setShowIntro(false),
      );
      return () => {
        window.cancelAnimationFrame(skipFrame);
        root.classList.remove("sm-intro-skip");
      };
    }

    root.classList.remove("sm-intro-skip");
    root.classList.add("sm-intro-active");
    root.classList.add("sm-intro-play");
    document.body.style.overflow = "hidden";

    const closingTimer = window.setTimeout(
      () => setClosing(true),
      INTRO_CLOSE_AT,
    );
    const endTimer = window.setTimeout(() => {
      setShowIntro(false);
      root.classList.remove("sm-intro-active");
      window.sessionStorage.setItem(INTRO_SESSION_KEY, "1");
      document.body.style.overflow = "";
    }, INTRO_END_AT);

    return () => {
      window.clearTimeout(closingTimer);
      window.clearTimeout(endTimer);
      root.classList.remove("sm-intro-active");
      root.classList.remove("sm-intro-play");
      document.body.style.overflow = "";
    };
  }, [ageConfirmed]);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main > section:not(#topo), main > section:not(#topo) article, main > section:not(#topo) figure, main > section:not(#topo) details",
      ),
    );

    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("sm-motion-visible"));
      return;
    }

    targets.forEach((target, index) => {
      target.classList.add("sm-motion-target");
      target.style.setProperty(
        "--sm-reveal-delay",
        `${Math.min(index % 4, 3) * 75}ms`,
      );
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("sm-motion-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -10% 0px" },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  if (!ageConfirmed || !showIntro || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      aria-label="Apresentação SugarMimo"
      role="status"
      className={`sm-intro-overlay ${closing ? "sm-intro-closing" : ""}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 220,
        display: "flex",
        width: "100vw",
        minHeight: "100dvh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        isolation: "isolate",
        background:
          "radial-gradient(circle at 50% 48%, rgba(62, 43, 23, 0.2), transparent 31rem), linear-gradient(145deg, #090806 0%, #050505 52%, #0a0806 100%)",
      }}
    >
      <div aria-hidden className="sm-intro-glow" />
      <div
        className="sm-intro-signature"
        style={{
          position: "relative",
          display: "grid",
          width: "clamp(11rem, 28vw, 18rem)",
          minHeight: "clamp(7rem, 17vw, 11rem)",
          placeItems: "center",
        }}
      >
        <span aria-hidden className="sm-intro-halo" />
        <Image
          src="/brand/monogram-champagne.webp"
          alt="SugarMimo"
          width={284}
          height={173}
          priority
          quality={95}
          className="sm-intro-mark"
          style={{
            position: "relative",
            zIndex: 1,
            display: "block",
            width: "100%",
            height: "auto",
            maxWidth: "18rem",
            objectFit: "contain",
          }}
        />
      </div>
      <div aria-hidden className="sm-intro-line" />
      <p
        className="sm-intro-tagline"
        style={{ maxWidth: "calc(100vw - 2rem)", textAlign: "center" }}
      >
        Um clube privado
      </p>
    </div>,
    document.body,
  );
}
