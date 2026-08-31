"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SCHEMES_OF_WORK, findScheme } from "@/data/schemesOfWork";
import { generateScheme, type GeneratedScheme } from "@/lib/schemeOfWork";

const TERMS = ["Term 1", "Term 2", "Term 3"];

function toCsv(admin: Record<string, string>, generated: GeneratedScheme): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines: string[] = [];
  lines.push(Object.entries(admin).map(([k, v]) => `${k}: ${v}`).join(" | "));
  lines.push("");
  lines.push(
    [
      "Week",
      "Lesson",
      "Strand",
      "Sub-Strand",
      "Specific Learning Outcomes",
      "Key Inquiry Question(s)",
      "Learning Experiences",
      "Learning Resources",
      "Assessment Methods",
      "Reflection",
    ]
      .map(escape)
      .join(",")
  );
  for (const row of generated.rows) {
    lines.push(
      [
        String(row.week),
        String(row.lesson),
        row.strand,
        row.subStrand,
        row.specificLearningOutcomes.join("; "),
        row.keyInquiryQuestions.join("; "),
        row.learningExperiences.join("; "),
        row.learningResources.join("; "),
        row.assessmentMethods.join("; "),
        "",
      ]
        .map(escape)
        .join(",")
    );
  }
  return lines.join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SchemeOfWorkGenerator() {
  const options = SCHEMES_OF_WORK.map((s) => ({ subjectId: s.subjectId, grade: s.grade, label: `${s.subject} — Grade ${s.grade}` }));
  const [selected, setSelected] = useState(options[0]);
  const subject = findScheme(selected.subjectId, selected.grade)!;

  const [schoolName, setSchoolName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [term, setTerm] = useState(TERMS[0]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [weeks, setWeeks] = useState(13);
  const [lessonsPerWeek, setLessonsPerWeek] = useState(subject.lessonsPerWeek);

  const [generated, setGenerated] = useState<GeneratedScheme | null>(null);

  const admin = useMemo(
    () => ({
      School: schoolName || "—",
      Teacher: teacherName || "—",
      "Learning Area": subject.subject,
      "Grade / Class": `Grade ${subject.grade}`,
      Term: term,
      Year: year,
    }),
    [schoolName, teacherName, subject, term, year]
  );

  function handleSubjectChange(subjectId: string, grade: number) {
    const opt = options.find((o) => o.subjectId === subjectId && o.grade === grade);
    if (!opt) return;
    setSelected(opt);
    const next = findScheme(opt.subjectId, opt.grade)!;
    setLessonsPerWeek(next.lessonsPerWeek);
    setGenerated(null);
  }

  function handleGenerate() {
    setGenerated(generateScheme(subject, weeks, lessonsPerWeek));
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <style media="print">{`
        @page { size: landscape; margin: 12mm; }
        .no-print { display: none !important; }
        body { background: white !important; }
      `}</style>

      <header className="no-print sticky top-0 z-30 bg-gradient-to-r from-lime-500 to-green-500 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-lg font-extrabold text-green-600 shadow">C</span>
            <span className="hidden text-lg font-extrabold tracking-tight text-white sm:inline">CBC Quizmaster</span>
          </Link>
          <span className="ml-2 rounded-full bg-white/25 px-3 py-1 text-xs font-bold text-white">Scheme of Work Generator</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="no-print space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-700">Administrative details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-semibold text-slate-600">
                School name
                <input
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Green Valley Primary"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-green-500"
                />
              </label>
              <label className="text-sm font-semibold text-slate-600">
                Teacher name
                <input
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="e.g. J. Mwangi"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-green-500"
                />
              </label>
              <label className="text-sm font-semibold text-slate-600">
                Learning area
                <select
                  value={`${selected.subjectId}|${selected.grade}`}
                  onChange={(e) => {
                    const [subjectId, gradeStr] = e.target.value.split("|");
                    handleSubjectChange(subjectId, Number(gradeStr));
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-green-500"
                >
                  {options.map((o) => (
                    <option key={`${o.subjectId}|${o.grade}`} value={`${o.subjectId}|${o.grade}`}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-600">
                Term
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-green-500"
                >
                  {TERMS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-600">
                Year
                <input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  inputMode="numeric"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-green-500"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-700">Pacing</h2>
            <p className="mt-1 text-xs text-slate-400">
              Lessons/week is pulled from the KICD Lesson Allocation table for {subject.subject} (Grade {subject.grade}) — override it if your
              school's timetable differs.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="text-sm font-semibold text-slate-600">
                Weeks in this scheme
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={weeks}
                  onChange={(e) => setWeeks(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-green-500"
                />
              </label>
              <label className="text-sm font-semibold text-slate-600">
                Lessons per week
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={lessonsPerWeek}
                  onChange={(e) => setLessonsPerWeek(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-green-500"
                />
              </label>
              <div className="flex items-end">
                <button
                  onClick={handleGenerate}
                  className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-700"
                >
                  Generate scheme
                </button>
              </div>
            </div>
          </div>

          {generated && generated.overflow.length > 0 && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-bold">
                {weeks} weeks × {lessonsPerWeek} lessons/week = {generated.totalSlotsAvailable} lesson slots, but the full syllabus needs{" "}
                {generated.totalLessonsNeeded}. These sub-strands didn't fully fit — add more weeks to cover them:
              </p>
              <ul className="mt-2 list-disc pl-5">
                {generated.overflow.map((o, i) => (
                  <li key={i}>
                    {o.subStrand} — {o.lessonsShort} lesson{o.lessonsShort === 1 ? "" : "s"} short
                  </li>
                ))}
              </ul>
            </div>
          )}

          {generated && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.print()}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Print / Save as PDF
              </button>
              <button
                onClick={() => downloadCsv(`scheme-of-work-${subject.subjectId}-g${subject.grade}-${term.replace(" ", "")}.csv`, toCsv(admin, generated))}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Download CSV
              </button>
            </div>
          )}
        </div>

        {generated && (
          <section className="mt-8">
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h1 className="text-lg font-extrabold text-slate-800">Scheme of Work</h1>
              <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600 sm:grid-cols-3">
                {Object.entries(admin).map(([k, v]) => (
                  <div key={k}>
                    <span className="font-semibold text-slate-500">{k}: </span>
                    {v}
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[1200px] border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-left text-slate-600">
                    {["Wk", "Lsn", "Strand", "Sub-Strand", "Specific Learning Outcomes", "Key Inquiry Question(s)", "Learning Experiences", "Learning Resources", "Assessment", "Reflection"].map(
                      (h) => (
                        <th key={h} className="border border-slate-200 px-2 py-2 font-bold">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {generated.rows.map((row, i) => (
                    <tr key={i} className={row.isOpenSlot ? "bg-slate-50 italic text-slate-400" : i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="border border-slate-200 px-2 py-2 text-center font-bold">{row.week}</td>
                      <td className="border border-slate-200 px-2 py-2 text-center font-bold">{row.lesson}</td>
                      <td className="border border-slate-200 px-2 py-2">{row.strand}</td>
                      <td className="border border-slate-200 px-2 py-2 font-semibold">{row.subStrand}</td>
                      <td className="border border-slate-200 px-2 py-2">
                        <ul className="list-disc space-y-0.5 pl-3">
                          {row.specificLearningOutcomes.map((o, j) => (
                            <li key={j}>{o}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="border border-slate-200 px-2 py-2">
                        <ul className="list-disc space-y-0.5 pl-3">
                          {row.keyInquiryQuestions.map((q, j) => (
                            <li key={j}>{q}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="border border-slate-200 px-2 py-2">
                        <ul className="list-disc space-y-0.5 pl-3">
                          {row.learningExperiences.map((x, j) => (
                            <li key={j}>{x}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="border border-slate-200 px-2 py-2">
                        <ul className="list-disc space-y-0.5 pl-3">
                          {row.learningResources.map((r, j) => (
                            <li key={j}>{r}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="border border-slate-200 px-2 py-2">
                        <ul className="list-disc space-y-0.5 pl-3">
                          {row.assessmentMethods.map((a, j) => (
                            <li key={j}>{a}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="border border-slate-200 px-2 py-2"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="no-print mt-4 text-xs text-slate-400">
              This is an auto-populated draft from the official KICD curriculum design — review and adjust the per-lesson depth before use.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
