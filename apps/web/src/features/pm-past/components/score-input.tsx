"use client";

import { useState } from "react";

import type { PmAttempt } from "../record";
import { isScore } from "../record";
import { pmRecordStore } from "../store";

type ScoreInputProps = {
  id: string;
  /** 読み上げ用の問題名（「令和7年度 秋期 … 問1」）。 */
  source: string;
  attempt: PmAttempt | undefined;
};

/** 自己採点の点数。入力中は文字列で持ち、確定（フォーカスが外れる・Enter）したときに保存する。 */
export const ScoreInput = ({ id, source, attempt }: ScoreInputProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (attempt?.score === undefined ? "" : String(attempt.score));

  const commit = () => {
    if (draft === null) return;
    const trimmed = draft.trim();
    if (trimmed === "") {
      if (attempt) pmRecordStore.setScore(id, undefined);
    } else {
      const value = Number(trimmed);
      if (isScore(value)) pmRecordStore.setScore(id, value);
    }
    setDraft(null);
  };

  return (
    <label className="flex items-center gap-1.5 text-[11.5px] text-muted">
      <input
        type="number"
        aria-label={`${source} の自己採点`}
        inputMode="numeric"
        min={0}
        max={100}
        step={1}
        value={shown}
        placeholder="—"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
        }}
        className="w-[64px] rounded-[7px] border border-edge-strong bg-surface px-2 py-1 text-right text-[13px] text-ink tabular-nums"
      />
      点
    </label>
  );
};
