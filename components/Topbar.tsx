"use client";

import ServerSelector from "./ServerSelector";
import { usePathname } from "next/navigation";

const labels: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Overall snapshot of classroom performance",
  },
  "/students": {
    title: "Students",
    subtitle: "Track individual progress",
  },
  "/topics": {
    title: "Topics",
    subtitle: "Compare topics by difficulty",
  },
  "/quiz-analytics": {
    title: "Quiz Analytics",
    subtitle: "Analyze attempts, accuracy, and patterns",
  },
};

export default function Topbar() {
  const pathname = usePathname();
  const page = labels[pathname] ?? {
    title: "Analytics",
    subtitle: "Main overview",
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/60 bg-white/80 px-6 py-4 backdrop-blur">
      <div>
        <div className="text-lg font-semibold text-zinc-900">{page.title}</div>
        <div className="text-xs text-zinc-500">{page.subtitle}</div>
      </div>
      <ServerSelector />
    </div>
  );
}