"use client";

import { useEffect, useState } from "react";

/** 解答欄の幅（px）。狭すぎると選ぶ欄が切れ、広すぎると問題文が読みにくくなる。 */
export const ANSWER_WIDTH_MIN = 320;
export const ANSWER_WIDTH_MAX = 900;
const DEFAULT_ANSWER_WIDTH = 400;
/** 問題文の側に最低限残す幅。 */
const BODY_WIDTH_MIN = 360;

/**
 * 幅を端の値に収める。right は解答欄の右端の位置（px）。
 * 右にメモの枠が開いていればその左端になるので、問題文に残す幅もそこから測る。
 */
const clampAnswerWidth = (width: number, right?: number): number => {
  const edge = right ?? (typeof window === "undefined" ? undefined : window.innerWidth);
  const max =
    edge === undefined
      ? ANSWER_WIDTH_MAX
      : Math.min(ANSWER_WIDTH_MAX, Math.max(ANSWER_WIDTH_MIN, edge - BODY_WIDTH_MIN));
  return Math.min(max, Math.max(ANSWER_WIDTH_MIN, Math.round(width)));
};

/** 前に合わせた幅を読む。読めなければ既定の幅。端末ごとの好みなので localStorage で足りる。 */
const loadAnswerWidth = (storageKey: string): number => {
  try {
    const saved = Number(window.localStorage.getItem(storageKey));
    return saved > 0 ? clampAnswerWidth(saved) : DEFAULT_ANSWER_WIDTH;
  } catch {
    return DEFAULT_ANSWER_WIDTH;
  }
};

const saveAnswerWidth = (storageKey: string, width: number): void => {
  try {
    window.localStorage.setItem(storageKey, String(width));
  } catch {
    // 保存できなくても、この画面のあいだは合わせた幅のまま使える。
  }
};

export type AnswerWidth = {
  width: number;
  /** 境目をつまんで動かしている最中か。 */
  dragging: boolean;
  /** つまみ始める。right はそのときの解答欄の右端の位置（px）。 */
  startDrag: (right: number) => void;
  /** キーで少しずつ広げる・狭める（正で広がる）。right は解答欄の右端の位置（px）。 */
  nudge: (delta: number, right: number) => void;
};

/**
 * 左に問題文・右に解答欄の画面で、解答欄の幅を持つ。
 * 境目をつまんで動かしている間は画面の中だけで変え、手を離したときに storageKey へ覚える。
 *
 * 幅は「解答欄の右端からポインタまで」で決まる。右端は画面の右端とは限らない
 * （午後の過去問題では、さらに右にメモの枠が開く）ので、つまみ始めたときの位置を受け取る。
 * メモの枠は解答欄をつまんでいる間は動かないので、右端も動かない。
 */
export const useAnswerWidth = (storageKey: string): AnswerWidth => {
  const [width, setWidth] = useState(() => loadAnswerWidth(storageKey));
  // つまんでいる間の、解答欄の右端。つまんでいないときは null。
  const [dragRight, setDragRight] = useState<number | null>(null);
  const dragging = dragRight !== null;

  useEffect(() => {
    if (dragRight === null) return;
    const onMove = (event: PointerEvent): void => {
      event.preventDefault();
      setWidth(clampAnswerWidth(dragRight - event.clientX, dragRight));
    };
    const onUp = (): void => setDragRight(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragRight]);

  useEffect(() => {
    if (!dragging) saveAnswerWidth(storageKey, width);
  }, [dragging, storageKey, width]);

  const nudge = (delta: number, right: number) =>
    setWidth((prev) => clampAnswerWidth(prev + delta, right));
  return { width, dragging, startDrag: setDragRight, nudge };
};
