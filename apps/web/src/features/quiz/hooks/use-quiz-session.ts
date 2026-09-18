"use client";

import { useCallback, useMemo, useState } from "react";

import { choiceOrder } from "../choice-order";
import type { Stroke } from "../notes/note";
import { EMPTY_NOTE, noteOf } from "../notes/note";
import { noteStore } from "../notes/store";
import { attemptOf } from "../progress/record";
import { progressStore } from "../progress/store";
import type { Attempt, QuizItem } from "../stats";
import { formatElapsed, summarize } from "../stats";
import type { Question } from "../types";
import { sourceId } from "../types";
import { useNotes } from "./use-notes";
import { useProgress } from "./use-progress";

export type Screen = "home" | "quiz" | "explain" | "result" | "review";

/** 解説を問題と同じ画面に出すか、解答後に解説画面へ移るか。 */
export type FeedbackMode = "inline" | "page";

export const REVIEW_FILTERS = ["すべて", "不正解のみ", "フラグ", "苦手登録"] as const;
export type ReviewFilter = (typeof REVIEW_FILTERS)[number];

/**
 * 演習画面の状態。
 *
 * 解答状況（選んだ選択肢・フラグ・苦手登録）は progressStore が持ち、リロードしても残る。
 * ここが持つのは、その回を今どう見ているか（画面・何問目・計測）だけ。
 */
export const useQuizSession = (questions: Question[]) => {
  const record = useProgress();
  const notes = useNotes();
  const [screen, setScreen] = useState<Screen>("home");
  const [feedback, setFeedbackMode] = useState<FeedbackMode>("inline");
  const [notesOpen, setNotesOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [filter, setFilter] = useState<ReviewFilter>("すべて");
  const [examIndex, setExamIndex] = useState(0);
  const [closedGroups, setClosedGroups] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState("—");

  const items = useMemo<QuizItem[]>(
    () =>
      questions.map((question) => ({
        question,
        attempt: attemptOf(record, sourceId(question.source)),
      })),
    [questions, record],
  );

  // 収録回を切り替えたら、見ている位置と計測をその回のものに戻して学習ホームへ出す。
  // 解答状況は問題ごとに保存してあるので捨てない（戻ってくればその続きから解ける）。
  // 描画中に state を直すのは、回が変わった最初の描画で前の回の位置を見せないため。
  const [loadedFor, setLoadedFor] = useState(questions);
  if (loadedFor !== questions) {
    setLoadedFor(questions);
    setIndex(0);
    setScreen("home");
    setStartedAt(null);
    setElapsed("—");
  }

  const current = items[index];
  const summary = useMemo(() => summarize(items), [items]);

  // 今の問題の選択肢をどの順で出すか。値は原本での添字で、記録した解答はこの並びに影響されない。
  // keepChoiceOrder が付いた問題だけは、設定にかかわらず原本の並びのまま出す。
  const order = useMemo(
    () =>
      current
        ? choiceOrder(
            current.question.choices.length,
            sourceId(current.question.source),
            record.shuffleSeed,
            record.shuffle && !current.question.keepChoiceOrder,
          )
        : [],
    [current, record.shuffle, record.shuffleSeed],
  );

  // 今の問題のメモ。書き込み先も問題ごとなので、ここで問題 ID を閉じ込めておく。
  const questionId = current ? sourceId(current.question.source) : null;
  const note = questionId ? noteOf(notes, questionId) : EMPTY_NOTE;

  const toggleNotes = useCallback(() => setNotesOpen((open) => !open), []);
  /** メモが 1 つでもあるか。学習ホームの「学習記録を消す」を出すかの判断に使う。 */
  const hasNotes = Object.keys(notes.notes).length > 0;

  const setNoteText = useCallback(
    (text: string) => {
      if (questionId) noteStore.setText(questionId, text);
    },
    [questionId],
  );

  const addStroke = useCallback(
    (stroke: Stroke) => {
      if (questionId) noteStore.addStroke(questionId, stroke);
    },
    [questionId],
  );

  const undoStroke = useCallback(() => {
    if (questionId) noteStore.undoStroke(questionId);
  }, [questionId]);

  const clearSketch = useCallback(() => {
    if (questionId) noteStore.clearSketch(questionId);
  }, [questionId]);

  /** 今の問題の解答状況だけを差し替える。 */
  const patchCurrent = useCallback(
    (patch: Partial<Attempt>) => {
      if (!current) return;
      progressStore.patchAttempt(sourceId(current.question.source), patch);
    },
    [current],
  );

  /** 未解答の最初の問題から始める。全問解き終わっていれば 1 問目から見直す。 */
  const start = useCallback(() => {
    const next = items.findIndex((item) => !item.attempt.revealed);
    setIndex(next < 0 ? 0 : next);
    setScreen("quiz");
    setStartedAt(Date.now());
  }, [items]);

  /** 解答をすべて捨てて 1 問目から始める。フラグと苦手登録は学習記録なので残す。 */
  const restart = useCallback(() => {
    progressStore.restart(questions.map((question) => sourceId(question.source)));
    setIndex(0);
    setScreen("quiz");
    setStartedAt(Date.now());
  }, [questions]);

  /** 選択肢を選ぶ。選んだ時点で正誤が確定し、間違えた問題は苦手登録に入る。 */
  const pick = useCallback(
    (choice: number) => {
      if (!current || current.attempt.revealed) return;
      progressStore.answer(
        sourceId(current.question.source),
        choice,
        choice === current.question.answer,
      );
      if (feedback === "page") setScreen("explain");
    },
    [current, feedback],
  );

  /** 明らかに違う選択肢を消し込む。 */
  const toggleExclude = useCallback(
    (choice: number) => {
      const excluded = current?.attempt.excluded ?? [];
      patchCurrent({
        excluded: excluded.includes(choice)
          ? excluded.filter((c) => c !== choice)
          : [...excluded, choice],
      });
    },
    [current, patchCurrent],
  );

  const toggleFlag = useCallback(() => {
    patchCurrent({ flagged: !current?.attempt.flagged });
  }, [current, patchCurrent]);

  const toggleWeak = useCallback(() => {
    patchCurrent({ weak: !current?.attempt.weak });
  }, [current, patchCurrent]);

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

  const toggleGroup = useCallback((group: string) => {
    setClosedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group],
    );
  }, []);

  return {
    screen,
    setScreen,
    feedback,
    setFeedback,
    shuffle: record.shuffle,
    setShuffle: progressStore.setShuffle,
    textScale: record.textScale,
    setTextScale: progressStore.setTextScale,
    order,
    note,
    hasNotes,
    notesOpen,
    toggleNotes,
    setNoteText,
    addStroke,
    undoStroke,
    clearSketch,
    index,
    items,
    current,
    summary,
    elapsed,
    filter,
    setFilter,
    examIndex,
    setExamIndex,
    closedGroups,
    toggleGroup,
    isLast: index + 1 >= items.length,
    start,
    restart,
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
