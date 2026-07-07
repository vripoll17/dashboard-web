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
    <main className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Quick overview of engagement, accuracy, and topic activity.
          </p>
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
          {serverName ? `Server: ${serverName}` : "No server selected"}
        </div>
      </div>

      {!serverId && (
        <div className="surface surface-muted mt-6 border-dashed px-4 py-6 text-sm text-zinc-600">
          Select a server in the Topbar to view data.
        </div>
      )}

      {serverId && (
        <>
          {loading ? (
            <p className="mt-4 text-sm text-zinc-500">Loading...</p>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="surface px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Total quizzes
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-zinc-900">
                    {kpis.totalQuizzes}
                  </div>
                </div>
                <div className="surface px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Unique users
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-zinc-900">
                    {kpis.uniqueUsers}
                  </div>
                </div>
                <div className="surface px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Average accuracy
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-zinc-900">
                    {(kpis.globalAccuracy * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="surface px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Active topics
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-zinc-900">
                    {kpis.uniqueTopics}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="surface p-5">
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Top students
                  </h2>
                  <div className="mt-3 space-y-2 text-sm text-zinc-700">
                    {topUsers.map((u) => (
                      <div key={u.user_id} className="flex justify-between">
                        <span>{u.name}</span>
                        <span>{(u.accuracy * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="surface p-5">
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Hardest topics
                  </h2>
                  <div className="mt-3 space-y-2 text-sm text-zinc-700">
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
                <div className="surface p-5">
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Quiz volume over time
                  </h2>
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

                <div className="surface p-5">
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Overall accuracy split
                  </h2>
                  <div className="mt-4 h-60">
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

                <div className="surface p-5">
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Activity by topic
                  </h2>
                  <div className="mt-4 h-60">
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