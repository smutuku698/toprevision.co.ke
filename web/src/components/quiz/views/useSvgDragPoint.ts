"use client";

import { useEffect, useRef } from "react";

/**
 * Converts pointer drag into a caller-defined data point, by first mapping
 * screen coordinates into the SVG's own viewBox space (matches
 * useSvgDragAngle.ts's approach) and then handing off to `toData` — the
 * caller owns the actual coordinate-plane math (scale, snapping, clamping)
 * since that varies per widget.
 */
export function useSvgDragPoint(opts: {
  svgRef: React.RefObject<SVGSVGElement | null>;
  toData: (svgX: number, svgY: number) => { x: number; y: number };
  disabled?: boolean;
  onChange: (point: { x: number; y: number }) => void;
}) {
  const { svgRef, disabled } = opts;
  // See useSvgDragAngle.ts for why this is a ref rather than a useEffect
  // dependency — avoids the window listener churning (and dropping events)
  // on every onChange-triggered re-render.
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

  useEffect(() => {
    function handleMove(e: PointerEvent) {
      if (!draggingRef.current) return;
      const p = clientToSvgPoint(e.clientX, e.clientY);
      if (p) optsRef.current.onChange(optsRef.current.toData(p.x, p.y));
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
    if (p) optsRef.current.onChange(optsRef.current.toData(p.x, p.y));
  }

  return { onPointerDown };
}
