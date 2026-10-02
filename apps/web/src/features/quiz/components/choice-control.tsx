import type { ReactNode } from "react";

type ChoiceControlProps = {
  multiple: boolean;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  className: string;
  children: ReactNode;
};

/** 単一選択は即答ボタン、複数選択はキーボードでも切り替えられるチェックボックス。 */
export const ChoiceControl = ({
  multiple,
  selected,
  disabled,
  onSelect,
  className,
  children,
}: ChoiceControlProps) => {
  if (multiple) {
    return (
      <label className={className}>
        <input
          type="checkbox"
          checked={selected}
          disabled={disabled}
          onChange={onSelect}
          className="mt-1 size-5 flex-none accent-accent"
        />
        {children}
      </label>
    );
  }
  return (
    <button type="button" disabled={disabled} onClick={onSelect} className={className}>
      {children}
    </button>
  );
};
