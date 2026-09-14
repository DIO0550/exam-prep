type NoteButtonProps = {
  /** メモの枠が開いているか。 */
  open: boolean;
  /** この問題に何か書いてあるか。書いてあれば点を出す。 */
  written: boolean;
  /** sm は問題カードのヘッダー、md は解説画面の下部（MarkButtons と同じ）。 */
  size: "sm" | "md";
  onToggle: () => void;
};

const SIZES = {
  sm: "rounded-[7px] px-[11px] py-[7px] text-[11px]",
  md: "rounded-[9px] px-4 py-3 text-[12px]",
} as const;

/** 右のメモを開け閉めするボタン。 */
export const NoteButton = ({ open, written, size, onToggle }: NoteButtonProps) => (
  <button
    type="button"
    aria-pressed={open}
    onClick={onToggle}
    className={`flex cursor-pointer items-center whitespace-nowrap border font-bold ${SIZES[size]} ${
      open ? "border-accent bg-accent-soft text-accent" : "border-edge bg-surface text-muted-soft"
    }`}
  >
    メモ
    {written && (
      <span
        aria-hidden="true"
        className={`ml-1.5 inline-block size-1.5 rounded-full ${open ? "bg-accent" : "bg-accent-deep"}`}
      />
    )}
  </button>
);
