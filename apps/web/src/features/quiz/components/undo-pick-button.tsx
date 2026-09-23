type UndoPickButtonProps = {
  onUndo: () => void;
};

/** 押し間違えた解答を取り消すボタン。解答した直後の問題にだけ出す。 */
export const UndoPickButton = ({ onUndo }: UndoPickButtonProps) => (
  <button
    type="button"
    onClick={onUndo}
    title="押し間違えたときに、選ぶ前へ戻す"
    className="ml-auto cursor-pointer rounded-[8px] border border-edge-strong bg-surface px-3 py-1.5 font-medium text-[12px] text-muted-soft hover:bg-canvas"
  >
    解答を取り消す
  </button>
);
