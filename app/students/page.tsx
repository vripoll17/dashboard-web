"use client";

import { useEffect, useMemo, useState } from "react";
import { useServer } from "../ServerProvider";
import {
  computeStudents,
  computeUserTimeSeries,
  fetchStatsSample,
  StatDoc,
  StudentRow,
} from "../../services/stats";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StudentsPage() {
  const { serverId } = useServer();
  const [data, setData] = useState<StatDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

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

  const students: StudentRow[] = useMemo(() => computeStudents(data), [data]);

  useEffect(() => {
    if (!selectedUserId && students.length > 0) {
      setSelectedUserId(students[0].user_id);
    }
  }, [students, selectedUserId]);

  const timeSeries = useMemo(
    () => computeUserTimeSeries(data, selectedUserId),
    [data, selectedUserId]
  );

  return (
    <main className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Students</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Compare learners and track progress over time.
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
          {loading ? (
            <p className="mt-4 text-sm text-zinc-500">Loading...</p>
          ) : (
            <>
              <div className="surface mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-zinc-200/60 bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Quizzes</th>
                      <th className="px-4 py-3">Correct</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Accuracy %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.user_id} className="border-t border-zinc-100">
                        <td className="px-4 py-3">{s.ranking}</td>
                        <td className="px-4 py-3">{s.name}</td>
                        <td className="px-4 py-3">{s.quizzes}</td>
                        <td className="px-4 py-3">{s.correct}</td>
                        <td className="px-4 py-3">{s.total}</td>
                        <td className="px-4 py-3">
                          {(s.accuracy * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="surface mt-8 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-900">
                      User trend
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Explore progress for a selected learner.
                    </p>
                  </div>
                  <select
                    className="focus-ring rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    {students.map((s) => (
                      <option key={s.user_id} value={s.user_id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeries}>
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}