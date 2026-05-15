"use client";

import { useEffect, useMemo, useState } from "react";
import { useServer } from "../ServerProvider";
import { fetchStatsSample, StatDoc } from "../../services/stats";

function formatDate(ts?: StatDoc["timestamp"]) {
  if (!ts) return "";
  if (typeof (ts as any).toDate === "function") return (ts as any).toDate().toLocaleString();
  if (typeof (ts as any).seconds === "number") return new Date((ts as any).seconds * 1000).toLocaleString();
  return "";
}

function toDate(ts?: StatDoc["timestamp"]) {
  if (!ts) return null;
  if (typeof (ts as any).toDate === "function") return (ts as any).toDate();
  if (typeof (ts as any).seconds === "number") return new Date((ts as any).seconds * 1000);
  return null;
}

export default function QuizAnalyticsPage() {
  const { serverId } = useServer();
  const [data, setData] = useState<StatDoc[]>([]);
  const [loading, setLoading] = useState(false);

  const [userFilter, setUserFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    async function run() {
      if (!serverId) {
        setData([]);
        return;
      }
      setLoading(true);
      const results = await fetchStatsSample(serverId);
      setData(results as StatDoc[]);
      setLoading(false);
    }
    run();
  }, [serverId]);

  const users = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.name))).sort();
  }, [data]);

  const topics = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.topic))).sort();
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (userFilter && d.name !== userFilter) return false;
      if (topicFilter && d.topic !== topicFilter) return false;

      const date = toDate(d.timestamp);
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (!date || date < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (!date || date > to) return false;
      }
      return true;
    });
  }, [data, userFilter, topicFilter, dateFrom, dateTo]);

  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Quiz Analytics</h1>

      {!serverId && (
        <p className="mt-4 text-sm text-zinc-500">
          Selecciona un servidor en el Topbar.
        </p>
      )}

      {serverId && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="block text-xs text-zinc-500">Usuario</label>
              <select
                className="mt-1 w-full rounded border px-2 py-1 text-sm"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="">Todos</option>
                {users.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-500">Topic</label>
              <select
                className="mt-1 w-full rounded border px-2 py-1 text-sm"
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
              >
                <option value="">Todos</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-500">Desde</label>
              <input
                type="date"
                className="mt-1 w-full rounded border px-2 py-1 text-sm"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500">Hasta</label>
              <input
                type="date"
                className="mt-1 w-full rounded border px-2 py-1 text-sm"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className="mt-4 text-sm">Cargando...</p>
          ) : (
            <div className="mt-6 overflow-x-auto rounded border">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-left">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Topic</th>
                    <th className="px-4 py-2">Correct</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2">Accuracy</th>
                    <th className="px-4 py-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, i) => (
                    <tr key={`${d.name}-${d.topic}-${i}`} className="border-t">
                      <td className="px-4 py-2">{d.name}</td>
                      <td className="px-4 py-2">{d.topic}</td>
                      <td className="px-4 py-2">{d.correct}</td>
                      <td className="px-4 py-2">{d.total}</td>
                      <td className="px-4 py-2">
                        {d.total > 0 ? ((d.correct / d.total) * 100).toFixed(1) : "0.0"}%
                      </td>
                      <td className="px-4 py-2">{formatDate(d.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}