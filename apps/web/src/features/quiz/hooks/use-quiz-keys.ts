"use client";

import { useEffect, useRef } from "react";

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
 * 押せるボタンに、キーボードで（Tab などで）フォーカスを当てているか。
 * マウスや指で押したあとに残っているだけのフォーカスなら false。
 */
const isKeyboardFocusedButton = (element: Element | null, byPointer: boolean): boolean =>
  element instanceof HTMLButtonElement && !element.disabled && !byPointer;

/**
 * 押された数字（1〜9）。数字でなければ null。
 *
 * macOS で日本語入力がオンのままだと、数字キーでも key が Process や Unidentified、
 * かなの文字（「ぬ」など）になって数字として届かないことがある。そのときはキーの位置（code）で読む。
 * Shift を押しているときは記号を打っているので、位置では読まない。
 */
const digitOf = (event: KeyboardEvent): number | null => {
  const key = event.key.normalize("NFKC");
  if (/^[1-9]$/.test(key)) return Number(key);
  if (event.shiftKey) return null;
  const match = /^(?:Digit|Numpad)([1-9])$/.exec(event.code);
  return match ? Number(match[1]) : null;
};

/**
 * 演習中のキー操作。
 *
 * - 1〜9：並んでいる順に選択肢を選ぶ（1 がア、2 がイ…）。テンキーや全角の数字でもよい。単一選択はそのまま解答になる。
 * - Enter：複数選択なら解答を確定、解答済みなら次の問題へ。
 * - ← →：前後の問題へ移る。→ は未解答でも進めるが、最後の問題から結果へは出ない。
 *
 * Tab で選んだボタンに当たっている Enter はブラウザが押してくれるので、ここでは拾わない（二重に進むのを避ける）。
 */
export const useQuizKeys = (session: QuizSession): void => {
  const { screen, current, order, index, items } = session;
  // 最後にフォーカスを動かしたのがマウス・指か。Tab で動かせばキーボードに戻る。
  // 下の購読は描画のたびに張り直すので、値はそれをまたいで持つ。
  const byPointer = useRef(false);

  useEffect(() => {
    const onPointerDown = (): void => {
      byPointer.current = true;
    };
    const onTab = (event: KeyboardEvent): void => {
      if (event.key === "Tab") byPointer.current = false;
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onTab);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onTab);
    };
  }, []);

  useEffect(() => {
    if (screen !== "quiz" && screen !== "explain") return;
    if (!current) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      // 日本語入力がオンだと、文字を打つ欄の外でも isComposing が立つことがある（macOS）。
      // 欄の中での変換中は下の isTyping で弾くので、ここでは見ない。
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      // 開いている一覧（出題する回など）やメモの幅つまみが先に使ったキーは拾わない。
      if (event.defaultPrevented) return;
      if (isTyping(event.target)) return;
      if (event.target instanceof Element && event.target.closest('[role="listbox"]')) return;

      if (event.key === "Enter") {
        if (event.repeat) return;
        // Tab で選んだボタンの Enter はブラウザがそのボタンを押すので任せる。
        // マウスで押した後に残っているだけのフォーカスなら、ショートカットを優先する
        // （でないと「後で見直す」などを押した直後の Enter で、同じボタンがまた押される）。
        if (isKeyboardFocusedButton(document.activeElement, byPointer.current)) return;
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
      const digit = digitOf(event);
      if (screen === "quiz" && digit !== null) {
        const choice = order[digit - 1];
        if (choice === undefined) return;
        event.preventDefault();
        session.pick(choice);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [screen, current, order, index, items.length, session]);
};
