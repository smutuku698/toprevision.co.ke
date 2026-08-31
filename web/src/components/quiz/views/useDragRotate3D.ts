"use client";

import { useEffect, useRef, useState } from "react";

const ROTATE_SENSITIVITY = 0.5; // degrees of rotation per pixel of drag
const CLICK_MOVE_THRESHOLD = 6; // px — below this, a drag-release still counts as a tap on whatever's underneath

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Accumulates rotateX/rotateY (degrees) from pointer drag delta, for a
 * CSS 3D `transform-style: preserve-3d` container. A rotate-drag that ends
 * on top of a clickable face would otherwise also fire that face's onClick —
 * `wasDrag()` lets the caller tell a real drag apart from a tap.
 */
export function useDragRotate3D(initial: { rotateX: number; rotateY: number } = { rotateX: -18, rotateY: -28 }) {
  const [rotation, setRotation] = useState(initial);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const totalMoveRef = useRef(0);

  useEffect(() => {
    function handleMove(e: PointerEvent) {
      if (!draggingRef.current || !lastRef.current) return;
      const dx = e.clientX - lastRef.current.x;
      const dy = e.clientY - lastRef.current.y;
      lastRef.current = { x: e.clientX, y: e.clientY };
      totalMoveRef.current += Math.hypot(dx, dy);
      setRotation((r) => ({
        rotateX: clamp(r.rotateX - dy * ROTATE_SENSITIVITY, -80, 80),
        rotateY: r.rotateY + dx * ROTATE_SENSITIVITY,
      }));
    }
    function handleUp() {
      draggingRef.current = false;
      lastRef.current = null;
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    draggingRef.current = true;
    totalMoveRef.current = 0;
    lastRef.current = { x: e.clientX, y: e.clientY };
  }

  function wasDrag() {
    return totalMoveRef.current > CLICK_MOVE_THRESHOLD;
  }

  return { rotation, onPointerDown, wasDrag };
}
