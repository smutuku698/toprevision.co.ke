"use client";

import Link from "next/link";
import type { Skill } from "@/lib/types";
import { useSkillProgress, masteryLabel } from "@/lib/session";

export function SkillCard({ skill }: { skill: Skill }) {
  const score = useSkillProgress(skill.id).smartScore;
  const mastery = masteryLabel(score);

  return (
    <Link
      href={`/grade/${skill.grade}/practice/${skill.id}`}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600">
        {skill.code}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-700">{skill.title}</p>
        <p className="truncate text-xs text-slate-400">{skill.description}</p>
      </div>
      {score > 0 && (
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
            mastery.tone === "mastered"
              ? "bg-emerald-100 text-emerald-700"
              : mastery.tone === "close"
              ? "bg-sky-100 text-sky-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {Math.round(score)}
        </span>
      )}
    </Link>
  );
}
