"use client";

import { useSyncExternalStore } from "react";

import { createLocalStore } from "@/features/quiz/local-store";

/**
 * 書き起こした午後の問題に書いた答え。問題 ID → 欄の名前 → 書いた答え。
 *
 * 解いた記録・点数（store.ts）とは別のキーに置く。書いた答えは長くなりうるので、
 * 点数の一覧を読むたびに一緒に読まなくて済むようにするため。
 */
export type PmAnswers = Record<string, Record<string, string>>;

export const PM_ANSWERS_KEY = "exam-prep:pm-past-answers:v1";

const EMPTY: PmAnswers = {};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** 保存された値を読む。形の合わない項目は捨てる。 */
export const parsePmAnswers = (raw: unknown): PmAnswers => {
  if (!isObject(raw)) return {};
  const answers: PmAnswers = {};
  for (const [id, slots] of Object.entries(raw)) {
    if (!isObject(slots)) continue;
    const kept: Record<string, string> = {};
    for (const [key, value] of Object.entries(slots)) {
      if (typeof value === "string") kept[key] = value;
    }
    answers[id] = kept;
  }
  return answers;
};

/** 欄 1 つの答えを書き換える。空にしたら欄ごと外す。 */
export const withAnswer = (
  answers: PmAnswers,
  id: string,
  key: string,
  value: string,
): PmAnswers => {
  const { [key]: _, ...rest } = answers[id] ?? {};
  return { ...answers, [id]: value === "" ? rest : { ...rest, [key]: value } };
};

/** 1 問分の答えを全部消す。 */
export const withoutAnswers = (answers: PmAnswers, id: string): PmAnswers => {
  const { [id]: _, ...rest } = answers;
  return rest;
};

/** 1 問のうち、渡した欄の答えだけを消す（× を付けた欄だけ解き直すとき）。 */
export const withoutSlotAnswers = (answers: PmAnswers, id: string, keys: string[]): PmAnswers => {
  const kept = Object.fromEntries(
    Object.entries(answers[id] ?? {}).filter(([key]) => !keys.includes(key)),
  );
  return { ...answers, [id]: kept };
};

const load = (): PmAnswers => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PM_ANSWERS_KEY);
    return raw === null ? {} : parsePmAnswers(JSON.parse(raw));
  } catch {
    // 壊れた JSON、あるいは参照拒否。答えが無いものとして続ける。
    return {};
  }
};

const save = (answers: PmAnswers): void => {
  try {
    window.localStorage.setItem(PM_ANSWERS_KEY, JSON.stringify(answers));
  } catch {
    // 容量超過や書き込み拒否。この回のあいだは画面の中だけで残る。
  }
};

const remove = (): void => {
  try {
    window.localStorage.removeItem(PM_ANSWERS_KEY);
  } catch {
    // 消せなくても画面側は空として動く。
  }
};

const store = createLocalStore<PmAnswers>({ storageKey: PM_ANSWERS_KEY, load, save, remove });

export const pmAnswerStore = {
  subscribe: store.subscribe,
  snapshot: store.snapshot,
  serverSnapshot: (): PmAnswers => EMPTY,
  set: (id: string, key: string, value: string): void =>
    store.set(withAnswer(store.snapshot(), id, key, value)),
  clearProblem: (id: string): void => store.set(withoutAnswers(store.snapshot(), id)),
  clearSlots: (id: string, keys: string[]): void =>
    store.set(withoutSlotAnswers(store.snapshot(), id, keys)),
  clear: store.reset,
};

export const usePmAnswers = (): PmAnswers =>
  useSyncExternalStore(
    pmAnswerStore.subscribe,
    pmAnswerStore.snapshot,
    pmAnswerStore.serverSnapshot,
  );
