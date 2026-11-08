import { describe, expect, it } from "vitest";

import { withoutSlotAnswers } from "./answers";
import { gradeTranscript, judgeChoiceSlots, wrongSlotKeys } from "./grading";
import { parsePmMarks, withMark, withoutMarks } from "./marks";
import type { PmAnswerSlot, PmQuestionPart, PmTranscript } from "./types";

const CHOICES = ["ア", "イ", "ウ", "エ"].map((key) => ({ key, text: `選択肢${key}` }));

const slot = (key: string, answer: string, extra: Partial<PmAnswerSlot> = {}): PmAnswerSlot => ({
  key,
  hint: "記号",
  choices: CHOICES,
  answer,
  explain: "解説",
  clues: ["手がかり"],
  steps: ["一", "二"],
  ...extra,
});

const part = (slots: PmAnswerSlot[]): PmQuestionPart => ({ label: "設問1", text: "", slots });

const transcript = (parts: PmQuestionPart[]): PmTranscript => ({
  id: "t",
  lead: "",
  body: [],
  parts,
  intent: "",
  overview: "",
  approach: [],
});

describe("記号の欄の自動採点", () => {
  it("選んだ記号を解答例と突き合わせ、選んでいない欄は入れない", () => {
    const p = part([slot("a", "ウ"), slot("b", "ア"), slot("c", "イ")]);
    expect(judgeChoiceSlots(p, { a: "ウ", b: "イ" })).toEqual({ a: true, b: false });
  });

  it("順不同の欄は、組の解答例のどれかなら正解。同じ記号を二つの欄で選んだら先の欄だけ", () => {
    const hint = "記号（a と b は順不同）";
    const p = part([slot("a", "ウ", { hint }), slot("b", "エ", { hint }), slot("c", "ア")]);
    expect(judgeChoiceSlots(p, { a: "エ", b: "ウ", c: "ア" })).toEqual({
      a: true,
      b: true,
      c: true,
    });
    expect(judgeChoiceSlots(p, { a: "ウ", b: "ウ" })).toEqual({ a: true, b: false });
    expect(judgeChoiceSlots(p, { a: "ア", b: "エ" })).toEqual({ a: false, b: true });
  });
});

describe("1 問の採点", () => {
  const text = (key: string, answer: string, extra: Partial<PmAnswerSlot> = {}) =>
    slot(key, answer, { hint: "20字以内", choices: undefined, ...extra });

  it("記号の欄は自動、記述の欄と選んでいない記号の欄は本人の印を使う", () => {
    const t = transcript([part([slot("a", "ウ"), slot("b", "ア"), text("c", "初期")])]);
    const grading = gradeTranscript(t, { a: "ウ" }, { b: "ng", c: "ok" });
    expect(grading.slots).toEqual({
      a: { mark: "ok", auto: true },
      b: { mark: "ng", auto: false },
      c: { mark: "ok", auto: false },
    });
    expect(grading.choices).toEqual({ ok: 1, total: 2 });
    // 選んだ記号の欄に印が残っていても、自動の採点を使う
    expect(gradeTranscript(t, { a: "ア" }, { a: "ok" }).slots.a).toEqual({
      mark: "ng",
      auto: true,
    });
  });

  it("全部の欄に ○× が付くまでは点数を出さず、付いたら欄数で按分する", () => {
    const t = transcript([part([slot("a", "ウ"), text("b", "x"), text("c", "y")])]);
    const partial = gradeTranscript(t, { a: "ウ" }, { b: "ok" });
    expect(partial).toMatchObject({ total: 3, ok: 2, ng: 0, ungraded: 1 });
    expect(partial.score).toBeUndefined();
    expect(partial.points).toBeUndefined();

    const done = gradeTranscript(t, { a: "ウ" }, { b: "ok", c: "ng" });
    // 3 欄中 2 欄 → 100 点換算で 67 点、1 問 20 点では 13.3 点
    expect(done).toMatchObject({ ok: 2, ng: 1, ungraded: 0, score: 67, points: 13.3 });
    expect(wrongSlotKeys(done)).toEqual(["c"]);
  });

  it("属性名の欄は、書いてあって下線が違えば × と決め、下線が合えば属性名は本人が見る", () => {
    const t = transcript([
      part([text("b", "[[外:施設 ID]]", { hint: "属性名", keyUnderline: true })]),
    ]);
    const lineKey = "b（下線）";
    expect(gradeTranscript(t, { b: "施設 ID", [lineKey]: "主" }, { b: "ok" })).toMatchObject({
      slots: { b: { mark: "ng", auto: true } },
      lines: { ok: 0, total: 1 },
    });
    expect(gradeTranscript(t, { b: "施設 ID", [lineKey]: "外" }, { b: "ok" })).toMatchObject({
      slots: { b: { mark: "ok", auto: false } },
      lines: { ok: 1, total: 1 },
    });
    // 何も書いていない（紙で解いた）欄は、下線も含めて本人が付ける
    expect(gradeTranscript(t, {}, {}).slots.b).toEqual({ mark: undefined, auto: false });
  });
});

describe("自己採点の印の保存", () => {
  it("欄ごとに付け直し、外し、問ごと・欄ごとに消せる", () => {
    let marks = withMark({}, "p1", "設問1 a", "ok");
    marks = withMark(marks, "p1", "設問2 c", "ng");
    expect(marks).toEqual({ p1: { "設問1 a": "ok", "設問2 c": "ng" } });
    marks = withMark(marks, "p1", "設問1 a", undefined);
    expect(marks).toEqual({ p1: { "設問2 c": "ng" } });
    expect(withoutMarks(marks, "p1", ["設問2 c"])).toEqual({ p1: {} });
    expect(withoutMarks(marks, "p1")).toEqual({});
  });

  it("保存された値は、形の合わない項目を捨てて読む", () => {
    expect(parsePmMarks(null)).toEqual({});
    expect(parsePmMarks({ p1: { a: "ok", b: "maybe", c: true }, p2: "x" })).toEqual({
      p1: { a: "ok" },
    });
  });

  it("書いた答えも、欄を選んで消せる", () => {
    expect(withoutSlotAnswers({ p1: { a: "ク", b: "ア" } }, "p1", ["b"])).toEqual({
      p1: { a: "ク" },
    });
  });
});
