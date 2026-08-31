import type { MultipleChoiceQuestion } from "@/lib/types";
import type { ViewProps } from "./viewTypes";
import { MathText } from "@/components/math/MathText";

type Answer = Extract<import("@/lib/validate").AnswerValue, { kind: "multiple-choice" }>;

export function MultipleChoiceView({ question, answer, onChange, submitted, correct }: ViewProps<MultipleChoiceQuestion, Answer>) {
  const layout = question.layout ?? "list";
  const wrapClass =
    layout === "grid"
      ? "grid grid-cols-2 gap-3"
      : layout === "row"
      ? "flex flex-wrap gap-3"
      : "flex flex-col gap-2.5";

  return (
    <div className={wrapClass}>
      {question.choices.map((choice, i) => {
        const selected = answer.selectedIndex === i;
        const isCorrectChoice = i === question.correctIndex;

        let style =
          "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50 text-slate-700";
        if (selected && !submitted) style = "border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-200";
        if (submitted && selected && correct) style = "border-emerald-500 bg-emerald-50 text-emerald-800";
        if (submitted && selected && !correct) style = "border-rose-500 bg-rose-50 text-rose-800 animate-shake";
        if (submitted && !selected && isCorrectChoice) style = "border-emerald-500 bg-emerald-50 text-emerald-800";

        return (
          <button
            key={i}
            type="button"
            disabled={submitted}
            onClick={() => onChange({ kind: "multiple-choice", selectedIndex: i })}
            className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-colors disabled:cursor-default ${style}`}
          >
            <MathText text={choice} />
          </button>
        );
      })}
    </div>
  );
}
