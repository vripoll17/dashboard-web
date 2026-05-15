"use client";

import { useEffect, useMemo, useState } from "react";
import { useServer } from "../ServerProvider";
import {
  computeAccuracySeries,
  computeHardestTopics,
  computeKpis,
  computeTimeSeries,
  computeTopicActivity,
  computeTopUsers,
  fetchStatsSample,
  StatDoc,
} from "../../services/stats";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Home() {
  const { serverId, serverName } = useServer();
  const [data, setData] = useState<StatDoc[]>([]);
  const [loading, setLoading] = useState(false);

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

  const kpis = useMemo(() => computeKpis(data), [data]);
  const topUsers = useMemo(() => computeTopUsers(data), [data]);
  const hardestTopics = useMemo(() => computeHardestTopics(data), [data]);
  const timeSeries = useMemo(() => computeTimeSeries(data), [data]);
  const accuracySeries = useMemo(() => computeAccuracySeries(data), [data]);
  const topicActivity = useMemo(() => computeTopicActivity(data), [data]);

  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Servidor seleccionado: {serverName || "ninguno"}
      </p>

      {!serverId && (
        <p className="mt-4 text-sm text-zinc-500">
          Selecciona un servidor en el Topbar para ver datos.
        </p>
      )}

      {serverId && (
        <>
          {loading ? (
            <p className="mt-4 text-sm">Cargando...</p>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded border p-4">
                  <div className="text-xs uppercase text-zinc-500">
                    Total quizzes
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
                    {kpis.totalQuizzes}
                  </div>
                </div>
                <div className="rounded border p-4">
                  <div className="text-xs uppercase text-zinc-500">
                    Usuarios unicos
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
                    {kpis.uniqueUsers}
                  </div>
                </div>
                <div className="rounded border p-4">
                  <div className="text-xs uppercase text-zinc-500">
                    Media aciertos
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
                    {(kpis.globalAccuracy * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="rounded border p-4">
                  <div className="text-xs uppercase text-zinc-500">
                    Topics activos
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
                    {kpis.uniqueTopics}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded border p-4">
                  <h2 className="font-semibold">Top usuarios</h2>
                  <div className="mt-3 space-y-2 text-sm">
                    {topUsers.map((u) => (
                      <div key={u.user_id} className="flex justify-between">
                        <span>{u.name}</span>
                        <span>{(u.accuracy * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded border p-4">
                  <h2 className="font-semibold">Topics mas dificiles</h2>
                  <div className="mt-3 space-y-2 text-sm">
                    {hardestTopics.map((t) => (
                      <div key={t.topic} className="flex justify-between">
                        <span>{t.topic}</span>
                        <span>{(t.accuracy * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded border p-4">
                  <h2 className="font-semibold">Evolucion quizzes</h2>
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

                <div className="rounded border p-4">
                  <h2 className="font-semibold">Ratio global de aciertos</h2>
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={accuracySeries}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={70}
                        >
                          <Cell fill="#16a34a" />
                          <Cell fill="#dc2626" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded border p-4">
                  <h2 className="font-semibold">Actividad por topic</h2>
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topicActivity}>
                        <XAxis dataKey="topic" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#0ea5e9" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}