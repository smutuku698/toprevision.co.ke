import { Visual } from "@/components/visuals/Visual";
import type { HotspotQuestion } from "@/lib/types";
import type { ViewProps } from "./viewTypes";

type Answer = Extract<import("@/lib/validate").AnswerValue, { kind: "hotspot" }>;

export function HotspotView({ question, answer, onChange, submitted, correct }: ViewProps<HotspotQuestion, Answer>) {
  return (
    <div className="space-y-5">
      <div className="relative mx-auto w-fit rounded-xl border border-slate-200 bg-white p-3">
        <Visual spec={question.diagram} />
        {question.spots.map((spot) => {
          const isTarget = spot.id === question.askId;
          return (
            <span
              key={spot.id}
              style={{ left: `${spot.xPercent}%`, top: `${spot.yPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              {isTarget && <span className="absolute inset-0 -m-2 animate-ping rounded-full bg-sky-400/60" />}
              <span
                className={`relative grid h-5 w-5 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow ${
                  isTarget ? "bg-sky-600" : "bg-slate-300"
                }`}
              >
                ?
              </span>
            </span>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {question.choices.map((choice) => {
          const selected = answer.selected === choice;
          const isCorrectChoice = choice === question.correctLabel;
          let style = "border-slate-200 bg-white hover:border-sky-300 text-slate-700";
          if (selected && !submitted) style = "border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-200";
          if (submitted && selected && correct) style = "border-emerald-500 bg-emerald-50 text-emerald-800";
          if (submitted && selected && !correct) style = "border-rose-500 bg-rose-50 text-rose-800 animate-shake";
          if (submitted && !selected && isCorrectChoice) style = "border-emerald-500 bg-emerald-50 text-emerald-800";

          return (
            <button
              key={choice}
              type="button"
              disabled={submitted}
              onClick={() => onChange({ kind: "hotspot", selected: choice })}
              className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition-colors disabled:cursor-default ${style}`}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}
