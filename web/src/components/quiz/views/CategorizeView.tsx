"use client";

import { useState } from "react";
import type { CategorizeQuestion } from "@/lib/types";
import type { ViewProps } from "./viewTypes";
import { usePointerDrag } from "./usePointerDrag";
import { DragGhost } from "./DragGhost";

type Answer = Extract<import("@/lib/validate").AnswerValue, { kind: "categorize" }>;

// Same dual-interaction pattern as ClickMatchView: tap-to-select-then-assign
// always works, custom pointer-drag is layered on top. Placed chips can be
// tapped (or re-dragged to another bucket) to fix a misclick before Submit.
export function CategorizeView({ question, answer, onChange, submitted }: ViewProps<CategorizeQuestion, Answer>) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const unplaced = question.items.filter((it) => !answer.map[it.id]);

  function assign(itemId: string, bucketId: string) {
    onChange({ kind: "categorize", map: { ...answer.map, [itemId]: bucketId } });
    setSelectedItem(null);
  }

  function unplace(itemId: string) {
    const next = { ...answer.map };
    delete next[itemId];
    onChange({ kind: "categorize", map: next });
  }

  const { drag, onPointerDown } = usePointerDrag({
    disabled: submitted,
    onTap: (itemId) => {
      if (answer.map[itemId]) {
        unplace(itemId); // tapping a placed chip sends it back to the tray
      } else {
        setSelectedItem((cur) => (cur === itemId ? null : itemId));
      }
    },
    onDrop: (itemId, bucketId) => assign(itemId, bucketId),
  });

  function handleBucketClick(bucketId: string) {
    if (submitted || !selectedItem) return;
    assign(selectedItem, bucketId);
  }

  return (
    <div className="space-y-6">
      <div className="min-h-[3rem] flex flex-wrap gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
        {unplaced.length === 0 && <span className="text-sm text-slate-400">All items sorted — press Submit.</span>}
        {unplaced.map((it) => {
          const isDragging = drag?.id === it.id;
          return (
            <button
              key={it.id}
              type="button"
              disabled={submitted}
              onPointerDown={(e) => onPointerDown(it.id, it.label, e)}
              className={`touch-none cursor-grab select-none rounded-lg px-3 py-1.5 text-sm font-bold shadow-sm transition-all active:cursor-grabbing ${
                isDragging
                  ? "opacity-30"
                  : selectedItem === it.id
                  ? "bg-violet-600 text-white ring-4 ring-violet-200"
                  : "bg-violet-500 text-white hover:bg-violet-600"
              }`}
            >
              {it.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {question.buckets.map((bucket) => {
          const placed = question.items.filter((it) => answer.map[it.id] === bucket.id);
          const isDragOver = drag?.overZoneId === bucket.id;
          return (
            <div
              key={bucket.id}
              data-drop-zone={bucket.id}
              onClick={() => handleBucketClick(bucket.id)}
              className={`min-h-[7rem] rounded-xl border-2 p-3 text-left transition-colors ${
                isDragOver ? "border-violet-500 bg-violet-50" : "border-slate-200 bg-white hover:border-violet-300"
              }`}
            >
              <div className="mb-2 text-sm font-bold text-slate-600">{bucket.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {placed.map((it) => {
                  const correct = submitted && question.correctBucket[it.id] === bucket.id;
                  const wrong = submitted && question.correctBucket[it.id] !== bucket.id;
                  const isDragging = drag?.id === it.id;
                  return (
                    <button
                      key={it.id}
                      type="button"
                      disabled={submitted}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        onPointerDown(it.id, it.label, e);
                      }}
                      className={`touch-none cursor-grab select-none rounded-md px-2 py-1 text-xs font-semibold transition-all active:cursor-grabbing ${
                        isDragging
                          ? "opacity-30"
                          : correct
                          ? "bg-emerald-100 text-emerald-800"
                          : wrong
                          ? "bg-rose-100 text-rose-800"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {it.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <DragGhost drag={drag} color="bg-violet-600" />
    </div>
  );
}
