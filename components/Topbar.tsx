"use client";

import ServerSelector from "./ServerSelector";

export default function Topbar() {
  return (
    <div className="flex items-center justify-end border-b px-6 py-3">
      <ServerSelector />
    </div>
  );
}