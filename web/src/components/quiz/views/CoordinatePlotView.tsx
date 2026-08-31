"use client";

import { useRef } from "react";
import type { CoordinatePlotQuestion } from "@/lib/types";
import type { ViewProps } from "./viewTypes";
import { useSvgDragPoint } from "./useSvgDragPoint";
import { ACCENT, GRID, INK } from "@/components/visuals/visualTokens";

type Answer = Extract<import("@/lib/validate").AnswerValue, { kind: "coordinate-plot" }>;

const W = 260;
const H = 260;
const PAD = 20;

export function CoordinatePlotView({ question, answer, onChange, submitted }: ViewProps<CoordinatePlotQuestion, Answer>) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { range } = question;
  const scale = (W - PAD * 2) / (range * 2);
  const cx = W / 2;
  const cy = H / 2;
  const toX = (x: number) => cx + x * scale;
  const toY = (y: number) => cy - y * scale;
  const clampRange = (v: number) => Math.max(-range, Math.min(range, v));

  const { onPointerDown } = useSvgDragPoint({
    svgRef,
    disabled: submitted,
    toData: (svgX, svgY) => ({
      x: clampRange(Math.round((svgX - cx) / scale)),
      y: clampRange(Math.round((cy - svgY) / scale)),
    }),
    onChange: (point) => onChange({ kind: "coordinate-plot", point }),
  });

  const gridLines: React.ReactNode[] = [];
  for (let i = -range; i <= range; i++) {
    const isAxis = i === 0;
    gridLines.push(
      <line key={`v${i}`} x1={toX(i)} y1={PAD} x2={toX(i)} y2={H - PAD} stroke={GRID} strokeWidth={isAxis ? 0 : 0.75} />,
      <line key={`h${i}`} x1={PAD} y1={toY(i)} x2={W - PAD} y2={toY(i)} stroke={GRID} strokeWidth={isAxis ? 0 : 0.75} />
    );
  }

  const point = answer.point;

  return (
    <div className="space-y-3">
      <div className="mx-auto w-fit rounded-xl border border-slate-200 bg-white p-3">
        <svg ref={svgRef} data-testid="coordinate-plot-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="touch-none select-none">
          {gridLines}
          <line x1={PAD} y1={cy} x2={W - PAD} y2={cy} stroke={INK} strokeWidth={1.5} />
          <line x1={cx} y1={PAD} x2={cx} y2={H - PAD} stroke={INK} strokeWidth={1.5} />
          {question.contextPoints?.map((p) => (
            <g key={p.label}>
              <circle cx={toX(p.x)} cy={toY(p.y)} r={4} fill="#94a3b8" />
              <text x={toX(p.x) + 6} y={toY(p.y) - 6} fontSize={10} fill={INK}>
                {p.label}
              </text>
            </g>
          ))}
          {/* Invisible full-grid hit target so the very first tap (before a point
              exists) places one anywhere, not just at its exact future pixel. */}
          <rect
            x={PAD}
            y={PAD}
            width={W - PAD * 2}
            height={H - PAD * 2}
            fill="transparent"
            className={submitted ? "" : "cursor-crosshair"}
            onPointerDown={submitted ? undefined : onPointerDown}
          />
          {point && (
            <circle
              cx={toX(point.x)}
              cy={toY(point.y)}
              r={8}
              fill={submitted ? "#94a3b8" : ACCENT}
              stroke="white"
              strokeWidth={2}
              className={submitted ? "" : "cursor-grab active:cursor-grabbing"}
              onPointerDown={submitted ? undefined : onPointerDown}
            />
          )}
        </svg>
      </div>
      <p className="text-center text-sm font-bold text-slate-600">
        Drag the point onto the grid. Current position:{" "}
        <span className="text-sky-600">{point ? `(${point.x}, ${point.y})` : "not placed"}</span>
      </p>
    </div>
  );
}
