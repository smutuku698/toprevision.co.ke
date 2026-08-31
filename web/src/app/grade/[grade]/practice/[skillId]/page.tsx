"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PracticeSession } from "@/components/quiz/PracticeSession";
import { getSkill } from "@/skills";
import { getStrand, getSubject } from "@/lib/curriculum";

export default function PracticePage() {
  const params = useParams<{ grade: string; skillId: string }>();
  const grade = Number(params.grade);
  const skill = getSkill(params.skillId);

  if (!skill) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopNav grade={grade} />
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <p className="text-lg font-bold text-slate-700">Skill not found.</p>
          <Link href={`/grade/${grade}`} className="mt-3 inline-block text-sky-600 hover:underline">
            Back to Grade {grade} dashboard
          </Link>
        </div>
      </div>
    );
  }

  const subject = getSubject(skill.subjectId, skill.grade);
  const strand = getStrand(skill.strandId);

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav grade={grade} />
      <Breadcrumb
        crumbs={[
          { label: `Grade ${grade}`, href: `/grade/${grade}` },
          { label: subject?.name ?? "", href: `/grade/${grade}/subject/${skill.subjectId}` },
          { label: `${skill.code} ${skill.title}` },
        ]}
        trailing={strand && <span className="hidden text-xs font-medium text-slate-400 sm:inline">{strand.name}</span>}
      />
      <PracticeSession
        key={skill.id}
        skill={skill}
        backHref={`/grade/${grade}/subject/${skill.subjectId}`}
        backLabel={`Back to ${subject?.name ?? "skill list"}`}
      />
    </div>
  );
}
