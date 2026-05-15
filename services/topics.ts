import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { StatDoc } from "./stats";

export type TopicDoc = {
  id: string;
  title?: string;
  num_quizzes_generated?: number;
  created_at?: unknown;
  document_storage_url?: string;
};

export type TopicRow = {
  topic: string;
  totalQuizzes: number;
  correctTotal: number;
  totalQuestions: number;
  accuracy: number;
};

export type QuestionDoc = {
  question_id: string;
  question: string;
  correct_answer: string;
  question_type: string;
  alternatives: string;
  success: number;
  failures: number;
};

export async function fetchServerTopics(serverId: string) {
  if (!serverId) return [];
  const q = query(collection(db, "servers", serverId, "topics"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as TopicDoc[];
}

export async function fetchQuestionsForTopic(serverId: string, topicId: string) {
  if (!serverId || !topicId) return [];
  const q = query(collection(db, "servers", serverId, "topics", topicId, "questions"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as QuestionDoc[];
}

export function computeTopicTable(stats: StatDoc[]) {
  const map = new Map<string, TopicRow>();

  for (const s of stats) {
    const prev = map.get(s.topic);
    if (!prev) {
      map.set(s.topic, {
        topic: s.topic,
        totalQuizzes: 1,
        correctTotal: s.correct || 0,
        totalQuestions: s.total || 0,
        accuracy: 0,
      });
    } else {
      prev.totalQuizzes += 1;
      prev.correctTotal += s.correct || 0;
      prev.totalQuestions += s.total || 0;
    }
  }

  return Array.from(map.values()).map((t) => ({
    ...t,
    accuracy: t.totalQuestions > 0 ? t.correctTotal / t.totalQuestions : 0,
  }));
}

export function computeTopicComparison(stats: StatDoc[]) {
  return computeTopicTable(stats)
    .map((t) => ({ topic: t.topic, quizzes: t.totalQuizzes }))
    .sort((a, b) => b.quizzes - a.quizzes);
}

export function computeTopicDifficulty(stats: StatDoc[]) {
  return computeTopicTable(stats)
    .map((t) => ({ topic: t.topic, accuracy: t.accuracy }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

export function computeQuestionExtremes(questions: QuestionDoc[], limit = 5) {
  const mostFailed = [...questions]
    .sort((a, b) => (b.failures || 0) - (a.failures || 0))
    .slice(0, limit);

  const mostSuccess = [...questions]
    .sort((a, b) => (b.success || 0) - (a.success || 0))
    .slice(0, limit);

  return { mostFailed, mostSuccess };
}