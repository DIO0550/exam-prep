"use client";

import { useEffect, useState } from "react";

/** 解答欄の幅（px）。狭すぎると選ぶ欄が切れ、広すぎると問題文が読みにくくなる。 */
export const ANSWER_WIDTH_MIN = 320;
export const ANSWER_WIDTH_MAX = 900;
const DEFAULT_ANSWER_WIDTH = 400;
/** 問題文の側に最低限残す幅。 */
const BODY_WIDTH_MIN = 360;

const clampAnswerWidth = (width: number): number => {
  const max =
    typeof window === "undefined"
      ? ANSWER_WIDTH_MAX
      : Math.min(ANSWER_WIDTH_MAX, Math.max(ANSWER_WIDTH_MIN, window.innerWidth - BODY_WIDTH_MIN));
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
  startDrag: () => void;
  /** キーで少しずつ広げる・狭める（正で広がる）。 */
  nudge: (delta: number) => void;
};

/**
 * 左に問題文・右に解答欄の画面で、解答欄の幅を持つ。
 * 境目をつまんで動かしている間は画面の中だけで変え、手を離したときに storageKey へ覚える。
 * 解答欄は右端に寄せてあるので、幅は「画面の右端からポインタまで」で決まる。
 */
export const useAnswerWidth = (storageKey: string): AnswerWidth => {
  const [width, setWidth] = useState(() => loadAnswerWidth(storageKey));
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (event: PointerEvent): void => {
      event.preventDefault();
      setWidth(clampAnswerWidth(window.innerWidth - event.clientX));
    };
    const onUp = (): void => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging]);

  useEffect(() => {
    if (!dragging) saveAnswerWidth(storageKey, width);
  }, [dragging, storageKey, width]);

  const nudge = (delta: number) => setWidth((prev) => clampAnswerWidth(prev + delta));
  return { width, dragging, startDrag: () => setDragging(true), nudge };
};
