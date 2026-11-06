"use client";

import { useSyncExternalStore } from "react";

import { createLocalStore } from "@/features/quiz/local-store";
import { dayKey } from "@/features/quiz/progress/record";

import type { PmRecord } from "./record";
import {
  EMPTY_PM_RECORD,
  emptyPmRecord,
  parsePmRecord,
  withoutAttempt,
  withScore,
  withSolved,
} from "./record";

/**
 * 午後の過去問題の記録の保存先。
 *
 * 午前や書き下ろしの問題の学習記録（progress/）とは別のキーにしてある。あちらは 1 問ごとの正誤を
 * 持つ形で、自己採点の点数とは形が違うため。
 */
export const PM_RECORD_KEY = "exam-prep:pm-past:v1";

const load = (): PmRecord => {
  if (typeof window === "undefined") return emptyPmRecord();
  try {
    const raw = window.localStorage.getItem(PM_RECORD_KEY);
    return raw === null ? emptyPmRecord() : parsePmRecord(JSON.parse(raw));
  } catch {
    // 壊れた JSON、あるいは参照拒否。記録が無いものとして続ける。
    return emptyPmRecord();
  }
};

const save = (record: PmRecord): void => {
  try {
    window.localStorage.setItem(PM_RECORD_KEY, JSON.stringify(record));
  } catch {
    // 容量超過や書き込み拒否。この回のあいだは画面の中だけで残る。
  }
};

const remove = (): void => {
  try {
    window.localStorage.removeItem(PM_RECORD_KEY);
  } catch {
    // 消せなくても画面側は空として動く。
  }
};

const store = createLocalStore<PmRecord>({ storageKey: PM_RECORD_KEY, load, save, remove });

const today = (): string => dayKey(new Date());

export const pmRecordStore = {
  subscribe: store.subscribe,
  snapshot: store.snapshot,
  serverSnapshot: (): PmRecord => EMPTY_PM_RECORD,
  markSolved: (id: string): void => store.set(withSolved(store.snapshot(), id, today())),
  setScore: (id: string, score: number | undefined): void =>
    store.set(withScore(store.snapshot(), id, score, today())),
  unmark: (id: string): void => store.set(withoutAttempt(store.snapshot(), id)),
  clear: store.reset,
};

/** 保存された記録を読む。別タブでの更新にも追従する。 */
export const usePmRecord = (): PmRecord =>
  useSyncExternalStore(
    pmRecordStore.subscribe,
    pmRecordStore.snapshot,
    pmRecordStore.serverSnapshot,
  );
