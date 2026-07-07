"use client";

import { useEffect, useMemo, useState } from "react";
import { useServer } from "../ServerProvider";
import { fetchStatsSample, StatDoc } from "../../services/stats";
import {
  computeQuestionExtremes,
  computeTopicComparison,
  computeTopicDifficulty,
  computeTopicTable,
  fetchQuestionsForTopic,
  fetchServerTopics,
  QuestionDoc,
  TopicDoc,
} from "../../services/topics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TopicsPage() {
  const { serverId } = useServer();
  const [stats, setStats] = useState<StatDoc[]>([]);
  const [topics, setTopics] = useState<TopicDoc[]>([]);
  const [questions, setQuestions] = useState<QuestionDoc[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    async function run() {
      if (!serverId) {
        setStats([]);
        setTopics([]);
        setSelectedTopicId("");
        return;
      }
      setLoading(true);
      const [statsResult, topicsResult] = await Promise.all([
        fetchStatsSample(serverId),
        fetchServerTopics(serverId),
      ]);
      setStats(statsResult as StatDoc[]);
      setTopics(topicsResult);
      if (topicsResult.length > 0) {
        setSelectedTopicId(topicsResult[0].id);
      }
      setLoading(false);
    }
    run();
  }, [serverId]);

  useEffect(() => {
    async function run() {
      if (!serverId || !selectedTopicId) {
        setQuestions([]);
        return;
      }
      setLoadingQuestions(true);
      const result = await fetchQuestionsForTopic(serverId, selectedTopicId);
      setQuestions(result);
      setLoadingQuestions(false);
    }
    run();
  }, [serverId, selectedTopicId]);

  const topicTable = useMemo(() => computeTopicTable(stats), [stats]);
  const comparison = useMemo(() => computeTopicComparison(stats), [stats]);
  const difficulty = useMemo(() => computeTopicDifficulty(stats), [stats]);
  const extremes = useMemo(() => computeQuestionExtremes(questions), [questions]);

  const summary = useMemo(() => {
    if (topicTable.length === 0) {
      return {
        topics: 0,
        totalQuizzes: 0,
        totalQuestions: 0,
        accuracy: 0,
      };
    }
    const totals = topicTable.reduce(
      (acc, row) => {
        acc.totalQuizzes += row.totalQuizzes;
        acc.totalQuestions += row.totalQuestions;
        acc.correctTotal += row.correctTotal;
        return acc;
      },
      { totalQuizzes: 0, totalQuestions: 0, correctTotal: 0 }
    );
    const accuracy =
      totals.totalQuestions === 0
        ? 0
        : totals.correctTotal / totals.totalQuestions;
    return {
      topics: topicTable.length,
      totalQuizzes: totals.totalQuizzes,
      totalQuestions: totals.totalQuestions,
      accuracy,
    };
  }, [topicTable]);

  const topicTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of topics) {
      map.set(t.id, t.title || t.id);
    }
    return map;
  }, [topics]);

  function displayTopic(topicKey: string) {
    return topicTitleById.get(topicKey) || topicKey;
  }

  return (
    <main className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Topics
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track performance by topic and spot recurring misunderstandings.
          </p>
        </div>
      </div>

      {!serverId && (
        <div className="surface surface-muted mt-6 border-dashed px-4 py-6 text-sm text-zinc-600">
          Select a server in the Topbar to unlock insights.
        </div>
      )}
      {serverId && (
        <>
          {loading ? (
            <p className="mt-4 text-sm text-zinc-500">Loading...</p>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="surface px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Active topics
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-zinc-900">
                    {summary.topics}
                  </div>
                </div>
                <div className="surface px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Total quizzes
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-zinc-900">
                    {summary.totalQuizzes}
                  </div>
                </div>
                <div className="surface px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Total questions
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-zinc-900">
                    {summary.totalQuestions}
                  </div>
                </div>
                <div className="surface px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Overall accuracy
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-zinc-900">
                    {(summary.accuracy * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="surface mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-zinc-200/60 bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">Topic</th>
                      <th className="px-4 py-3">Total quizzes</th>
                      <th className="px-4 py-3">Correct total</th>
                      <th className="px-4 py-3">Total questions</th>
                      <th className="px-4 py-3">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topicTable.map((t) => (
                      <tr key={t.topic} className="border-t border-zinc-100">
                        <td className="px-4 py-3">{displayTopic(t.topic)}</td>
                        <td className="px-4 py-3">{t.totalQuizzes}</td>
                        <td className="px-4 py-3">{t.correctTotal}</td>
                        <td className="px-4 py-3">{t.totalQuestions}</td>
                        <td className="px-4 py-3">
                          {(t.accuracy * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {topicTable.length === 0 && (
                  <div className="px-4 py-6 text-sm text-zinc-500">
                    No data for this server yet.
                  </div>
                )}
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="surface p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-900">
                      Topic comparison
                    </h2>
                    <span className="text-xs text-zinc-400">Quizzes</span>
                  </div>
                  <div className="mt-4 h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparison}>
                        <XAxis dataKey="topic" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="quizzes" fill="#0f172a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="surface p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-900">
                      Difficulty ranking
                    </h2>
                    <span className="text-xs text-zinc-400">Accuracy</span>
                  </div>
                  <div className="mt-4 h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={difficulty}>
                        <XAxis dataKey="topic" />
                        <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                        <Tooltip
                          formatter={(v) =>
                            typeof v === "number"
                              ? `${(v * 100).toFixed(1)}%`
                              : ""
                          }
                        />
                        <Bar dataKey="accuracy" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="surface mt-8 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-900">
                      Critical questions
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Find the questions with the most misses or hits.
                    </p>
                  </div>
                  <select
                    className="focus-ring rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title || t.id}
                      </option>
                    ))}
                  </select>
                </div>

                {loadingQuestions ? (
                  <p className="mt-4 text-sm text-zinc-500">
                    Loading questions...
                  </p>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900">
                        Most missed
                      </h3>
                      <ul className="mt-3 space-y-2 text-sm">
                        {extremes.mostFailed.map((q) => (
                          <li
                            key={q.question_id}
                            className="rounded-xl border border-zinc-200 bg-white p-3"
                          >
                            <div className="text-xs text-zinc-500">
                              Misses: {q.failures || 0}
                            </div>
                            <div className="mt-1 text-zinc-800">
                              {q.question}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900">
                        Most correct
                      </h3>
                      <ul className="mt-3 space-y-2 text-sm">
                        {extremes.mostSuccess.map((q) => (
                          <li
                            key={q.question_id}
                            className="rounded-xl border border-zinc-200 bg-white p-3"
                          >
                            <div className="text-xs text-zinc-500">
                              Hits: {q.success || 0}
                            </div>
                            <div className="mt-1 text-zinc-800">
                              {q.question}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}