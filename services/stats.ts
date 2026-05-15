import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../lib/firebase";

export type StatDoc = {
  correct: number;
  total: number;
  name: string;
  topic: string;
  user_id: string;
  timestamp?: { seconds: number; nanoseconds: number } | { toDate: () => Date };
};

export type StudentRow = {
  user_id: string;
  name: string;
  quizzes: number;
  correct: number;
  total: number;
  accuracy: number;
  ranking: number;
};

function toDate(ts?: StatDoc["timestamp"]) {
  if (!ts) return null;
  if (typeof (ts as any).toDate === "function") return (ts as any).toDate();
  if (typeof (ts as any).seconds === "number") return new Date((ts as any).seconds * 1000);
  return null;
}

export async function fetchStatsSample(serverId: string): Promise<StatDoc[]> {
  if (!serverId) return [];
  const q = query(collection(db, "servers", serverId, "stats"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as StatDoc) }));
}

export function computeKpis(stats: StatDoc[]) {
  const totalQuizzes = stats.length;
  const uniqueUsers = new Set(stats.map((s) => s.user_id)).size;
  const uniqueTopics = new Set(stats.map((s) => s.topic)).size;

  const totalCorrect = stats.reduce((acc, s) => acc + (s.correct || 0), 0);
  const totalQuestions = stats.reduce((acc, s) => acc + (s.total || 0), 0);
  const globalAccuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;

  return { totalQuizzes, uniqueUsers, uniqueTopics, globalAccuracy };
}

export function computeTopUsers(stats: StatDoc[], limit = 5) {
  const map = new Map<
    string,
    { user_id: string; name: string; correct: number; total: number }
  >();

  for (const s of stats) {
    const prev = map.get(s.user_id);
    if (!prev) {
      map.set(s.user_id, {
        user_id: s.user_id,
        name: s.name,
        correct: s.correct || 0,
        total: s.total || 0,
      });
    } else {
      prev.correct += s.correct || 0;
      prev.total += s.total || 0;
    }
  }

  return Array.from(map.values())
    .map((u) => ({
      ...u,
      accuracy: u.total > 0 ? u.correct / u.total : 0,
    }))
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, limit);
}

export function computeHardestTopics(stats: StatDoc[], limit = 5) {
  const map = new Map<string, { topic: string; correct: number; total: number }>();

  for (const s of stats) {
    const prev = map.get(s.topic);
    if (!prev) {
      map.set(s.topic, {
        topic: s.topic,
        correct: s.correct || 0,
        total: s.total || 0,
      });
    } else {
      prev.correct += s.correct || 0;
      prev.total += s.total || 0;
    }
  }

  return Array.from(map.values())
    .map((t) => ({
      ...t,
      accuracy: t.total > 0 ? t.correct / t.total : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit);
}

export function computeTimeSeries(stats: StatDoc[]) {
  const map = new Map<string, number>();

  for (const s of stats) {
    const d = toDate(s.timestamp);
    if (!d) continue;
    const key = d.toISOString().slice(0, 10);
    map.set(key, (map.get(key) || 0) + 1);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, count]) => ({ date, count }));
}

export function computeAccuracySeries(stats: StatDoc[]) {
  const totalCorrect = stats.reduce((acc, s) => acc + (s.correct || 0), 0);
  const totalQuestions = stats.reduce((acc, s) => acc + (s.total || 0), 0);

  return [
    { name: "Correctas", value: totalCorrect },
    { name: "Incorrectas", value: Math.max(0, totalQuestions - totalCorrect) },
  ];
}

export function computeTopicActivity(stats: StatDoc[]) {
  const map = new Map<string, number>();

  for (const s of stats) {
    map.set(s.topic, (map.get(s.topic) || 0) + 1);
  }

  return Array.from(map.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);
}

export function computeStudents(stats: StatDoc[]) {
  const map = new Map<string, Omit<StudentRow, "ranking">>();

  for (const s of stats) {
    const prev = map.get(s.user_id);
    if (!prev) {
      map.set(s.user_id, {
        user_id: s.user_id,
        name: s.name,
        quizzes: 1,
        correct: s.correct || 0,
        total: s.total || 0,
        accuracy: 0,
      });
    } else {
      prev.quizzes += 1;
      prev.correct += s.correct || 0;
      prev.total += s.total || 0;
    }
  }

  const rows = Array.from(map.values()).map((r) => ({
    ...r,
    accuracy: r.total > 0 ? r.correct / r.total : 0,
  }));

  rows.sort((a, b) => b.accuracy - a.accuracy);
  return rows.map((r, i) => ({ ...r, ranking: i + 1 }));
}

export function computeUserTimeSeries(stats: StatDoc[], userId: string) {
  const map = new Map<string, number>();

  for (const s of stats) {
    if (s.user_id !== userId) continue;
    const d = toDate(s.timestamp);
    if (!d) continue;
    const key = d.toISOString().slice(0, 10);
    map.set(key, (map.get(key) || 0) + 1);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, count]) => ({ date, count }));
}