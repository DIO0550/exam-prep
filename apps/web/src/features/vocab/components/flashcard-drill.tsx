"use client";

import { useEffect } from "react";

import type { FlashcardSession } from "../hooks/use-flashcards";
import { FlashcardCard } from "./flashcard-card";

type FlashcardDrillProps = {
  session: FlashcardSession;
};

const ACTION = "cursor-pointer rounded-[10px] px-6 py-[13px] font-bold text-[13.5px]";

/** ボタンに添えるキーの印。 */
const Key = ({ children }: { children: string }) => (
  <span className="ml-2 rounded border border-current/30 px-1.5 py-px font-medium text-[10.5px] opacity-70">
    {children}
  </span>
);

export const FlashcardDrill = ({ session }: FlashcardDrillProps) => {
  const { current, drawn, index, flipped, okCount, answered } = session;

  // キーで操作する。Space と Enter はボタンに当たっているときブラウザが押してくれるので、
  // ここでは拾わない（二重にめくれるのを避ける）。
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const onButton = document.activeElement instanceof HTMLButtonElement;

      if (event.key === " " || event.key === "Enter") {
        if (onButton) return;
        event.preventDefault();
        if (flipped) session.answer("ok");
        else session.flip();
        return;
      }
      if (event.key === "1") session.answer("ok");
      else if (event.key === "2") session.answer("ng");
      else if (event.key === "ArrowRight") {
        event.preventDefault();
        session.next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        session.prev();
      } else if (event.key === "Escape") session.toSetup();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [flipped, session]);

  if (!current) return null;

  return (
    <div className="flex animate-rise-in flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-bold text-[13px] text-muted tabular-nums">
          {index + 1} / {drawn.length}
        </span>
        <span className="text-[12px] text-muted">
          覚えた <span className="font-bold text-ok tabular-nums">{okCount}</span>
          <span className="px-2">・</span>
          あやふや <span className="font-bold text-ng tabular-nums">{answered - okCount}</span>
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-track">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${drawn.length === 0 ? 0 : (index / drawn.length) * 100}%` }}
        />
      </div>

      <FlashcardCard
        card={current}
        mode={session.settings.mode}
        flipped={flipped}
        onFlip={session.flip}
      />

      <div className="flex flex-wrap gap-2.5">
        {flipped ? (
          <>
            <button
              type="button"
              onClick={() => session.answer("ok")}
              className={`${ACTION} bg-ok text-surface`}
            >
              覚えた
              <Key>1</Key>
            </button>
            <button
              type="button"
              onClick={() => session.answer("ng")}
              className={`${ACTION} bg-ng text-surface`}
            >
              あやふや
              <Key>2</Key>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={session.flip}
            className={`${ACTION} bg-accent text-surface hover:bg-accent-hover`}
          >
            答えを見る
            <Key>Space</Key>
          </button>
        )}

        <div className="ml-auto flex gap-2.5">
          <button
            type="button"
            disabled={index === 0}
            onClick={session.prev}
            className={`${ACTION} border border-edge-strong bg-surface font-medium text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:text-disabled`}
          >
            ← 前
          </button>
          <button
            type="button"
            onClick={session.next}
            className={`${ACTION} border border-edge-strong bg-surface font-medium text-ink hover:bg-canvas`}
          >
            次へ →
          </button>
        </div>
      </div>

      <p className="text-[11px] text-muted-soft leading-[1.8]">
        Space めくる／覚えた・1 覚えた・2 あやふや・← → 移動・Esc 設定に戻る
      </p>
    </div>
  );
};
