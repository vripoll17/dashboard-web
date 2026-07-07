"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/students", label: "Students" },
  { href: "/topics", label: "Topics" },
  { href: "/quiz-analytics", label: "Quiz Analytics" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-200/60 bg-white/80 px-4 py-6 backdrop-blur">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Classroom
        </div>
        <div className="mt-2 text-lg font-semibold text-zinc-900">
          Analytics Studio
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          Insights for every quiz session
        </div>
      </div>
      <nav className="flex flex-col gap-2 text-sm">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-xl px-3 py-2 transition focus-ring ${
              pathname === l.href
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-3 py-3 text-xs text-zinc-500">
        Tip: filter by server for sharper comparisons.
      </div>
    </aside>
  );
}