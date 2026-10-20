"use client";

import { useState } from "react";

type ConfirmClearButtonProps = {
  /** 最初に出す文言（「学習記録を消す」など）。 */
  label: string;
  /** 押したあとに出す、何が消えるかの説明。 */
  warning: string;
  onClear: () => void;
};

/**
 * 保存したものを消すボタン。
 *
 * 押し間違いで消えないよう 2 段階にしてある。`confirm()` を使わないのは、
 * ブラウザによっては出ない（サードパーティ枠の中など）ためで、画面内で完結させる。
 */
export const ConfirmClearButton = ({ label, warning, onClear }: ConfirmClearButtonProps) => {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="cursor-pointer text-[11.5px] text-muted-soft underline underline-offset-2 hover:text-ink"
      >
        {label}
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2.5 text-[11.5px] text-muted-soft">
      {warning}
      <button
        type="button"
        onClick={() => {
          setArmed(false);
          onClear();
        }}
        className="cursor-pointer rounded-[7px] border border-ng-line bg-ng-soft px-2.5 py-1 font-bold text-[11.5px] text-ng hover:bg-ng-bg"
      >
        消す
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="cursor-pointer rounded-[7px] border border-edge bg-surface px-2.5 py-1 font-medium text-[11.5px] text-ink hover:bg-hover"
      >
        やめる
      </button>
    </span>
  );
};
