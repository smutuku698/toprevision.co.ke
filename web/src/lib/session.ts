// SmartScore-style mastery tracking + localStorage progress persistence.
// This is deliberately simple (not a copy of IXL's proprietary algorithm):
// correct answers raise the score faster while streaking, gains shrink as you
// approach mastery, and misses cost more the higher your score is.

import { useSyncExternalStore } from "react";

export interface SkillProgress {
  skillId: string;
  smartScore: number; // 0-100
  bestStreak: number;
  questionsAnswered: number;
  correctAnswered: number;
  lastPlayedAt: number;
}

const STORAGE_KEY = "cbc-quizmaster:progress:v1";

type ProgressMap = Record<string, SkillProgress>;

function emptyProgress(skillId: string): SkillProgress {
  return { skillId, smartScore: 0, bestStreak: 0, questionsAnswered: 0, correctAnswered: 0, lastPlayedAt: 0 };
}

function readAll(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function writeAll(map: ProgressMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota/availability errors
  }
}

export function getSkillProgress(skillId: string): SkillProgress {
  const all = readAll();
  return all[skillId] ?? emptyProgress(skillId);
}

export function getAllProgress(): ProgressMap {
  return readAll();
}

// --- Reactive access (useSyncExternalStore) --------------------------------
// localStorage is an external system, so components read it through
// useSyncExternalStore rather than `useState` + `useEffect(() => setState(...))`.
// That avoids both a hydration mismatch (server has no localStorage) and the
// extra cascading render that a plain setState-in-effect would cause.

const snapshotCache = new Map<string, SkillProgress>();
const emptySnapshotCache = new Map<string, SkillProgress>();
const listeners = new Set<() => void>();

function getSnapshot(skillId: string): SkillProgress {
  let snap = snapshotCache.get(skillId);
  if (!snap) {
    snap = getSkillProgress(skillId);
    snapshotCache.set(skillId, snap);
  }
  return snap;
}

// useSyncExternalStore requires getServerSnapshot to return a referentially
// stable value across calls (it's never mutated, so caching by skillId is safe).
function getServerSnapshot(skillId: string): SkillProgress {
  let snap = emptySnapshotCache.get(skillId);
  if (!snap) {
    snap = emptyProgress(skillId);
    emptySnapshotCache.set(skillId, snap);
  }
  return snap;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSkillProgress(skillId: string): SkillProgress {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot(skillId),
    () => getServerSnapshot(skillId)
  );
}

export function saveSkillProgress(progress: SkillProgress) {
  const all = readAll();
  all[progress.skillId] = progress;
  writeAll(all);
  snapshotCache.set(progress.skillId, progress);
  for (const l of listeners) l();
}

export function nextSmartScore(score: number, correct: boolean, streak: number): number {
  if (correct) {
    const streakBonus = Math.min(streak, 6);
    const base = 6 + streakBonus;
    const diminish = 1 - score / 120; // gains shrink near mastery
    const gain = Math.max(2, Math.round(base * diminish));
    return Math.min(100, score + gain);
  }
  const penalty = 6 + Math.round((score / 100) * 6);
  return Math.max(0, score - penalty);
}

export function masteryLabel(score: number): { label: string; tone: "start" | "progress" | "close" | "mastered" } {
  if (score >= 100) return { label: "Mastered!", tone: "mastered" };
  if (score >= 80) return { label: "Almost there", tone: "close" };
  if (score >= 40) return { label: "Making progress", tone: "progress" };
  return { label: "Just starting", tone: "start" };
}

export function formatElapsed(seconds: number): { hr: string; min: string; sec: string } {
  const hr = Math.floor(seconds / 3600);
  const min = Math.floor((seconds % 3600) / 60);
  const sec = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { hr: pad(hr), min: pad(min), sec: pad(sec) };
}
