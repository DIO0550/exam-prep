"use client";

import { useCallback, useState } from "react";

import type { QuestionSet } from "../data/questions";
import type { DrawSettings } from "../draw";
import { defaultDrawSettings } from "../draw";

/**
 * ランダム出題の条件。試験ごとに持つ（回と分野の名前が試験ごとに違うため）。
 *
 * 学習記録には入れない。引いた問題を解き終えて次を引くときに同じ条件が残っていれば足り、
 * 開き直したときまで覚えておくほどのものではないため。
 */
export const useDrawSettings = (examCode: string, sets: QuestionSet[]) => {
  const [saved, setSaved] = useState<Record<string, DrawSettings>>({});
  const settings = saved[examCode] ?? defaultDrawSettings(sets);

  const setSettings = useCallback(
    (next: DrawSettings) => setSaved((prev) => ({ ...prev, [examCode]: next })),
    [examCode],
  );

  return { settings, setSettings };
};
