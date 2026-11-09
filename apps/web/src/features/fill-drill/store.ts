"use client";

import { useSyncExternalStore } from "react";

import { createLocalStore } from "@/features/quiz/local-store";
import { dayKey } from "@/features/quiz/progress/record";

/** 答え合わせをした結果。最後に答え合わせをしたときのものだけを持つ。 */
export type FillResult = {
  correct: number;
  total: number;
  /** 答え合わせをした日（YYYY-MM-DD）。 */
  on: string;
};

/**
 * 穴埋めドリルの記録。書いた答え（問題 ID → 空欄 → 答え）と、答え合わせの結果。
 * 演習（progress/）や午後過去問（pm-past/）とは形が違うので、別のキーに置く。
 * ドリルごと（SQL・表、ネットワーク）にも別のキーに置く。
 */
export type FillDrillRecord = {
  answers: Record<string, Record<string, string>>;
  results: Record<string, FillResult>;
};

const EMPTY: FillDrillRecord = { answers: {}, results: {} };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** 保存された値を読む。形の合わない項目は 1 件ずつ捨てる。 */
export const parseFillDrillRecord = (raw: unknown): FillDrillRecord => {
  if (!isObject(raw)) return { answers: {}, results: {} };
  const answers: FillDrillRecord["answers"] = {};
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
  const results: FillDrillRecord["results"] = {};
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
  record: FillDrillRecord,
  id: string,
  key: string,
  value: string,
): FillDrillRecord => {
  const { [key]: _, ...rest } = record.answers[id] ?? {};
  return {
    ...record,
    answers: { ...record.answers, [id]: value === "" ? rest : { ...rest, [key]: value } },
  };
};

export const withResult = (
  record: FillDrillRecord,
  id: string,
  result: FillResult,
): FillDrillRecord => ({
  ...record,
  results: { ...record.results, [id]: result },
});

/** 1 問分の書いた答えを消す（答え合わせの結果は残す）。 */
export const withoutAnswers = (record: FillDrillRecord, id: string): FillDrillRecord => {
  const { [id]: _, ...rest } = record.answers;
  return { ...record, answers: rest };
};

/** ドリル 1 つ分の記録の入れ物。画面はこれを通して読み書きする。 */
export type FillDrillStore = {
  subscribe: (listener: () => void) => () => void;
  snapshot: () => FillDrillRecord;
  serverSnapshot: () => FillDrillRecord;
  setAnswer: (id: string, key: string, value: string) => void;
  saveResult: (id: string, correct: number, total: number) => void;
  clearAnswers: (id: string) => void;
  clear: () => void;
};

/** storageKey の localStorage に記録を置く入れ物を作る。 */
export const createFillDrillStore = (storageKey: string): FillDrillStore => {
  const load = (): FillDrillRecord => {
    if (typeof window === "undefined") return EMPTY;
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw === null ? { answers: {}, results: {} } : parseFillDrillRecord(JSON.parse(raw));
    } catch {
      // 壊れた JSON、あるいは参照拒否。記録が無いものとして続ける。
      return { answers: {}, results: {} };
    }
  };

  const save = (record: FillDrillRecord): void => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(record));
    } catch {
      // 容量超過や書き込み拒否。この回のあいだは画面の中だけで残る。
    }
  };

  const remove = (): void => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // 消せなくても画面側は空として動く。
    }
  };

  const store = createLocalStore<FillDrillRecord>({ storageKey, load, save, remove });

  return {
    subscribe: store.subscribe,
    snapshot: store.snapshot,
    serverSnapshot: () => EMPTY,
    setAnswer: (id, key, value) => store.set(withAnswer(store.snapshot(), id, key, value)),
    saveResult: (id, correct, total) =>
      store.set(withResult(store.snapshot(), id, { correct, total, on: dayKey(new Date()) })),
    clearAnswers: (id) => store.set(withoutAnswers(store.snapshot(), id)),
    clear: store.reset,
  };
};

export const useFillDrillRecord = (store: FillDrillStore): FillDrillRecord =>
  useSyncExternalStore(store.subscribe, store.snapshot, store.serverSnapshot);
