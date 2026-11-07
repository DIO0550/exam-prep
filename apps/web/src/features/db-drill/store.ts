"use client";

import { useSyncExternalStore } from "react";

import { createLocalStore } from "@/features/quiz/local-store";
import { dayKey } from "@/features/quiz/progress/record";

/** 答え合わせをした結果。最後に答え合わせをしたときのものだけを持つ。 */
export type DbResult = {
  correct: number;
  total: number;
  /** 答え合わせをした日（YYYY-MM-DD）。 */
  on: string;
};

/**
 * SQL・表の穴埋めドリルの記録。書いた答え（問題 ID → 空欄 → 答え）と、答え合わせの結果。
 * 演習（progress/）や午後過去問（pm-past/）とは形が違うので、別のキーに置く。
 */
export type DbDrillRecord = {
  answers: Record<string, Record<string, string>>;
  results: Record<string, DbResult>;
};

export const DB_DRILL_KEY = "exam-prep:db-drill:v1";

const EMPTY: DbDrillRecord = { answers: {}, results: {} };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** 保存された値を読む。形の合わない項目は 1 件ずつ捨てる。 */
export const parseDbDrillRecord = (raw: unknown): DbDrillRecord => {
  if (!isObject(raw)) return { answers: {}, results: {} };
  const answers: DbDrillRecord["answers"] = {};
  if (isObject(raw.answers)) {
    for (const [id, blanks] of Object.entries(raw.answers)) {
      if (!isObject(blanks)) continue;
      const kept: Record<string, string> = {};
      for (const [key, value] of Object.entries(blanks)) {
        if (typeof value === "string") kept[key] = value;
      }
      answers[id] = kept;
    }
  }
  const results: DbDrillRecord["results"] = {};
  if (isObject(raw.results)) {
    for (const [id, result] of Object.entries(raw.results)) {
      if (!isObject(result)) continue;
      const { correct, total, on } = result;
      if (!isCount(correct) || !isCount(total) || correct > total) continue;
      if (typeof on !== "string" || !DATE.test(on)) continue;
      results[id] = { correct, total, on };
    }
  }
  return { answers, results };
};

/** 欄 1 つの答えを書き換える。空にしたら欄ごと外す。 */
export const withAnswer = (
  record: DbDrillRecord,
  id: string,
  key: string,
  value: string,
): DbDrillRecord => {
  const { [key]: _, ...rest } = record.answers[id] ?? {};
  return {
    ...record,
    answers: { ...record.answers, [id]: value === "" ? rest : { ...rest, [key]: value } },
  };
};

export const withResult = (record: DbDrillRecord, id: string, result: DbResult): DbDrillRecord => ({
  ...record,
  results: { ...record.results, [id]: result },
});

/** 1 問分の書いた答えを消す（答え合わせの結果は残す）。 */
export const withoutAnswers = (record: DbDrillRecord, id: string): DbDrillRecord => {
  const { [id]: _, ...rest } = record.answers;
  return { ...record, answers: rest };
};

const load = (): DbDrillRecord => {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(DB_DRILL_KEY);
    return raw === null ? { answers: {}, results: {} } : parseDbDrillRecord(JSON.parse(raw));
  } catch {
    // 壊れた JSON、あるいは参照拒否。記録が無いものとして続ける。
    return { answers: {}, results: {} };
  }
};

const save = (record: DbDrillRecord): void => {
  try {
    window.localStorage.setItem(DB_DRILL_KEY, JSON.stringify(record));
  } catch {
    // 容量超過や書き込み拒否。この回のあいだは画面の中だけで残る。
  }
};

const remove = (): void => {
  try {
    window.localStorage.removeItem(DB_DRILL_KEY);
  } catch {
    // 消せなくても画面側は空として動く。
  }
};

const store = createLocalStore<DbDrillRecord>({ storageKey: DB_DRILL_KEY, load, save, remove });

export const dbDrillStore = {
  subscribe: store.subscribe,
  snapshot: store.snapshot,
  serverSnapshot: (): DbDrillRecord => EMPTY,
  setAnswer: (id: string, key: string, value: string): void =>
    store.set(withAnswer(store.snapshot(), id, key, value)),
  saveResult: (id: string, correct: number, total: number): void =>
    store.set(withResult(store.snapshot(), id, { correct, total, on: dayKey(new Date()) })),
  clearAnswers: (id: string): void => store.set(withoutAnswers(store.snapshot(), id)),
  clear: store.reset,
};

export const useDbDrillRecord = (): DbDrillRecord =>
  useSyncExternalStore(dbDrillStore.subscribe, dbDrillStore.snapshot, dbDrillStore.serverSnapshot);
