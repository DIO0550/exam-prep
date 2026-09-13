"use client";

import { useState } from "react";

type ClearRecordButtonProps = {
  onClear: () => void;
};

/**
 * 学習記録を消すボタン。
 *
 * 押し間違いで消えないよう 2 段階にしてある。`confirm()` を使わないのは、
 * ブラウザによっては出ない（サードパーティ枠の中など）ためで、画面内で完結させる。
 */
export const ClearRecordButton = ({ onClear }: ClearRecordButtonProps) => {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="cursor-pointer text-[11.5px] text-muted-soft underline underline-offset-2 hover:text-ink"
      >
        学習記録を消す
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2.5 text-[11.5px] text-muted-soft">
      このブラウザに保存した記録をすべて消します。
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
