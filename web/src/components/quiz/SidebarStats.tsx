import { formatElapsed, masteryLabel } from "@/lib/session";

const TONE_STYLES: Record<string, string> = {
  start: "bg-slate-400",
  progress: "bg-amber-500",
  close: "bg-sky-500",
  mastered: "bg-emerald-500",
};

export function SidebarStats({
  questionsAnswered,
  sessionTotal,
  elapsedSeconds,
  smartScore,
  streak,
}: {
  questionsAnswered: number;
  sessionTotal: number;
  elapsedSeconds: number;
  smartScore: number;
  streak: number;
}) {
  const { hr, min, sec } = formatElapsed(elapsedSeconds);
  const mastery = masteryLabel(smartScore);

  return (
    <aside className="w-full shrink-0 space-y-3 sm:w-56">
      <StatBlock label="Session progress" accent="bg-lime-500">
        <div className="px-4 py-3">
          <div className="text-center text-2xl font-extrabold text-slate-700">
            {questionsAnswered}
            <span className="text-base font-semibold text-slate-400"> / {sessionTotal}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-lime-500 transition-all duration-500"
              style={{ width: `${(questionsAnswered / sessionTotal) * 100}%` }}
            />
          </div>
        </div>
      </StatBlock>

      <StatBlock label="Time elapsed" accent="bg-sky-500">
        <div className="flex items-center justify-center gap-1.5 py-3">
          {[
            { v: hr, l: "HR" },
            { v: min, l: "MIN" },
            { v: sec, l: "SEC" },
          ].map((t) => (
            <div key={t.l} className="text-center">
              <div className="w-11 rounded-md border border-slate-200 bg-white py-1 text-lg font-bold text-slate-700 shadow-sm">
                {t.v}
              </div>
              <div className="mt-0.5 text-[10px] font-semibold tracking-wide text-slate-400">{t.l}</div>
            </div>
          ))}
        </div>
      </StatBlock>

      <StatBlock label="SmartScore" accent="bg-orange-500">
        <div className="px-4 py-3">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold text-slate-700">{Math.round(smartScore)}</span>
            <span className="pb-1 text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${TONE_STYLES[mastery.tone]}`}
              style={{ width: `${smartScore}%` }}
            />
          </div>
          <div className="mt-1.5 text-xs font-semibold text-slate-500">{mastery.label}</div>
        </div>
      </StatBlock>

      {streak >= 2 && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-600 animate-pop-in">
          <span>🔥</span>
          {streak} in a row!
        </div>
      )}
    </aside>
  );
}

function StatBlock({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={`px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wide text-white ${accent}`}>
        {label}
      </div>
      {children}
    </div>
  );
}
