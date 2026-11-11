"use client";

import type { ReactNode } from "react";

import type { AnswerWidth } from "../hooks/use-answer-width";

/** ← → 1 回で動かす幅（px）。 */
const KEY_STEP = 40;

type AnswerPaneProps = {
  /** useAnswerWidth の戻り値。問題文の側もつまんでいる間の文字選択を止めるので、呼ぶ側で持つ。 */
  answerWidth: AnswerWidth;
  children: ReactNode;
};

/**
 * 左に問題文・右に解答欄の画面の、右側の解答欄。左の境目をつまんで幅を変えられる。
 * 午後の過去問題と穴埋めドリルで同じものを使う。
 */
export const AnswerPane = ({ answerWidth, children }: AnswerPaneProps) => (
  // 解答欄の外枠。つまむところをスクロールに巻き込まないよう、スクロールは内側の aside に持たせる。
  <div
    style={{ ["--answer-width" as string]: `${answerWidth.width}px` }}
    className="relative flex flex-col md:min-h-0 md:flex-[0_0_var(--answer-width)]"
  >
    {/* 境目をつまんで、問題文と解答欄の幅の配分を変える。狭い画面では縦に並ぶので出さない。 */}
    <button
      type="button"
      aria-label={`解答欄の幅を変える（今 ${answerWidth.width}px。← → でも変えられる）`}
      onPointerDown={(event) => {
        event.preventDefault();
        answerWidth.startDrag();
      }}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        answerWidth.nudge(event.key === "ArrowLeft" ? KEY_STEP : -KEY_STEP);
      }}
      className={`-left-1.5 absolute inset-y-0 z-10 hidden w-3 cursor-col-resize touch-none border-none p-0 md:block ${
        answerWidth.dragging ? "bg-accent-soft" : "bg-transparent hover:bg-accent-soft"
      }`}
    />
    <aside
      aria-label="解答欄"
      className="flex flex-col gap-4 border-line border-t bg-surface px-5 pt-5 pb-10 md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-contain md:border-t-0 md:border-l"
    >
      {children}
    </aside>
  </div>
);
