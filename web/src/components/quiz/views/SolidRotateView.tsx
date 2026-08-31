"use client";

import type { CSSProperties } from "react";
import type { SolidRotateQuestion } from "@/lib/types";
import type { ViewProps } from "./viewTypes";
import { useDragRotate3D } from "./useDragRotate3D";
import { ACCENT, ACCENT_LIGHT, ACCENT_MID, ACCENT_STRONG } from "@/components/visuals/visualTokens";

type Answer = Extract<import("@/lib/validate").AnswerValue, { kind: "solid-rotate" }>;

const MAX_PX = 170;

function faceStyle(faceW: number, faceH: number, transform: string, fill: string, highlight?: "correct" | "wrong"): CSSProperties {
  return {
    position: "absolute",
    width: faceW,
    height: faceH,
    left: `calc(50% - ${faceW / 2}px)`,
    top: `calc(50% - ${faceH / 2}px)`,
    transform,
    backfaceVisibility: "hidden",
    background: highlight === "correct" ? "#bbf7d0" : highlight === "wrong" ? "#fecaca" : fill,
    border: `2px solid ${highlight === "correct" ? "#16a34a" : highlight === "wrong" ? "#dc2626" : ACCENT}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "#0f172a",
    cursor: "pointer",
  };
}

export function SolidRotateView({ question, answer, onChange, submitted, correct }: ViewProps<SolidRotateQuestion, Answer>) {
  const { rotation, onPointerDown, wasDrag } = useDragRotate3D();
  const maxDim = Math.max(question.length, question.width, question.height);
  const scale = MAX_PX / maxDim;
  const w = question.width * scale;
  const h = question.height * scale;
  const l = question.length * scale;

  const labelFor = (id: string) => question.faces.find((f) => f.id === id)?.label ?? id;

  function highlightFor(id: string): "correct" | "wrong" | undefined {
    if (!submitted) return undefined;
    if (id === question.correctFaceId) return "correct";
    if (id === answer.selectedFaceId && !correct) return "wrong";
    return undefined;
  }

  function selectFace(id: string) {
    if (submitted || wasDrag()) return;
    onChange({ kind: "solid-rotate", selectedFaceId: id });
  }

  const faces: { id: string; style: CSSProperties }[] = [
    { id: "front", style: faceStyle(w, h, `translateZ(${l / 2}px)`, ACCENT_LIGHT, highlightFor("front")) },
    { id: "back", style: faceStyle(w, h, `rotateY(180deg) translateZ(${l / 2}px)`, ACCENT_LIGHT, highlightFor("back")) },
    { id: "right", style: faceStyle(l, h, `rotateY(90deg) translateZ(${w / 2}px)`, ACCENT_MID, highlightFor("right")) },
    { id: "left", style: faceStyle(l, h, `rotateY(-90deg) translateZ(${w / 2}px)`, ACCENT_MID, highlightFor("left")) },
    { id: "top", style: faceStyle(w, l, `rotateX(90deg) translateZ(${h / 2}px)`, ACCENT_STRONG, highlightFor("top")) },
    { id: "bottom", style: faceStyle(w, l, `rotateX(-90deg) translateZ(${h / 2}px)`, ACCENT_STRONG, highlightFor("bottom")) },
  ];

  return (
    <div className="space-y-3">
      <div className="mx-auto w-fit rounded-xl border border-slate-200 bg-white p-8" style={{ perspective: 700 }}>
        <div
          onPointerDown={onPointerDown}
          data-testid="solid-rotate-cube"
          className="relative touch-none cursor-grab select-none active:cursor-grabbing"
          style={{
            width: w,
            height: h,
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotation.rotateX}deg) rotateY(${rotation.rotateY}deg)`,
          }}
        >
          {faces.map((f) => (
            <div key={f.id} style={f.style} onClick={() => selectFace(f.id)}>
              {labelFor(f.id)}
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-sm font-semibold text-slate-500">Drag to rotate the solid, then click the face asked about.</p>
    </div>
  );
}
