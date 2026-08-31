import { formatElapsed, masteryLabel } from "@/lib/session";

export function SessionSummary({
  correctCount,
  total,
  elapsedSeconds,
  bestStreak,
  smartScore,
  onPracticeAgain,
  backHref,
  backLabel,
}: {
  correctCount: number;
  total: number;
  elapsedSeconds: number;
  bestStreak: number;
  smartScore: number;
  onPracticeAgain: () => void;
  backHref: string;
  backLabel: string;
}) {
  const accuracy = Math.round((correctCount / total) * 100);
  const { hr, min, sec } = formatElapsed(elapsedSeconds);
  const mastery = masteryLabel(smartScore);
  const celebratory = accuracy >= 80;

  return (
    <div className="flex-1 bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 text-center shadow-sm sm:p-10 animate-pop-in">
        <div className="text-5xl">{celebratory ? "🎉" : "💪"}</div>
        <h2 className="mt-3 text-2xl font-extrabold text-slate-800">Session complete!</h2>
        <p className="mt-1 text-sm text-slate-500">
          You answered {total} questions — {celebratory ? "great work." : "keep practicing, you're improving."}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Correct" value={`${correctCount}/${total}`} accent="bg-emerald-500" />
          <Stat label="Accuracy" value={`${accuracy}%`} accent="bg-sky-500" />
          <Stat label="Best streak" value={`${bestStreak}🔥`} accent="bg-orange-500" />
          <Stat label="Time" value={`${hr}:${min}:${sec}`} accent="bg-violet-500" />
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 p-4">
          <div className="flex items-end justify-center gap-2">
            <span className="text-3xl font-extrabold text-slate-700">{Math.round(smartScore)}</span>
            <span className="pb-1 text-sm text-slate-400">/ 100 SmartScore</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-orange-500 transition-all duration-500" style={{ width: `${smartScore}%` }} />
          </div>
          <div className="mt-1.5 text-xs font-semibold text-slate-500">{mastery.label}</div>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onPracticeAgain}
            className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white shadow transition-colors hover:bg-green-700"
          >
            Practice again (20 more)
          </button>
          <a
            href={backHref}
            className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            {backLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${accent}`}>{label}</div>
      <div className="py-2 text-lg font-extrabold text-slate-700">{value}</div>
    </div>
  );
}
