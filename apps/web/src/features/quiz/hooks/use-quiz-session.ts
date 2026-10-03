"use client";

import { useCallback, useMemo, useState } from "react";

import { isMultipleChoice, matchesAnswer, selectionsOf, toggleSelection } from "../answers";
import { choiceOrder } from "../choice-order";
import type { Stroke } from "../notes/note";
import { EMPTY_NOTE, noteOf } from "../notes/note";
import { noteStore } from "../notes/store";
import type { AnswerUndo } from "../progress/record";
import { attemptOf } from "../progress/record";
import { progressStore } from "../progress/store";
import type { Attempt, QuizItem } from "../stats";
import { formatElapsed, isCorrect, summarize } from "../stats";
import type { Question } from "../types";
import { sourceId } from "../types";
import { useNotes } from "./use-notes";
import { useProgress } from "./use-progress";

export type Screen = "home" | "quiz" | "explain" | "result" | "review" | "vocab";

/** 解説を問題と同じ画面に出すか、解答後に解説画面へ移るか。 */
export type FeedbackMode = "inline" | "page";

export const REVIEW_FILTERS = ["すべて", "不正解のみ", "フラグ", "苦手登録"] as const;
export type ReviewFilter = (typeof REVIEW_FILTERS)[number];

/** 解き直しで絞り込む問題。間違えた問題か、苦手登録した問題。 */
export const RETRY_KINDS = ["wrong", "weak"] as const;
export type RetryKind = (typeof RETRY_KINDS)[number];

export const RETRY_LABELS: Record<RetryKind, string> = {
  wrong: "間違えた問題",
  weak: "苦手登録した問題",
};

/** 解き直しの対象。始めた時点の問題 ID で固定する（解くたびに対象が増減しないように）。 */
type Retry = { kind: RetryKind; ids: string[] };

const isWrong = (item: QuizItem): boolean => item.attempt.revealed && !isCorrect(item);

/** 解き直しの対象になる問題を、並びを保ったまま選ぶ。 */
const retryTargets = (items: QuizItem[], kind: RetryKind): QuizItem[] =>
  items.filter((item) => (kind === "wrong" ? isWrong(item) : item.attempt.weak));

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
  const [closedGroups, setClosedGroups] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState("—");
  // 最後にした解答を取り消すための値。取り消せるのはこの 1 件だけ。
  const [lastAnswer, setLastAnswer] = useState<AnswerUndo | null>(null);
  // 解き直しの最中なら、その対象。null なら回の全問を出す。
  const [retry, setRetry] = useState<Retry | null>(null);
  // 解き直しで開いた問題。前回の解答は、開いたときに初めて消す（途中でやめても、
  // まだ開いていない問題の前回の結果は残しておくため）。
  const [visited, setVisited] = useState<string[]>([]);

  const allItems = useMemo<QuizItem[]>(
    () =>
      questions.map((question) => ({
        question,
        attempt: attemptOf(record, sourceId(question.source)),
      })),
    [questions, record],
  );

  // 画面に出す問題。解き直しの最中は対象だけに絞る。添字（index）はこの並びでの位置。
  // まだ開いていない問題は、保存してある前回の解答を残したまま、画面上は未解答として出す
  // （前回の解答で進み具合や正答率が埋まって見えないように）。書き込むのは開いた問題だけ。
  const items = useMemo<QuizItem[]>(() => {
    if (!retry) return allItems;
    const ids = new Set(retry.ids);
    return allItems
      .filter((item) => ids.has(sourceId(item.question.source)))
      .map((item) =>
        visited.includes(sourceId(item.question.source))
          ? item
          : { ...item, attempt: { ...item.attempt, picked: null, revealed: false, excluded: [] } },
      );
  }, [allItems, retry, visited]);

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
    setLastAnswer(null);
    setRetry(null);
    setVisited([]);
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

  /**
   * 問題を開く。解き直しの最中なら、その問題の前回の解答をここで消す。
   * 一度開いた問題は消さない（戻って見直したときに、今回の解答が消えないように）。
   */
  const enter = useCallback(
    (next: number) => {
      setIndex(next);
      setScreen("quiz");
      if (!retry) return;
      const item = items[next];
      if (!item) return;
      const id = sourceId(item.question.source);
      if (visited.includes(id)) return;
      setVisited((prev) => [...prev, id]);
      progressStore.clearAnswers([id]);
    },
    [items, retry, visited],
  );

  /** 画面を移る。学習ホームへ戻ったら、解き直しをやめて回の全問に戻す。 */
  const navigate = useCallback((next: Screen) => {
    if (next === "home") {
      setRetry(null);
      setVisited([]);
      setIndex(0);
    }
    setScreen(next);
  }, []);

  /** 今の範囲で、解き直しの対象になる問題の数。 */
  const retryCounts = useMemo<Record<RetryKind, number>>(
    () => ({
      wrong: retryTargets(items, "wrong").length,
      weak: retryTargets(items, "weak").length,
    }),
    [items],
  );

  /**
   * 間違えた問題・苦手登録した問題だけを解き直す。今出している範囲から絞るので、
   * 解き直しの結果からもう一度「間違えた問題だけ」を選べば、さらに絞り込める。
   */
  const startRetry = useCallback(
    (kind: RetryKind) => {
      const targets = retryTargets(items, kind);
      const first = targets[0];
      if (!first) return;
      const ids = targets.map((item) => sourceId(item.question.source));
      const firstId = sourceId(first.question.source);
      // 1 問目はここで消す。種もここで 1 度だけ進めて、シャッフル中なら前回と違う並びで出す。
      progressStore.restart([firstId]);
      setRetry({ kind, ids });
      setVisited([firstId]);
      setLastAnswer(null);
      setIndex(0);
      setScreen("quiz");
      setStartedAt(Date.now());
    },
    [items],
  );

  /** 未解答の最初の問題から始める。全問解き終わっていれば 1 問目から見直す。 */
  const start = useCallback(() => {
    const next = items.findIndex((item) => !item.attempt.revealed);
    setIndex(next < 0 ? 0 : next);
    setScreen("quiz");
    setStartedAt(Date.now());
  }, [items]);

  /**
   * 解答をすべて捨てて 1 問目から始める。フラグと苦手登録は学習記録なので残す。
   * 解き直しの最中なら、その対象だけをやり直す。
   */
  const restart = useCallback(() => {
    const ids = items.map((item) => sourceId(item.question.source));
    progressStore.restart(ids);
    if (retry) setVisited(ids);
    setLastAnswer(null);
    setIndex(0);
    setScreen("quiz");
    setStartedAt(Date.now());
  }, [items, retry]);

  /** 単一選択は即採点。複数選択は確定前の選択として保存する。 */
  const pick = useCallback(
    (choice: number) => {
      if (!current || current.attempt.revealed) {
        return;
      }
      if (current.attempt.excluded.includes(choice)) {
        return;
      }
      if (isMultipleChoice(current.question)) {
        patchCurrent({ picked: toggleSelection(current.attempt.picked, choice) });
        return;
      }
      setLastAnswer(
        progressStore.answer(
          sourceId(current.question.source),
          choice,
          matchesAnswer(current.question.answer, choice),
        ),
      );
      if (feedback === "page") {
        setScreen("explain");
      }
    },
    [current, feedback, patchCurrent],
  );

  const submit = useCallback(() => {
    if (!current || current.attempt.revealed || !isMultipleChoice(current.question)) {
      return;
    }
    if (selectionsOf(current.attempt.picked).length === 0) {
      return;
    }
    setLastAnswer(
      progressStore.answer(
        sourceId(current.question.source),
        current.attempt.picked,
        matchesAnswer(current.question.answer, current.attempt.picked),
      ),
    );
    if (feedback === "page") {
      setScreen("explain");
    }
  }, [current, feedback]);

  /** 今の問題が、最後に解答した問題で、まだ取り消せるか。 */
  const canUndoPick =
    lastAnswer !== null &&
    questionId === lastAnswer.questionId &&
    current?.attempt.revealed === true;

  /** 押し間違えた解答を取り消して、選び直せる状態に戻す。 */
  const undoPick = useCallback(() => {
    if (!canUndoPick || !lastAnswer) return;
    progressStore.undoAnswer(lastAnswer);
    setLastAnswer(null);
    setScreen("quiz");
  }, [canUndoPick, lastAnswer]);

  /** 明らかに違う選択肢を消し込む。 */
  const toggleExclude = useCallback(
    (choice: number) => {
      const excluded = current?.attempt.excluded ?? [];
      const removing = !excluded.includes(choice);
      if (removing && current && !current.attempt.revealed && isMultipleChoice(current.question)) {
        patchCurrent({
          picked: selectionsOf(current.attempt.picked).filter((index) => index !== choice),
          excluded: [...excluded, choice],
        });
        return;
      }
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

  const goTo = enter;

  const goPrev = useCallback(() => {
    enter(Math.max(0, index - 1));
  }, [enter, index]);

  /** 次の問題へ。最後の問題なら結果画面に移り、所要時間を確定する。 */
  const goNext = useCallback(() => {
    if (index + 1 >= items.length) {
      setElapsed(formatElapsed(startedAt ? Date.now() - startedAt : 0));
      setScreen("result");
      return;
    }
    enter(index + 1);
  }, [enter, index, items.length, startedAt]);

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
    setScreen: navigate,
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
    closedGroups,
    toggleGroup,
    isLast: index + 1 >= items.length,
    /** 解き直しの最中なら、何を解き直しているか。 */
    retryKind: retry?.kind ?? null,
    retryCounts,
    startRetry,
    start,
    restart,
    pick,
    submit,
    canUndoPick,
    undoPick,
    toggleExclude,
    toggleFlag,
    toggleWeak,
    goTo,
    goPrev,
    goNext,
  };
};

export type QuizSession = ReturnType<typeof useQuizSession>;
