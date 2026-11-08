"use client";

import { useSyncExternalStore } from "react";

import { createLocalStore } from "@/features/quiz/local-store";

/**
 * 解答例と見比べて、欄ごとに自分で付けた ○（正解）・×（不正解）。問題 ID → 欄の名前 → 印。
 *
 * 記述の欄は機械では採点できないので、本人が付ける。記号の欄は選んだ記号で自動で決まるので、
 * 選んでいない（紙で解いた）ときだけ印を持つ。
 *
 * 書いた答え（answers.ts）・解いた記録と点数（store.ts）とは別のキーに置く。
 * 答えを消して解き直すときは、印もいっしょに消す。
 */
export type PmMark = "ok" | "ng";

export type PmMarks = Record<string, Record<string, PmMark>>;

export const PM_MARKS_KEY = "exam-prep:pm-past-marks:v1";

const EMPTY: PmMarks = {};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isMark = (value: unknown): value is PmMark => value === "ok" || value === "ng";

/** 保存された値を読む。形の合わない項目は捨てる。 */
export const parsePmMarks = (raw: unknown): PmMarks => {
  if (!isObject(raw)) return {};
  const marks: PmMarks = {};
  for (const [id, slots] of Object.entries(raw)) {
    if (!isObject(slots)) continue;
    const kept: Record<string, PmMark> = {};
    for (const [key, value] of Object.entries(slots)) {
      if (isMark(value)) kept[key] = value;
    }
    marks[id] = kept;
  }
  return marks;
};

/** 欄 1 つの印を付け直す。undefined を渡すと印を外す（まだ付けていない状態に戻す）。 */
export const withMark = (
  marks: PmMarks,
  id: string,
  key: string,
  mark: PmMark | undefined,
): PmMarks => {
  const { [key]: _, ...rest } = marks[id] ?? {};
  return { ...marks, [id]: mark === undefined ? rest : { ...rest, [key]: mark } };
};

/** 1 問の印を消す。keys を渡したら、その欄の印だけを消す。 */
export const withoutMarks = (marks: PmMarks, id: string, keys?: string[]): PmMarks => {
  if (keys === undefined) {
    const { [id]: _, ...rest } = marks;
    return rest;
  }
  const kept = Object.fromEntries(
    Object.entries(marks[id] ?? {}).filter(([key]) => !keys.includes(key)),
  );
  return { ...marks, [id]: kept };
};

const load = (): PmMarks => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PM_MARKS_KEY);
    return raw === null ? {} : parsePmMarks(JSON.parse(raw));
  } catch {
    // 壊れた JSON、あるいは参照拒否。印が無いものとして続ける。
    return {};
  }
};

const save = (marks: PmMarks): void => {
  try {
    window.localStorage.setItem(PM_MARKS_KEY, JSON.stringify(marks));
  } catch {
    // 容量超過や書き込み拒否。この回のあいだは画面の中だけで残る。
  }
};

const remove = (): void => {
  try {
    window.localStorage.removeItem(PM_MARKS_KEY);
  } catch {
    // 消せなくても画面側は空として動く。
  }
};

const store = createLocalStore<PmMarks>({ storageKey: PM_MARKS_KEY, load, save, remove });

export const pmMarkStore = {
  subscribe: store.subscribe,
  snapshot: store.snapshot,
  serverSnapshot: (): PmMarks => EMPTY,
  set: (id: string, key: string, mark: PmMark | undefined): void =>
    store.set(withMark(store.snapshot(), id, key, mark)),
  clearProblem: (id: string): void => store.set(withoutMarks(store.snapshot(), id)),
  clearSlots: (id: string, keys: string[]): void =>
    store.set(withoutMarks(store.snapshot(), id, keys)),
  clear: store.reset,
};

export const usePmMarks = (): PmMarks =>
  useSyncExternalStore(pmMarkStore.subscribe, pmMarkStore.snapshot, pmMarkStore.serverSnapshot);
