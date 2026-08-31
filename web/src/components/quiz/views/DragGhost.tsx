import type { DragState } from "./usePointerDrag";
import { MathText } from "@/components/math/MathText";

export function DragGhost({ drag, color }: { drag: DragState | null; color: string }) {
  if (!drag) return null;
  return (
    <div
      className={`pointer-events-none fixed z-50 -translate-x-0 -translate-y-0 rounded-lg px-4 py-2 text-sm font-bold text-white shadow-xl ${color}`}
      style={{ left: drag.x - drag.offsetX, top: drag.y - drag.offsetY }}
    >
      <MathText text={drag.label} />
    </div>
  );
}
