import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/students", label: "Students" },
  { href: "/topics", label: "Topics" },
  { href: "/quiz-analytics", label: "Quiz Analytics" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r px-4 py-6">
      <div className="mb-6 text-lg font-semibold">Analytics</div>
      <nav className="flex flex-col gap-2 text-sm">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded px-3 py-2 text-zinc-700 hover:bg-zinc-100"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}