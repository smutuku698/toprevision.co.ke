import Link from "next/link";

export function Breadcrumb({
  crumbs,
  trailing,
}: {
  crumbs: { label: string; href?: string }[];
  trailing?: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-slate-300">›</span>}
              {c.href ? (
                <Link href={c.href} className="hover:text-green-700 hover:underline">
                  {c.label}
                </Link>
              ) : (
                <span className="font-semibold text-slate-700">{c.label}</span>
              )}
            </span>
          ))}
        </div>
        {trailing}
      </div>
    </div>
  );
}
