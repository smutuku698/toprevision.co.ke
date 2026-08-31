"use client";

import { useRef } from "react";
import type { ProtractorQuestion } from "@/lib/types";
import type { ViewProps } from "./viewTypes";
import { useSvgDragAngle } from "./useSvgDragAngle";
import { ACCENT, ACCENT_LIGHT, GRID, INK } from "@/components/visuals/visualTokens";

type Answer = Extract<import("@/lib/validate").AnswerValue, { kind: "protractor" }>;

const W = 260;
const H = 190;
const CX = 130;
const CY = 165;
const R = 120;
const NEEDLE_R = 100;

function toPoint(deg: number, radius: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY - radius * Math.sin(rad) };
}

export function ProtractorView({ question, answer, onChange, submitted }: ViewProps<ProtractorQuestion, Answer>) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { onPointerDown } = useSvgDragAngle({
    svgRef,
    center: { x: CX, y: CY },
    disabled: submitted,
    onChange: (angleDeg) => onChange({ kind: "protractor", angleDeg, touched: true }),
  });

  const ticks: React.ReactNode[] = [];
  for (let deg = 0; deg <= 180; deg += 10) {
    const isMajor = deg % 30 === 0;
    const outer = toPoint(deg, R);
    const inner = toPoint(deg, R - (isMajor ? 14 : 8));
    ticks.push(
      <line key={`t${deg}`} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke={INK} strokeWidth={isMajor ? 2 : 1} />
    );
    if (isMajor) {
      const labelPt = toPoint(deg, R - 28);
      ticks.push(
        <text key={`l${deg}`} x={labelPt.x} y={labelPt.y} textAnchor="middle" fontSize={10} fill={INK}>
          {deg}
        </text>
      );
    }
  }

  const needleTip = toPoint(answer.angleDeg, NEEDLE_R);
  const baseline = toPoint(0, R);
  const rayB = question.mode === "measure" && question.rayBAngleDeg !== undefined ? toPoint(question.rayBAngleDeg, R) : null;

  return (
    <div className="space-y-3">
      <div className="mx-auto w-fit rounded-xl border border-slate-200 bg-white p-3">
        <svg ref={svgRef} data-testid="protractor-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="touch-none select-none">
          <path d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY} Z`} fill={ACCENT_LIGHT} stroke={GRID} strokeWidth={1.5} />
          {ticks}
          <line x1={CX} y1={CY} x2={baseline.x} y2={baseline.y} stroke={INK} strokeWidth={2.5} />
          {rayB && <line x1={CX} y1={CY} x2={rayB.x} y2={rayB.y} stroke="#dc2626" strokeWidth={2.5} />}
          <line x1={CX} y1={CY} x2={needleTip.x} y2={needleTip.y} stroke={ACCENT} strokeWidth={3} />
          <circle
            cx={needleTip.x}
            cy={needleTip.y}
            r={9}
            fill={submitted ? "#94a3b8" : ACCENT}
            stroke="white"
            strokeWidth={2}
            className={submitted ? "" : "cursor-grab active:cursor-grabbing"}
            onPointerDown={submitted ? undefined : onPointerDown}
          />
          <circle cx={CX} cy={CY} r={4} fill={INK} />
        </svg>
      </div>
      <p className="text-center text-sm font-bold text-slate-600">
        {question.mode === "measure" ? "Drag the blue needle to line up with the red ray, then read the angle: " : "Drag the needle to the target angle: "}
        <span className="text-sky-600">{Math.round(answer.angleDeg)}°</span>
      </p>
    </div>
  );
}
