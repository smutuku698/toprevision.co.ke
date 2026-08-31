"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AVAILABLE_GRADES, subjectsForGrade } from "@/lib/curriculum";
import { SubjectIcon } from "@/components/icons/SubjectIcon";

export function TopNav({ grade }: { grade?: number }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30">
      <div className="bg-gradient-to-r from-lime-500 to-green-500 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link href={grade ? `/grade/${grade}` : "/"} className="flex items-center gap-2 shrink-0">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-lg font-extrabold text-green-600 shadow">
              C
            </span>
            <span className="hidden text-lg font-extrabold tracking-tight text-white sm:inline">
              CBC Quizmaster
            </span>
          </Link>
          {grade && (
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-white/25 p-1">
                {AVAILABLE_GRADES.map((g) => (
                  <Link
                    key={g}
                    href={`/grade/${g}`}
                    className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
                      g === grade ? "bg-white text-green-700" : "text-white/90 hover:bg-white/15"
                    }`}
                  >
                    G{g}
                  </Link>
                ))}
              </div>
              <div className="hidden items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm sm:flex">
                Grade {grade} · CBC
              </div>
            </div>
          )}
        </div>
      </div>
      {grade && (
        <nav className="border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto">
            {subjectsForGrade(grade).map((s) => {
              const href = `/grade/${grade}/subject/${s.id}`;
              const active = pathname?.startsWith(href);
              return (
                <Link
                  key={s.id}
                  href={href}
                  className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "border-green-500 text-green-700"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <SubjectIcon icon={s.icon} className="h-4 w-4" />
                  {s.name}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
