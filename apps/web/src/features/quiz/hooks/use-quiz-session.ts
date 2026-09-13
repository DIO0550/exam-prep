"use client";

import { useCallback, useMemo, useState } from "react";
import type { Attempt, QuizItem } from "../stats";
import { formatElapsed, summarize } from "../stats";
import type { Question } from "../types";

export type Screen = "home" | "quiz" | "explain" | "result" | "review";

/** 解説を問題と同じ画面に出すか、解答後に解説画面へ移るか。 */
export type FeedbackMode = "inline" | "page";

export const REVIEW_FILTERS = ["すべて", "不正解のみ", "フラグ", "苦手登録"] as const;
export type ReviewFilter = (typeof REVIEW_FILTERS)[number];

const freshAttempt = (): Attempt => ({
  picked: null,
  revealed: false,
  flagged: false,
  weak: false,
  excluded: [],
});

export const useQuizSession = (questions: Question[]) => {
  const [screen, setScreen] = useState<Screen>("home");
  const [feedback, setFeedbackMode] = useState<FeedbackMode>("inline");
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<QuizItem[]>(() =>
    questions.map((question) => ({ question, attempt: freshAttempt() })),
  );
  const [filter, setFilter] = useState<ReviewFilter>("すべて");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState("—");

  // 収録回を切り替えたら解答状況を捨てて学習ホームへ戻す。
  // 描画中に state を直すのは、回が変わった最初の描画で古い解答を見せないため。
  const [loadedFor, setLoadedFor] = useState(questions);
  if (loadedFor !== questions) {
    setLoadedFor(questions);
    setItems(questions.map((question) => ({ question, attempt: freshAttempt() })));
    setIndex(0);
    setScreen("home");
    setStartedAt(null);
    setElapsed("—");
  }

  const current = items[index];
  const summary = useMemo(() => summarize(items), [items]);

  /** 今の問題の解答状況だけを差し替える。 */
  const patchCurrent = useCallback(
    (patch: (attempt: Attempt, question: Question) => Partial<Attempt>) => {
      setItems((prev) =>
        prev.map((item, i) =>
          i === index
            ? { ...item, attempt: { ...item.attempt, ...patch(item.attempt, item.question) } }
            : item,
        ),
      );
    },
    [index],
  );

  /** 解答をすべて捨てて 1 問目から始める。フラグと苦手登録は学習記録なので残す。 */
  const start = useCallback(() => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        attempt: { ...item.attempt, picked: null, revealed: false, excluded: [] },
      })),
    );
    setIndex(0);
    setScreen("quiz");
    setStartedAt(Date.now());
  }, []);

  /** 選択肢を選ぶ。選んだ時点で正誤が確定し、間違えた問題は苦手登録に入る。 */
  const pick = useCallback(
    (choice: number) => {
      if (current?.attempt.revealed) return;
      patchCurrent((attempt, question) => ({
        picked: choice,
        revealed: true,
        weak: attempt.weak || choice !== question.answer,
      }));
      if (feedback === "page") setScreen("explain");
    },
    [current, feedback, patchCurrent],
  );

  /** 明らかに違う選択肢を消し込む。 */
  const toggleExclude = useCallback(
    (choice: number) => {
      patchCurrent((attempt) => ({
        excluded: attempt.excluded.includes(choice)
          ? attempt.excluded.filter((c) => c !== choice)
          : [...attempt.excluded, choice],
      }));
    },
    [patchCurrent],
  );

  const toggleFlag = useCallback(() => {
    patchCurrent((attempt) => ({ flagged: !attempt.flagged }));
  }, [patchCurrent]);

  const toggleWeak = useCallback(() => {
    patchCurrent((attempt) => ({ weak: !attempt.weak }));
  }, [patchCurrent]);

  const goTo = useCallback((next: number) => {
    setIndex(next);
    setScreen("quiz");
  }, []);

  const goPrev = useCallback(() => {
    setIndex((prev) => Math.max(0, prev - 1));
    setScreen("quiz");
  }, []);

  /** 次の問題へ。最後の問題なら結果画面に移り、所要時間を確定する。 */
  const goNext = useCallback(() => {
    if (index + 1 >= items.length) {
      setElapsed(formatElapsed(startedAt ? Date.now() - startedAt : 0));
      setScreen("result");
      return;
    }
    setIndex(index + 1);
    setScreen("quiz");
  }, [index, items.length, startedAt]);

  /** 解説の出し方を切り替える。今見ている画面も、切り替え先に合わせて寄せる。 */
  const setFeedback = useCallback(
    (mode: FeedbackMode) => {
      setFeedbackMode(mode);
      if (mode === "inline" && screen === "explain") setScreen("quiz");
      if (mode === "page" && screen === "quiz" && current?.attempt.revealed) setScreen("explain");
    },
    [current, screen],
  );

  return {
    screen,
    setScreen,
    feedback,
    setFeedback,
    index,
    items,
    current,
    summary,
    elapsed,
    filter,
    setFilter,
    isLast: index + 1 >= items.length,
    start,
    pick,
    toggleExclude,
    toggleFlag,
    toggleWeak,
    goTo,
    goPrev,
    goNext,
  };
};

export type QuizSession = ReturnType<typeof useQuizSession>;
