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
    <main className="p-8">
      <h1 className="text-xl font-semibold">Topics</h1>

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
                      <th className="px-4 py-2">Topic</th>
                      <th className="px-4 py-2">Total quizzes</th>
                      <th className="px-4 py-2">Correct total</th>
                      <th className="px-4 py-2">Total preguntas</th>
                      <th className="px-4 py-2">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topicTable.map((t) => (
                      <tr key={t.topic} className="border-t">
                        <td className="px-4 py-2">{displayTopic(t.topic)}</td>
                        <td className="px-4 py-2">{t.totalQuizzes}</td>
                        <td className="px-4 py-2">{t.correctTotal}</td>
                        <td className="px-4 py-2">{t.totalQuestions}</td>
                        <td className="px-4 py-2">
                          {(t.accuracy * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded border p-4">
                  <h2 className="font-semibold">Comparacion entre topics</h2>
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparison}>
                        <XAxis dataKey="topic" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="quizzes" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded border p-4">
                  <h2 className="font-semibold">Ranking de dificultad</h2>
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={difficulty}>
                        <XAxis dataKey="topic" />
                        <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                        <Tooltip formatter={(v) => (typeof v === "number" ? `${(v * 100).toFixed(1)}%` : "")} />
                        <Bar dataKey="accuracy" fill="#dc2626" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded border p-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-semibold">Preguntas (opcional)</h2>
                  <select
                    className="rounded border px-2 py-1 text-sm"
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
                  <p className="mt-4 text-sm">Cargando preguntas...</p>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold">Mas falladas</h3>
                      <ul className="mt-2 space-y-2 text-sm">
                        {extremes.mostFailed.map((q) => (
                          <li key={q.question_id} className="rounded border p-2">
                            <div className="text-xs text-zinc-500">
                              Fallos: {q.failures || 0}
                            </div>
                            <div>{q.question}</div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold">Mas acertadas</h3>
                      <ul className="mt-2 space-y-2 text-sm">
                        {extremes.mostSuccess.map((q) => (
                          <li key={q.question_id} className="rounded border p-2">
                            <div className="text-xs text-zinc-500">
                              Aciertos: {q.success || 0}
                            </div>
                            <div>{q.question}</div>
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