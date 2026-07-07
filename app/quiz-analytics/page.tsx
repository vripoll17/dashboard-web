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
    <main className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Quiz Analytics
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Drill into attempts with filters and timestamps.
          </p>
        </div>
      </div>

      {!serverId && (
        <div className="surface surface-muted mt-6 border-dashed px-4 py-6 text-sm text-zinc-600">
          Select a server in the Topbar.
        </div>
      )}

      {serverId && (
        <>
          <div className="surface mt-6 grid grid-cols-1 gap-4 p-5 md:grid-cols-4">
            <div>
              <label className="block text-xs text-zinc-500">User</label>
              <select
                className="focus-ring mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="">All</option>
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
                className="focus-ring mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
              >
                <option value="">All</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-500">From</label>
              <input
                type="date"
                className="focus-ring mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500">To</label>
              <input
                type="date"
                className="focus-ring mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-zinc-500">Loading...</p>
          ) : (
            <div className="surface mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-200/60 bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Topic</th>
                    <th className="px-4 py-3">Correct</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Accuracy</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, i) => (
                    <tr
                      key={`${d.name}-${d.topic}-${i}`}
                      className="border-t border-zinc-100"
                    >
                      <td className="px-4 py-3">{d.name}</td>
                      <td className="px-4 py-3">{d.topic}</td>
                      <td className="px-4 py-3">{d.correct}</td>
                      <td className="px-4 py-3">{d.total}</td>
                      <td className="px-4 py-3">
                        {d.total > 0 ? ((d.correct / d.total) * 100).toFixed(1) : "0.0"}%
                      </td>
                      <td className="px-4 py-3">{formatDate(d.timestamp)}</td>
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