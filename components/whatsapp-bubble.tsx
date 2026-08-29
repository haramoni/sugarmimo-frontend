"use client";

import { useEffect, useRef, useState } from "react";
import { whatsappUrl } from "@/lib/contact";

type Position = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
  lastPosition: Position;
};

const STORAGE_KEY = "prospects-house-whatsapp-position";
const EDGE_GAP = 10;

function clampPosition(position: Position, width: number, height: number) {
  return {
    x: Math.min(
      Math.max(position.x, EDGE_GAP),
      Math.max(EDGE_GAP, window.innerWidth - width - EDGE_GAP),
    ),
    y: Math.min(
      Math.max(position.y, EDGE_GAP),
      Math.max(EDGE_GAP, window.innerHeight - height - EDGE_GAP),
    ),
  };
}

export default function WhatsappBubble() {
  const bubbleRef = useRef<HTMLAnchorElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const ignoreNextClickRef = useRef(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const bubbleElement = bubbleRef.current;
    if (!bubbleElement) return;

    function restorePosition() {
      const savedPosition = window.localStorage.getItem(STORAGE_KEY);
      if (!savedPosition) return;

      try {
        const parsed = JSON.parse(savedPosition) as Position;
        if (!Number.isFinite(parsed.x) || !Number.isFinite(parsed.y)) return;

        const rect = bubbleElement!.getBoundingClientRect();
        setPosition(clampPosition(parsed, rect.width, rect.height));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    function keepInsideViewport() {
      setPosition((current) => {
        if (!current) return null;
        const rect = bubbleElement!.getBoundingClientRect();
        const next = clampPosition(current, rect.width, rect.height);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }

    restorePosition();
    window.addEventListener("resize", keepInsideViewport);
    return () => window.removeEventListener("resize", keepInsideViewport);
  }, []);

  function handlePointerDown(event: React.PointerEvent<HTMLAnchorElement>) {
    if (!event.isPrimary || event.button !== 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const initialPosition = { x: rect.left, y: rect.top };

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
      moved: false,
      lastPosition: initialPosition,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLAnchorElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if (!drag.moved && Math.hypot(deltaX, deltaY) < 5) return;

    drag.moved = true;
    setIsDragging(true);

    const rect = event.currentTarget.getBoundingClientRect();
    const nextPosition = clampPosition(
      { x: drag.originX + deltaX, y: drag.originY + deltaY },
      rect.width,
      rect.height,
    );

    drag.lastPosition = nextPosition;
    setPosition(nextPosition);
  }

  function finishDrag(event: React.PointerEvent<HTMLAnchorElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (drag.moved) {
      ignoreNextClickRef.current = true;
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(drag.lastPosition),
      );
    }

    dragRef.current = null;
    setIsDragging(false);
  }

  return (
    <a
      ref={bubbleRef}
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Conversar com a SugarMimo pelo WhatsApp"
      title="Arraste para mover ou clique para abrir o WhatsApp"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onDragStart={(event) => event.preventDefault()}
      onClick={(event) => {
        if (!ignoreNextClickRef.current) return;
        event.preventDefault();
        ignoreNextClickRef.current = false;
      }}
      style={
        position
          ? { left: position.x, top: position.y }
          : { right: 20, bottom: 20 }
      }
      className={`group fixed z-[60] flex h-16 w-16 touch-none select-none items-center justify-center rounded-full border border-white/30 bg-[#25D366] text-white shadow-[0_14px_40px_rgb(37_211_102/0.38)] transition-[background-color,box-shadow,transform] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#25D366] sm:h-17 sm:w-17 ${
        isDragging
          ? "cursor-grabbing scale-105 shadow-[0_20px_48px_rgb(37_211_102/0.48)]"
          : "cursor-pointer hover:-translate-y-1 hover:bg-[#1ebe5d] hover:shadow-[0_18px_46px_rgb(37_211_102/0.5)]"
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-8 w-8 fill-current transition-transform group-hover:scale-110 sm:h-9 sm:w-9"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.148-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.438-9.887 9.892-9.887a9.82 9.82 0 0 1 7.021 2.91 9.82 9.82 0 0 1 2.896 7.027c-.003 5.45-4.439 9.888-9.926 9.888m8.413-18.297A11.82 11.82 0 0 0 12.057 0C5.495 0 .16 5.335.157 11.893c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.689 1.448h.005c6.56 0 11.894-5.336 11.897-11.893a11.82 11.82 0 0 0-3.489-8.413Z" />
      </svg>
    </a>
  );
}
