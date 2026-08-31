"use client";

import { useState } from "react";
import type { ClickMatchQuestion } from "@/lib/types";
import type { ViewProps } from "./viewTypes";
import { usePointerDrag } from "./usePointerDrag";
import { DragGhost } from "./DragGhost";
import { MathText } from "@/components/math/MathText";

type Answer = Extract<import("@/lib/validate").AnswerValue, { kind: "click-match" }>;

// Supports two equivalent ways to answer: tap a token then tap a target
// (works everywhere, including touch), or press-and-drag a token onto a
// target (custom pointer-events drag — see usePointerDrag for why this isn't
// native HTML5 drag-and-drop).
export function ClickMatchView({ question, answer, onChange, submitted }: ViewProps<ClickMatchQuestion, Answer>) {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const placedTokenIds = new Set(Object.values(answer.map));

  function assign(tokenId: string, targetId: string) {
    onChange({ kind: "click-match", map: { ...answer.map, [targetId]: tokenId } });
    setSelectedToken(null);
  }

  const { drag, onPointerDown } = usePointerDrag({
    disabled: submitted,
    onTap: (tokenId) => setSelectedToken((cur) => (cur === tokenId ? null : tokenId)),
    onDrop: (tokenId, targetId) => assign(tokenId, targetId),
  });

  function handleTargetClick(targetId: string) {
    if (submitted) return;
    const existing = answer.map[targetId];
    if (existing) {
      // tapping a filled target clears it
      const next = { ...answer.map };
      delete next[targetId];
      onChange({ kind: "click-match", map: next });
      return;
    }
    if (!selectedToken) return;
    assign(selectedToken, targetId);
  }

  return (
    <div className="space-y-6">
      <div className="flex min-h-[2.75rem] flex-wrap gap-3">
        {question.tokens.map((t) => {
          if (placedTokenIds.has(t.id)) return null;
          const active = selectedToken === t.id;
          const isDragging = drag?.id === t.id;
          return (
            <button
              key={t.id}
              type="button"
              disabled={submitted}
              onPointerDown={(e) => onPointerDown(t.id, t.label, e)}
              className={`touch-none cursor-grab select-none rounded-lg px-4 py-2 text-sm font-bold shadow-sm transition-all active:cursor-grabbing ${
                isDragging
                  ? "opacity-30"
                  : active
                  ? "bg-sky-600 text-white ring-4 ring-sky-200"
                  : "bg-sky-500 text-white hover:bg-sky-600"
              }`}
            >
              <MathText text={t.label} />
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {question.targets.map((target) => {
          const placedTokenId = answer.map[target.id];
          const placedToken = question.tokens.find((t) => t.id === placedTokenId);
          const isCorrect = submitted && placedTokenId === question.correctMap[target.id];
          const isWrong = submitted && placedTokenId !== question.correctMap[target.id];
          const isDragOver = drag?.overZoneId === target.id;

          return (
            <div key={target.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <div className="mb-2 text-sm font-semibold text-slate-500">
                <MathText text={target.label} />
              </div>
              <button
                type="button"
                data-drop-zone={target.id}
                onClick={() => handleTargetClick(target.id)}
                disabled={submitted}
                className={`h-11 w-full rounded-lg border-2 border-dashed text-sm font-bold transition-colors ${
                  isCorrect
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : isWrong
                    ? "border-rose-500 bg-rose-50 text-rose-800"
                    : isDragOver
                    ? "border-sky-500 bg-sky-100 text-sky-500 scale-[1.02]"
                    : placedToken
                    ? "border-sky-400 bg-white text-sky-700"
                    : "border-slate-300 bg-white text-slate-300"
                }`}
              >
                {placedToken ? <MathText text={placedToken.label} /> : "drop here"}
              </button>
            </div>
          );
        })}
      </div>

      <DragGhost drag={drag} color="bg-sky-600" />
    </div>
  );
}
