import { describe, expect, it } from "vitest";

import type { Attempt, Summary } from "../stats";
import type { ProgressRecord } from "./record";
import { emptyRecord } from "./record";
import { statCards, streakLabel, summarizeProgress } from "./summary";

const attempt = (patch: Partial<Attempt> = {}): Attempt => ({
  picked: null,
  revealed: false,
  flagged: false,
  weak: false,
  excluded: [],
  ...patch,
});

const record = (patch: Partial<ProgressRecord> = {}): ProgressRecord => ({
  ...emptyRecord(),
  ...patch,
});

/** 選んでいる回の集計（stats.ts の summarize が返す形）。 */
const setSummary = (patch: Partial<Summary> = {}): Summary => ({
  answered: 0,
  correct: 0,
  percent: 0,
  fieldStats: [],
  ...patch,
});

describe("summarizeProgress", () => {
  it("記録が無ければ、苦手登録も記録の有無も空になる", () => {
    const summary = summarizeProgress(emptyRecord());

    expect(summary.weak).toEqual({ total: 0, untried: 0 });
    expect(summary.hasRecord).toBe(false);
  });

  it("苦手登録のうち、解き直していないものを未再挑戦として数える", () => {
    const summary = summarizeProgress(
      record({
        attempts: {
          q1: attempt({ weak: true, revealed: true, picked: 0 }),
          q2: attempt({ weak: true }),
          q3: attempt({ revealed: true, picked: 1 }),
        },
      }),
    );

    expect(summary.weak).toEqual({ total: 2, untried: 1 });
  });

  it("連続学習日数は学習日から出す", () => {
    const summary = summarizeProgress(
      record({ days: ["2026-09-12", "2026-09-13"] }),
      new Date(2026, 8, 13),
    );

    expect(summary.streak).toEqual({ current: 2, longest: 2 });
    expect(summary.hasRecord).toBe(true);
  });
});

describe("statCards", () => {
  it("正答率は、選んでいる回の解答から出す", () => {
    const summary = summarizeProgress(
      record({
        days: ["2026-09-12", "2026-09-13"],
        attempts: { q1: attempt({ weak: true }) },
      }),
      new Date(2026, 8, 13),
    );

    expect(statCards(summary, setSummary({ answered: 12, correct: 9, percent: 75 }))).toEqual([
      { label: "この回の正答率", value: "75", unit: "%", note: "9/12問 正解" },
      { label: "連続学習", value: "2", unit: "日", note: "最長記録 2日" },
      { label: "苦手登録", value: "1", unit: "問", note: "うち未再挑戦 1問" },
    ]);
  });

  it("記録が無いうちは、数字の代わりに何が入るかを出す", () => {
    const cards = statCards(summarizeProgress(emptyRecord()), setSummary());

    expect(cards.map((card) => card.value)).toEqual(["—", "0", "0"]);
    expect(cards.map((card) => card.note)).toEqual([
      "解答すると出ます",
      "解答した日を数えます",
      "間違えた問題が入ります",
    ]);
  });
});

describe("streakLabel", () => {
  it("続いていれば日数、途切れていれば記録なしと出す", () => {
    expect(streakLabel({ current: 3, longest: 5 })).toBe("3日連続");
    expect(streakLabel({ current: 0, longest: 5 })).toBe("記録なし");
  });
});
