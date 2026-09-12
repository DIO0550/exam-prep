type MarkButtonsProps = {
  flagged: boolean;
  weak: boolean;
  onToggleFlag: () => void;
  onToggleWeak: () => void;
  /** sm は問題カードのヘッダー、md は解説画面の下部。 */
  size: "sm" | "md";
};

const SIZES = {
  sm: "rounded-[7px] px-[11px] py-[7px] text-[11px]",
  md: "rounded-[9px] px-4 py-3 text-[12px]",
} as const;

/** 「後で見直す」フラグと苦手登録。どちらも押すたびに入り切りする。 */
export const MarkButtons = ({
  flagged,
  weak,
  onToggleFlag,
  onToggleWeak,
  size,
}: MarkButtonsProps) => {
  const base = `cursor-pointer whitespace-nowrap border font-bold ${SIZES[size]}`;

  return (
    <div className="flex gap-2">
      <button
        type="button"
        aria-pressed={flagged}
        onClick={onToggleFlag}
        className={`${base} ${
          flagged
            ? "border-flag bg-flag-soft text-flag-ink"
            : "border-edge bg-surface text-muted-soft"
        }`}
      >
        {flagged ? "フラグ解除" : "後で見直す"}
      </button>
      <button
        type="button"
        aria-pressed={weak}
        onClick={onToggleWeak}
        className={`${base} ${
          weak
            ? "border-accent bg-accent-soft text-accent"
            : "border-edge bg-surface text-muted-soft"
        }`}
      >
        {weak ? "苦手登録済" : "苦手に登録"}
      </button>
    </div>
  );
};
