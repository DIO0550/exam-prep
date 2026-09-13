import { describe, expect, it } from "vitest";

import type { Attempt } from "../stats";
import type { Question, Source } from "../types";
import type { ProgressRecord } from "./record";
import { emptyRecord } from "./record";
import { statCards, streakLabel, summarizeProgress } from "./summary";

const SOURCE: Source = { exam: "AP", era: "令和", year: 7, term: "aki", section: "am", no: 1 };

const question = (field: string): Question => ({
  source: SOURCE,
  field,
  answer: 0,
  text: "問題文",
  choices: [{ text: "ア" }, { text: "イ" }],
});

const QUESTIONS = new Map<string, Question>([
  ["q1", question("セキュリティ")],
  ["q2", question("セキュリティ")],
  ["q3", question("ネットワーク")],
]);

const lookup = (id: string) => QUESTIONS.get(id);

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

describe("summarizeProgress", () => {
  it("累計正答率は直近の正誤から出す", () => {
    const summary = summarizeProgress(record({ recent: [true, true, false, true] }), lookup);

    expect(summary.accuracy).toEqual({ percent: 75, count: 4 });
  });

  it("記録が無ければ、正答率も到達度も空になる", () => {
    const summary = summarizeProgress(emptyRecord(), lookup);

    expect(summary.accuracy).toEqual({ percent: 0, count: 0 });
    expect(summary.fields).toEqual([]);
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
      lookup,
    );

    expect(summary.weak).toEqual({ total: 2, untried: 1 });
  });

  it("分野別の到達度は解答済みだけを母数にし、低いものから並べる", () => {
    const summary = summarizeProgress(
      record({
        attempts: {
          q1: attempt({ revealed: true, picked: 0 }),
          q2: attempt({ revealed: true, picked: 1 }),
          q3: attempt({ revealed: true, picked: 1 }),
          // まだ解いていない問題と、収録から外れた問題は数に入らない
          q4: attempt({ flagged: true }),
        },
      }),
      lookup,
    );

    expect(summary.fields).toEqual([
      { name: "ネットワーク", correct: 0, answered: 1, percent: 0 },
      { name: "セキュリティ", correct: 1, answered: 2, percent: 50 },
    ]);
  });

  it("連続学習日数は学習日から出す", () => {
    const summary = summarizeProgress(
      record({ days: ["2026-09-12", "2026-09-13"] }),
      lookup,
      new Date(2026, 8, 13),
    );

    expect(summary.streak).toEqual({ current: 2, longest: 2 });
    expect(summary.hasRecord).toBe(true);
  });
});

describe("statCards", () => {
  it("記録があれば数字を出す", () => {
    const summary = summarizeProgress(
      record({
        recent: [true, false],
        days: ["2026-09-12", "2026-09-13"],
        attempts: { q1: attempt({ weak: true }) },
      }),
      lookup,
      new Date(2026, 8, 13),
    );

    expect(statCards(summary)).toEqual([
      { label: "累計正答率", value: "50", unit: "%", note: "直近2問" },
      { label: "連続学習", value: "2", unit: "日", note: "最長記録 2日" },
      { label: "苦手登録", value: "1", unit: "問", note: "うち未再挑戦 1問" },
    ]);
  });

  it("記録が無いうちは、数字の代わりに何が入るかを出す", () => {
    const cards = statCards(summarizeProgress(emptyRecord(), lookup));

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
