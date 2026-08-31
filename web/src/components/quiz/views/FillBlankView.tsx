import type { FillBlankQuestion } from "@/lib/types";
import type { ViewProps } from "./viewTypes";
import { MathText } from "@/components/math/MathText";

type Answer = Extract<import("@/lib/validate").AnswerValue, { kind: "fill-blank" }>;

export function FillBlankView({ question, answer, onChange, submitted, correct }: ViewProps<FillBlankQuestion, Answer>) {
  let inputStyle = "border-slate-300 focus:border-sky-500 focus:ring-sky-200";
  if (submitted) {
    inputStyle = correct
      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
      : "border-rose-500 bg-rose-50 text-rose-800 animate-shake";
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-700">
      <MathText text={question.before} />
      <input
        type={question.inputMode === "numeric" ? "text" : "text"}
        inputMode={question.inputMode === "numeric" ? "decimal" : "text"}
        value={answer.text}
        disabled={submitted}
        onChange={(e) => onChange({ kind: "fill-blank", text: e.target.value })}
        placeholder="?"
        className={`w-28 rounded-lg border-2 px-3 py-1.5 text-center text-lg font-bold outline-none ring-0 transition-colors focus:ring-4 ${inputStyle}`}
      />
      {question.unit && <MathText text={question.unit} className="text-slate-500" />}
      <MathText text={question.after} />
      {submitted && !correct && (
        <span className="ml-2 text-sm font-semibold text-emerald-700">
          Correct answer: {question.correctAnswer}
          {question.unit ? ` ${question.unit}` : ""}
        </span>
      )}
    </div>
  );
}
