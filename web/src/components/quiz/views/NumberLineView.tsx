import type { NumberLineQuestion } from "@/lib/types";
import type { ViewProps } from "./viewTypes";

type Answer = Extract<import("@/lib/validate").AnswerValue, { kind: "number-line" }>;

function satisfies(mode: NumberLineQuestion["mode"], value: number, boundary: number) {
  switch (mode) {
    case "point":
      return value === boundary;
    case "inequality-gt":
      return value > boundary;
    case "inequality-gte":
      return value >= boundary;
    case "inequality-lt":
      return value < boundary;
    case "inequality-lte":
      return value <= boundary;
  }
}

export function NumberLineView({ question, answer, onChange, submitted }: ViewProps<NumberLineQuestion, Answer>) {
  const values: number[] = [];
  for (let v = question.min; v <= question.max; v += question.step) values.push(v);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-2">
        <div className="relative flex min-w-max items-center gap-4 px-2 pt-2">
          <div className="absolute left-2 right-2 top-1/2 h-0.5 -translate-y-1/2 bg-slate-300" />
          {values.map((v) => {
            const selected = answer.value === v;
            const isCorrectPosition = submitted && satisfies(question.mode, v, question.correctValue);
            let style = "border-slate-300 bg-white text-slate-500 hover:border-sky-400";
            if (selected && !submitted) style = "border-sky-500 bg-sky-500 text-white ring-4 ring-sky-200";
            if (submitted && selected && isCorrectPosition) style = "border-emerald-500 bg-emerald-500 text-white";
            if (submitted && selected && !isCorrectPosition) style = "border-rose-500 bg-rose-500 text-white animate-shake";
            if (submitted && !selected && v === question.correctValue) style += " ring-2 ring-emerald-300";

            return (
              <button
                key={v}
                type="button"
                disabled={submitted}
                onClick={() => onChange({ kind: "number-line", value: v })}
                className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition-colors disabled:cursor-default ${style}`}
              >
                {v}
              </button>
            );
          })}
        </div>
      </div>
      {submitted && (
        <p className="text-sm font-semibold text-slate-500">
          Boundary value: x = {question.correctValue}
          {question.mode !== "point" && ` — the correct region is highlighted in green.`}
        </p>
      )}
    </div>
  );
}
