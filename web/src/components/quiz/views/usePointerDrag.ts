"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export interface DragState {
  id: string;
  label: string;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  overZoneId: string | null;
}

const MOVE_THRESHOLD = 6; // px before a press counts as a drag rather than a tap

/**
 * Custom pointer-events drag, used instead of native HTML5 drag-and-drop:
 * native `draggable` doesn't fire on touchscreens at all (a real problem for
 * students on tablets) and its drop-completion behavior is unreliable to
 * verify. Pointer events unify mouse/touch/pen, let us render our own
 * floating drag preview, and give full manual control over both the "tap to
 * select" and "drag to place" gestures through one source of truth.
 */
export function usePointerDrag(opts: {
  onDrop: (draggedId: string, dropZoneId: string) => void;
  onTap: (id: string) => void;
  disabled: boolean;
}) {
  const { onDrop, onTap, disabled } = opts;
  const [drag, setDrag] = useState<DragState | null>(null);
  const pendingRef = useRef<{ id: string; label: string; startX: number; startY: number; offsetX: number; offsetY: number } | null>(
    null
  );
  const dragRef = useRef<DragState | null>(null);
  useLayoutEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  useEffect(() => {
    function zoneUnder(x: number, y: number): string | null {
      const el = document.elementFromPoint(x, y);
      return el?.closest<HTMLElement>("[data-drop-zone]")?.dataset.dropZone ?? null;
    }
    function handleMove(e: PointerEvent) {
      const pending = pendingRef.current;
      if (dragRef.current) {
        setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY, overZoneId: zoneUnder(e.clientX, e.clientY) } : d));
        return;
      }
      if (!pending) return;
      const dist = Math.hypot(e.clientX - pending.startX, e.clientY - pending.startY);
      if (dist > MOVE_THRESHOLD) {
        setDrag({
          id: pending.id,
          label: pending.label,
          x: e.clientX,
          y: e.clientY,
          offsetX: pending.offsetX,
          offsetY: pending.offsetY,
          overZoneId: zoneUnder(e.clientX, e.clientY),
        });
      }
    }
    function handleUp(e: PointerEvent) {
      const pending = pendingRef.current;
      const current = dragRef.current;
      pendingRef.current = null;
      if (current) {
        const zoneId = zoneUnder(e.clientX, e.clientY) ?? current.overZoneId;
        if (zoneId) onDrop(current.id, zoneId);
        setDrag(null);
      } else if (pending) {
        onTap(pending.id);
      }
    }
    function handleCancel() {
      pendingRef.current = null;
      setDrag(null);
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleCancel);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleCancel);
    };
  }, [onDrop, onTap]);

  function onPointerDown(id: string, label: string, e: React.PointerEvent<HTMLElement>) {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pendingRef.current = {
      id,
      label,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
  }

  return { drag, onPointerDown };
}
