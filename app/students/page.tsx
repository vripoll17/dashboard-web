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
    <main className="p-8">
      <h1 className="text-xl font-semibold">Students</h1>

      {!serverId && (
        <p className="mt-4 text-sm text-zinc-500">
          Selecciona un servidor en el Topbar.
        </p>
      )}

      {serverId && (
        <>
          {loading ? (
            <p className="mt-4 text-sm">Cargando...</p>
          ) : (
            <>
              <div className="mt-6 overflow-x-auto rounded border">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-left">
                    <tr>
                      <th className="px-4 py-2">Ranking</th>
                      <th className="px-4 py-2">Nombre</th>
                      <th className="px-4 py-2">Quizzes</th>
                      <th className="px-4 py-2">Correct</th>
                      <th className="px-4 py-2">Total</th>
                      <th className="px-4 py-2">% Acierto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.user_id} className="border-t">
                        <td className="px-4 py-2">{s.ranking}</td>
                        <td className="px-4 py-2">{s.name}</td>
                        <td className="px-4 py-2">{s.quizzes}</td>
                        <td className="px-4 py-2">{s.correct}</td>
                        <td className="px-4 py-2">{s.total}</td>
                        <td className="px-4 py-2">
                          {(s.accuracy * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 rounded border p-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-semibold">Evolucion del usuario</h2>
                  <select
                    className="rounded border px-2 py-1 text-sm"
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

                <div className="mt-4 h-56">
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