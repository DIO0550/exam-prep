"use client";

import { useCallback, useMemo, useState } from "react";

import type { Selection } from "../answers";
import type { AnswerUndo } from "../progress/record";
import { FRESH_ATTEMPT } from "../progress/record";
import { progressStore } from "../progress/store";
import type { Attempt } from "../stats";

/**
 * 解答状況の書き込み先。演習画面はこの形だけを見て書き込む。
 *
 * ふだんは学習記録（progressStore）へ書くが、ランダム出題では学習記録と切り離した
 * 使い捨ての入れ物（useScratchAttempts）へ書く。
 */
export type AttemptWriter = {
  /** 解答状況の一部を差し替える（フラグ・苦手登録・選択肢の消し込み）。 */
  patch: (questionId: string, patch: Partial<Attempt>) => void;
  /** 解答を記録する。返す値を undo に渡すと取り消せる。 */
  answer: (questionId: string, picked: Selection, correct: boolean) => AnswerUndo;
  undo: (undo: AnswerUndo) => void;
  /** 指定した問題の解答だけを消す。 */
  clear: (questionIds: string[]) => void;
  /** 指定した問題の解答を消して、やり直しを始める。 */
  restart: (questionIds: string[]) => void;
};

/** 学習記録へ書く。リロードしても残り、回ごとの正答率・苦手登録・連続学習日数に効く。 */
export const PROGRESS_WRITER: AttemptWriter = {
  patch: progressStore.patchAttempt,
  answer: (questionId, picked, correct) => progressStore.answer(questionId, picked, correct),
  undo: progressStore.undoAnswer,
  clear: progressStore.clearAnswers,
  restart: progressStore.restart,
};

/** 解答だけを消す。フラグと苦手の印は残す（学習記録の clearAnswers と同じ）。 */
const withCleared = (attempts: Record<string, Attempt>, ids: string[]): Record<string, Attempt> =>
  Object.fromEntries(
    Object.entries(attempts).map(([id, attempt]) => [
      id,
      ids.includes(id) ? { ...attempt, picked: null, revealed: false, excluded: [] } : attempt,
    ]),
  );

/**
 * 学習記録と切り離した解答状況。ランダム出題で使う。
 *
 * メモリにだけ持ち、保存しない。ここで解いた結果は回ごとの正答率にも苦手登録にも
 * 連続学習日数にも入らず、ランダム出題をやめた時点で捨てる。
 */
export const useScratchAttempts = () => {
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({});

  const writer = useMemo<AttemptWriter>(
    () => ({
      patch: (questionId, patch) =>
        setAttempts((prev) => ({
          ...prev,
          [questionId]: { ...(prev[questionId] ?? FRESH_ATTEMPT), ...patch },
        })),
      answer: (questionId, picked, correct) => {
        const before = attempts[questionId] ?? FRESH_ATTEMPT;
        setAttempts((prev) => {
          const attempt = prev[questionId] ?? FRESH_ATTEMPT;
          return {
            ...prev,
            // 学習記録と同じく、間違えたら苦手の印を付ける（このランダム出題の中だけで効く）。
            [questionId]: { ...attempt, picked, revealed: true, weak: attempt.weak || !correct },
          };
        });
        return { questionId, weak: before.weak, days: [] };
      },
      undo: ({ questionId, weak }) =>
        setAttempts((prev) => {
          const attempt = prev[questionId];
          if (!attempt?.revealed) return prev;
          return { ...prev, [questionId]: { ...attempt, picked: null, revealed: false, weak } };
        }),
      clear: (questionIds) => setAttempts((prev) => withCleared(prev, questionIds)),
      restart: (questionIds) => setAttempts((prev) => withCleared(prev, questionIds)),
    }),
    [attempts],
  );

  /** すべて捨てる。ランダム出題を始めるときと、やめるときに呼ぶ。 */
  const reset = useCallback(() => setAttempts({}), []);

  return { attempts, writer, reset };
};
