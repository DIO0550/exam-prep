"use client";

import { useCallback, useEffect, useState } from "react";

import type { Note, Stroke } from "../notes/note";
import { clampNoteWidth, NOTE_WIDTH_MAX, NOTE_WIDTH_MIN } from "../progress/record";
import { SketchPad } from "./sketch-pad";

/** キーで広げ縮めするときの 1 回分。 */
const KEY_STEP = 24;

type NotePanelProps = {
  /** 見出しに出す通し番号（0 始まり）。 */
  index: number;
  /** 保存してある枠の幅（px）。 */
  width: number;
  /** 手を離したときに、新しい幅を覚えてもらう。 */
  onResize: (width: number) => void;
  note: Note;
  onChangeText: (text: string) => void;
  onAddStroke: (stroke: Stroke) => void;
  onUndoStroke: () => void;
  onClearSketch: () => void;
  onClose: () => void;
};

/**
 * 右側に開くメモ。自由入力とドラッグで描ける枠を、今出ている問題に紐づけて置く。
 *
 * 問題ごとに分けているのは、あとで見直したときに「どの問題で何を考えたか」が残るのが
 * メモの目的だから。1 枚の下書き帳にすると、どの問題のものか分からなくなる。
 */
export const NotePanel = ({
  index,
  width,
  onResize,
  note,
  onChangeText,
  onAddStroke,
  onUndoStroke,
  onClearSketch,
  onClose,
}: NotePanelProps) => {
  const empty = note.strokes.length === 0;

  // ドラッグ中は画面の中だけで動かし、手を離したときに覚える
  // （1px 動くたびに保存すると、書き込みが増えるわりに得るものが無い）。
  const [dragging, setDragging] = useState(false);
  const [dragWidth, setDragWidth] = useState(width);
  const shown = dragging ? dragWidth : width;

  const resizeTo = useCallback((next: number) => {
    setDragWidth(clampNoteWidth(next));
  }, []);

  // 右端に寄せた枠なので、幅は「画面の右端からポインタまで」で決まる。
  useEffect(() => {
    if (!dragging) return;

    const onMove = (event: PointerEvent): void => {
      event.preventDefault();
      resizeTo(window.innerWidth - event.clientX);
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
  }, [dragging, resizeTo]);

  // 手を離した時点の幅を覚える。
  useEffect(() => {
    if (dragging) return;
    if (dragWidth !== width) onResize(dragWidth);
    // 幅が外から変わったとき（別タブでの更新）も、ドラッグの初期値を合わせておく。
  }, [dragging, dragWidth, width, onResize]);

  const onKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = clampNoteWidth(width + (event.key === "ArrowLeft" ? KEY_STEP : -KEY_STEP));
    onResize(next);
    setDragWidth(next);
  };
  const toolButton =
    "cursor-pointer rounded-[7px] border border-edge bg-surface px-2.5 py-[5px] font-medium text-[11px] text-muted-soft hover:bg-hover disabled:cursor-not-allowed disabled:text-disabled";

  return (
    // 幅があるときは右端で別にスクロールする枠。
    // 狭いときは画面の下から出す（本文の流れに置くと、フッターより後ろに積まれてしまう）。
    <aside
      aria-label="メモ"
      style={{ ["--note-width" as string]: `${shown}px` }}
      className="relative flex flex-col gap-3 self-stretch border-line border-t bg-panel px-4 pt-4 pb-8 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-50 max-md:max-h-[70dvh] max-md:overflow-y-auto max-md:pb-5 max-md:shadow-[0_-6px_20px_rgba(22,24,29,0.14)] md:flex-[0_0_var(--note-width)] md:overflow-y-auto md:overscroll-contain md:border-t-0 md:border-l"
    >
      {/* 左端をつまんで広げる。狭い画面では下から出すので、つまむところは出さない。 */}
      <button
        type="button"
        aria-label={`メモの幅を変える（今 ${shown}px、${NOTE_WIDTH_MIN}〜${NOTE_WIDTH_MAX}px。← → でも変えられる）`}
        onPointerDown={(event) => {
          event.preventDefault();
          setDragWidth(width);
          setDragging(true);
        }}
        onKeyDown={onKeyDown}
        className={`-left-1.5 absolute inset-y-0 z-10 hidden w-3 cursor-col-resize touch-none border-none bg-transparent p-0 md:block ${
          dragging ? "bg-accent-soft" : "hover:bg-accent-soft"
        }`}
      />
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-[10.5px] text-muted tracking-[0.12em]">
          メモ　問 {String(index + 1).padStart(2, "0")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="メモを閉じる"
          className="cursor-pointer rounded-[7px] border border-edge bg-surface px-2 py-[3px] text-[11px] text-muted-soft hover:bg-hover"
        >
          ✕
        </button>
      </div>

      <textarea
        aria-label="メモ（文章）"
        value={note.text}
        onChange={(event) => onChangeText(event.target.value)}
        placeholder="気づいたこと、間違えた理由、覚え直すことなど"
        className="min-h-[180px] resize-y rounded-[9px] border border-edge bg-surface px-3 py-2.5 text-[13px] text-ink leading-[1.8] placeholder:text-disabled focus:border-accent focus:outline-none"
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted">手書き</span>
          <div className="flex gap-2">
            <button type="button" onClick={onUndoStroke} disabled={empty} className={toolButton}>
              一つ戻す
            </button>
            <button type="button" onClick={onClearSketch} disabled={empty} className={toolButton}>
              全部消す
            </button>
          </div>
        </div>
        <SketchPad strokes={note.strokes} onAddStroke={onAddStroke} />
      </div>

      <p className="text-[10.5px] text-muted-soft leading-[1.8]">
        メモは問題ごとに、このブラウザだけに保存される。「学習記録を消す」で一緒に消える。
      </p>
    </aside>
  );
};
