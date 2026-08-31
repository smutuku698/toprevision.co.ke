"use client";

import { useEffect, useRef } from "react";

/**
 * Converts pointer drag into an angle (degrees) measured counterclockwise
 * from the positive x-axis around `center`, in the SVG's own viewBox
 * coordinate space (not screen pixels) — mirrors usePointerDrag.ts's
 * window-level pointermove/pointerup attachment so dragging still tracks
 * correctly even if the pointer strays outside the SVG mid-drag.
 */
export function useSvgDragAngle(opts: {
  svgRef: React.RefObject<SVGSVGElement | null>;
  center: { x: number; y: number };
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (angleDeg: number) => void;
}) {
  const { svgRef, disabled } = opts;
  // Mirrored in a ref instead of a useEffect dependency: every onChange call
  // re-renders the parent (new answer state), which would otherwise recreate
  // this closure and force the window listener below to tear down and
  // reattach mid-drag — fast-fired pointermove events (rapid real dragging,
  // or synthetic test input) can then land in the gap and get dropped.
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const draggingRef = useRef(false);

  function clientToSvgPoint(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const viewBox = svg.viewBox.baseVal;
    return {
      x: viewBox.x + ((clientX - rect.left) / rect.width) * viewBox.width,
      y: viewBox.y + ((clientY - rect.top) / rect.height) * viewBox.height,
    };
  }

  function angleFromPoint(px: number, py: number) {
    const { center, min = 0, max = 180 } = optsRef.current;
    const dx = px - center.x;
    const dy = center.y - py; // SVG y grows downward — flip so the angle grows counterclockwise, like a real protractor
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    return Math.max(min, Math.min(max, deg));
  }

  useEffect(() => {
    function handleMove(e: PointerEvent) {
      if (!draggingRef.current) return;
      const p = clientToSvgPoint(e.clientX, e.clientY);
      if (p) optsRef.current.onChange(angleFromPoint(p.x, p.y));
    }
    function handleUp() {
      draggingRef.current = false;
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    if (disabled) return;
    draggingRef.current = true;
    const p = clientToSvgPoint(e.clientX, e.clientY);
    if (p) optsRef.current.onChange(angleFromPoint(p.x, p.y));
  }

  return { onPointerDown };
}
