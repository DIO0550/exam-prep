"use client";

import type { Note, Stroke } from "../notes/note";
import { SketchPad } from "./sketch-pad";

type NotePanelProps = {
  /** 見出しに出す通し番号（0 始まり）。 */
  index: number;
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
  note,
  onChangeText,
  onAddStroke,
  onUndoStroke,
  onClearSketch,
  onClose,
}: NotePanelProps) => {
  const empty = note.strokes.length === 0;
  const toolButton =
    "cursor-pointer rounded-[7px] border border-edge bg-surface px-2.5 py-[5px] font-medium text-[11px] text-muted-soft hover:bg-hover disabled:cursor-not-allowed disabled:text-disabled";

  return (
    // 幅があるときは右端で別にスクロールする枠。
    // 狭いときは画面の下から出す（本文の流れに置くと、フッターより後ろに積まれてしまう）。
    <aside
      aria-label="メモ"
      className="flex flex-col gap-3 self-stretch border-line border-t bg-panel px-4 pt-4 pb-8 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-50 max-md:max-h-[70dvh] max-md:overflow-y-auto max-md:pb-5 max-md:shadow-[0_-6px_20px_rgba(22,24,29,0.14)] md:flex-[0_0_380px] md:overflow-y-auto md:overscroll-contain md:border-t-0 md:border-l"
    >
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
