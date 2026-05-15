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
    <select
      className="rounded border px-2 py-1"
      value={serverId}
      onChange={(e) => {
        const selected = servers.find((s) => s.server_id === e.target.value);
        if (selected) setServer(selected.server_id, selected.server_name);
      }}
    >
      <option value="">Selecciona servidor</option>
      {servers.map((s) => (
        <option key={s.server_id} value={s.server_id}>
          {s.server_name}
        </option>
      ))}
    </select>
  );
}