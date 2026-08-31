"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SkillCard } from "@/components/dashboard/SkillCard";
import { getSubject, STRANDS } from "@/lib/curriculum";
import { skillsForStrand } from "@/skills";

export default function SubjectPage() {
  const params = useParams<{ grade: string; subjectId: string }>();
  const grade = Number(params.grade);
  const [showBonus, setShowBonus] = useState(false);
  const subject = getSubject(params.subjectId, grade);
  const allStrands = STRANDS.filter((s) => s.subjectId === params.subjectId && s.grade === grade);
  const strands = allStrands.filter((s) => !s.isBonus);
  const bonusStrands = allStrands.filter((s) => s.isBonus).filter((s) => skillsForStrand(s.id).length > 0);

  if (!subject) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopNav grade={grade} />
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <p className="text-lg font-bold text-slate-700">Subject not found.</p>
          <Link href={`/grade/${grade}`} className="mt-3 inline-block text-sky-600 hover:underline">
            Back to Grade {grade} dashboard
          </Link>
        </div>
      </div>
    );
  }

  const anySkills = strands.some((s) => skillsForStrand(s.id).length > 0);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <TopNav grade={grade} />
      <Breadcrumb crumbs={[{ label: `Grade ${grade}`, href: `/grade/${grade}` }, { label: subject.name }]} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-extrabold text-slate-800">{subject.name}</h1>
        <p className="mt-1 text-sm text-slate-500">Grade {grade} CBC strands and practice skills.</p>

        {!anySkills && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-bold text-slate-600">More {subject.name} skills are on the way.</p>
            <p className="mt-1 text-sm text-slate-400">
              The engine already supports this subject — new parameterized skills get added the same way as Math.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-8">
          {strands.map((strand) => {
            const skills = skillsForStrand(strand.id);
            if (skills.length === 0) return null;
            return (
              <section key={strand.id}>
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">{strand.name}</h2>
                {strand.description && <p className="mt-0.5 text-xs text-slate-400">{strand.description}</p>}
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {skills.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {bonusStrands.length > 0 && (
          <div className="mt-10 border-t border-slate-200 pt-6">
            {!showBonus ? (
              <button
                type="button"
                onClick={() => setShowBonus(true)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
              >
                + Show extra practice skills
              </button>
            ) : (
              <div className="space-y-8">
                {bonusStrands.map((strand) => {
                  const skills = skillsForStrand(strand.id);
                  return (
                    <section key={strand.id}>
                      <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">{strand.name}</h2>
                      {strand.description && <p className="mt-0.5 text-xs text-slate-400">{strand.description}</p>}
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {skills.map((skill) => (
                          <SkillCard key={skill.id} skill={skill} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
