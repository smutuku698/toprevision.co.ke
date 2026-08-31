import type { OrderingQuestion } from "@/lib/types";
import type { ViewProps } from "./viewTypes";
import { MathText } from "@/components/math/MathText";

type Answer = Extract<import("@/lib/validate").AnswerValue, { kind: "ordering" }>;

export function OrderingView({ question, answer, onChange, submitted, correct }: ViewProps<OrderingQuestion, Answer>) {
  function toggle(id: string) {
    if (submitted) return;
    if (answer.order.includes(id)) {
      onChange({ kind: "ordering", order: answer.order.filter((x) => x !== id) });
    } else {
      onChange({ kind: "ordering", order: [...answer.order, id] });
    }
  }

  return (
    <div className="space-y-4">
      {question.instruction && (
        <p className="text-sm text-slate-500">
          <MathText text={question.instruction} />
        </p>
      )}

      <div className="flex min-h-[3.25rem] flex-wrap items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
        {answer.order.length === 0 && <span className="text-sm text-slate-400">Your order will appear here.</span>}
        {answer.order.map((id, i) => {
          const item = question.items.find((it) => it.id === id)!;
          return (
            <span key={id} className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-bold text-white">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/25 text-xs">{i + 1}</span>
              <MathText text={item.label} />
            </span>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2.5">
        {question.items.map((it) => {
          const used = answer.order.includes(it.id);
          const idx = answer.order.indexOf(it.id);
          const isCorrectPos = submitted && used && question.correctOrder[idx] === it.id;
          const isWrongPos = submitted && used && question.correctOrder[idx] !== it.id;
          return (
            <button
              key={it.id}
              type="button"
              disabled={submitted}
              onClick={() => toggle(it.id)}
              className={`rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-default ${
                isCorrectPos
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                  : isWrongPos
                  ? "border-rose-500 bg-rose-50 text-rose-800"
                  : used
                  ? "border-indigo-300 bg-indigo-50 text-indigo-400"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
              }`}
            >
              <MathText text={it.label} />
            </button>
          );
        })}
      </div>

      {!submitted && answer.order.length > 0 && (
        <button type="button" onClick={() => onChange({ kind: "ordering", order: [] })} className="text-xs font-semibold text-slate-400 hover:text-slate-600">
          Reset order
        </button>
      )}
      {submitted && !correct && (
        <p className="text-sm font-semibold text-emerald-700">
          Correct order:{" "}
          <MathText text={question.correctOrder.map((id) => question.items.find((it) => it.id === id)!.label).join(" → ")} />
        </p>
      )}
    </div>
  );
}
