import type { Question } from "./types";

export type AnswerValue =
  | { kind: "multiple-choice"; selectedIndex: number | null }
  | { kind: "fill-blank"; text: string }
  | { kind: "click-match"; map: Record<string, string> }
  | { kind: "categorize"; map: Record<string, string> }
  | { kind: "ordering"; order: string[] }
  | { kind: "hotspot"; selected: string | null }
  | { kind: "number-line"; value: number | null }
  | { kind: "protractor"; angleDeg: number; touched: boolean }
  | { kind: "coordinate-plot"; point: { x: number; y: number } | null }
  | { kind: "solid-rotate"; selectedFaceId: string | null };

export function emptyAnswer(q: Question): AnswerValue {
  switch (q.kind) {
    case "multiple-choice":
      return { kind: "multiple-choice", selectedIndex: null };
    case "fill-blank":
      return { kind: "fill-blank", text: "" };
    case "click-match":
      return { kind: "click-match", map: {} };
    case "categorize":
      return { kind: "categorize", map: {} };
    case "ordering":
      return { kind: "ordering", order: [] };
    case "hotspot":
      return { kind: "hotspot", selected: null };
    case "number-line":
      return { kind: "number-line", value: null };
    case "protractor":
      return { kind: "protractor", angleDeg: 0, touched: false };
    case "coordinate-plot":
      return { kind: "coordinate-plot", point: null };
    case "solid-rotate":
      return { kind: "solid-rotate", selectedFaceId: null };
  }
}

export function isAnswerReady(q: Question, a: AnswerValue): boolean {
  switch (q.kind) {
    case "multiple-choice":
      return a.kind === "multiple-choice" && a.selectedIndex !== null;
    case "fill-blank":
      return a.kind === "fill-blank" && a.text.trim().length > 0;
    case "click-match":
      return a.kind === "click-match" && Object.keys(a.map).length === q.targets.length;
    case "categorize":
      return a.kind === "categorize" && Object.keys(a.map).length === q.items.length;
    case "ordering":
      return a.kind === "ordering" && a.order.length === q.items.length;
    case "hotspot":
      return a.kind === "hotspot" && a.selected !== null;
    case "number-line":
      return a.kind === "number-line" && a.value !== null;
    case "protractor":
      return a.kind === "protractor" && a.touched;
    case "coordinate-plot":
      return a.kind === "coordinate-plot" && a.point !== null;
    case "solid-rotate":
      return a.kind === "solid-rotate" && a.selectedFaceId !== null;
  }
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function checkAnswer(q: Question, a: AnswerValue): boolean {
  switch (q.kind) {
    case "multiple-choice":
      return a.kind === "multiple-choice" && a.selectedIndex === q.correctIndex;
    case "fill-blank": {
      if (a.kind !== "fill-blank") return false;
      const given = normalize(a.text);
      const accepted = [q.correctAnswer, ...(q.acceptedAnswers ?? [])].map(normalize);
      return accepted.includes(given);
    }
    case "click-match":
      return (
        a.kind === "click-match" &&
        q.targets.every((t) => a.map[t.id] === q.correctMap[t.id])
      );
    case "categorize":
      return (
        a.kind === "categorize" &&
        q.items.every((item) => a.map[item.id] === q.correctBucket[item.id])
      );
    case "ordering":
      return (
        a.kind === "ordering" &&
        a.order.length === q.correctOrder.length &&
        a.order.every((id, i) => id === q.correctOrder[i])
      );
    case "hotspot":
      return a.kind === "hotspot" && a.selected === q.correctLabel;
    case "number-line": {
      if (a.kind !== "number-line" || a.value === null) return false;
      switch (q.mode) {
        case "point":
          return a.value === q.correctValue;
        case "inequality-gt":
          return a.value > q.correctValue;
        case "inequality-gte":
          return a.value >= q.correctValue;
        case "inequality-lt":
          return a.value < q.correctValue;
        case "inequality-lte":
          return a.value <= q.correctValue;
      }
    }
    case "protractor":
      return a.kind === "protractor" && a.touched && Math.abs(a.angleDeg - q.correctAngleDeg) <= q.toleranceDeg;
    case "coordinate-plot":
      return (
        a.kind === "coordinate-plot" &&
        a.point !== null &&
        a.point.x === q.targetPoint.x &&
        a.point.y === q.targetPoint.y
      );
    case "solid-rotate":
      return a.kind === "solid-rotate" && a.selectedFaceId === q.correctFaceId;
  }
}
