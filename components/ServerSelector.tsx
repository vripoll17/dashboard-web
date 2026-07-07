"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useServer } from "../app/ServerProvider";

type ServerDoc = {
  server_id: string;
  server_name: string;
  status?: string;
};

export default function ServerSelector() {
  const { serverId, setServer } = useServer();
  const [servers, setServers] = useState<ServerDoc[]>([]);

  useEffect(() => {
    async function loadServers() {
      const q = query(collection(db, "servers"));
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => d.data() as ServerDoc);
      setServers(items);
    }
    loadServers();
  }, []);

  return (
    <label className="flex items-center gap-3 text-xs text-zinc-500">
      <span className="hidden sm:inline">Server</span>
      <select
        className="focus-ring rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm"
        value={serverId}
        onChange={(e) => {
          const selected = servers.find(
            (s) => s.server_id === e.target.value
          );
          if (selected) setServer(selected.server_id, selected.server_name);
        }}
      >
        <option value="">Select server</option>
        {servers.map((s) => (
          <option key={s.server_id} value={s.server_id}>
            {s.server_name}
          </option>
        ))}
      </select>
    </label>
  );
}