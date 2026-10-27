"use client";

import { useEffect } from "react";

import { isMultipleChoice } from "../answers";
import type { QuizSession } from "./use-quiz-session";

/**
 * 文字を打っている最中か。メモ欄などで打った数字や Enter を、ショートカットとして拾わないため。
 * 複数選択のチェックボックスに当たっているときは、打っているわけではないので拾う。
 */
const isTyping = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  if (target instanceof HTMLInputElement) {
    return !["checkbox", "radio", "button", "submit", "reset"].includes(target.type);
  }
  return false;
};

/**
 * 演習中のキー操作。
 *
 * - 1〜9：並んでいる順に選択肢を選ぶ（1 がア、2 がイ…）。単一選択はそのまま解答になる。
 * - Enter：複数選択なら解答を確定、解答済みなら次の問題へ。
 * - ← →：前後の問題へ移る。→ は未解答でも進めるが、最後の問題から結果へは出ない。
 *
 * 押せるボタンに当たっている Enter はブラウザが押してくれるので、ここでは拾わない（二重に進むのを避ける）。
 */
export const useQuizKeys = (session: QuizSession): void => {
  const { screen, current, order, index, items } = session;

  useEffect(() => {
    if (screen !== "quiz" && screen !== "explain") return;
    if (!current) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
      // 開いている一覧（出題する回など）やメモの幅つまみが先に使ったキーは拾わない。
      if (event.defaultPrevented) return;
      if (isTyping(event.target)) return;
      if (event.target instanceof Element && event.target.closest('[role="listbox"]')) return;

      if (event.key === "Enter") {
        if (event.repeat) return;
        const active = document.activeElement;
        if (active instanceof HTMLButtonElement && !active.disabled) return;
        if (screen === "explain" || current.attempt.revealed) {
          event.preventDefault();
          session.goNext();
        } else if (isMultipleChoice(current.question)) {
          event.preventDefault();
          session.submit();
        }
        return;
      }
      if (event.key === "ArrowLeft") {
        if (index === 0) return;
        event.preventDefault();
        session.goPrev();
        return;
      }
      if (event.key === "ArrowRight") {
        if (index + 1 >= items.length) return;
        event.preventDefault();
        session.goTo(index + 1);
        return;
      }
      if (screen === "quiz" && /^[1-9]$/.test(event.key)) {
        const choice = order[Number(event.key) - 1];
        if (choice === undefined) return;
        event.preventDefault();
        session.pick(choice);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [screen, current, order, index, items.length, session]);
};
