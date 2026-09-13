import { describe, expect, it } from "vitest";

import type { Attempt, QuizItem } from "./stats";
import { formatElapsed, isCorrect, summarize } from "./stats";
import type { Question } from "./types";

const question = (no: number, field: string, answer: number): Question => ({
  source: { exam: "AP", era: "令和", year: 3, term: "haru", section: "am", no },
  field,
  answer,
  text: "問題文",
  choices: [{ text: "ア" }, { text: "イ" }],
});

const attempt = (patch: Partial<Attempt> = {}): Attempt => ({
  picked: null,
  revealed: false,
  flagged: false,
  weak: false,
  excluded: [],
  ...patch,
});

const item = (q: Question, a: Partial<Attempt> = {}): QuizItem => ({
  question: q,
  attempt: attempt(a),
});

describe("isCorrect", () => {
  it("選んだ選択肢が正解と一致したときだけ true", () => {
    const q = question(1, "セキュリティ", 1);

    expect(isCorrect(item(q, { picked: 1 }))).toBe(true);
    expect(isCorrect(item(q, { picked: 0 }))).toBe(false);
    expect(isCorrect(item(q))).toBe(false);
  });
});

describe("summarize", () => {
  it("未解答は母数に入れない", () => {
    const summary = summarize([
      item(question(1, "セキュリティ", 0), { picked: 0, revealed: true }),
      item(question(2, "セキュリティ", 0), { picked: 1, revealed: true }),
      item(question(3, "セキュリティ", 0)),
    ]);

    expect(summary.answered).toBe(2);
    expect(summary.correct).toBe(1);
    expect(summary.percent).toBe(50);
  });

  it("1 問も解いていなければ 0% を返す", () => {
    const summary = summarize([item(question(1, "セキュリティ", 0))]);

    expect(summary).toEqual({ answered: 0, correct: 0, percent: 0, fieldStats: [] });
  });

  it("分野ごとに正答率をまとめる", () => {
    const summary = summarize([
      item(question(1, "セキュリティ", 0), { picked: 0, revealed: true }),
      item(question(2, "セキュリティ", 0), { picked: 1, revealed: true }),
      item(question(3, "ネットワーク", 1), { picked: 1, revealed: true }),
    ]);

    expect(summary.fieldStats).toEqual([
      { name: "セキュリティ", percent: 50, label: "1/2" },
      { name: "ネットワーク", percent: 100, label: "1/1" },
    ]);
  });
});

describe("formatElapsed", () => {
  it("秒を 2 桁に揃える", () => {
    expect(formatElapsed(185_000)).toBe("3分05秒");
    expect(formatElapsed(0)).toBe("0分00秒");
    expect(formatElapsed(3_600_000)).toBe("60分00秒");
  });
});
