import { describe, expect, it } from "vitest";

import { questionSetsOf } from "./data/questions";
import type { DrawSettings } from "./draw";
import { defaultDrawSettings, drawPool, drawQuestions, drawSize, fieldsOf } from "./draw";
import { sourceId } from "./types";

const AP_SETS = questionSetsOf("AP");
const [R7_AKI, R7_HARU] = AP_SETS;
if (!R7_AKI || !R7_HARU) throw new Error("AP の回が 2 つ以上必要");

const settings = (patch: Partial<DrawSettings> = {}): DrawSettings => ({
  ...defaultDrawSettings(AP_SETS),
  ...patch,
});

/** 並びを確かめたいときの、決まった順で値を返す乱数。 */
const fixedRandom = (values: number[]): (() => number) => {
  let index = 0;
  return () => values[index++ % values.length] ?? 0;
};

describe("ランダム出題", () => {
  it("最初はすべての回・すべての分野から 20 問", () => {
    const initial = defaultDrawSettings(AP_SETS);
    expect(initial.setIds).toEqual(AP_SETS.map((set) => set.id));
    expect(initial.fields).toEqual(fieldsOf(AP_SETS));
    expect(initial.count).toBe(20);
    expect(drawPool(AP_SETS, initial)).toHaveLength(AP_SETS.length * 80);
  });

  it("分野は重複なく、最初に出てきた順に並ぶ", () => {
    const fields = fieldsOf(AP_SETS);
    expect(new Set(fields).size).toBe(fields.length);
    expect(fields[0]).toBe(R7_AKI.questions[0].field);
    expect(fields).toContain("セキュリティ");
  });

  it("選んだ回・分野に入る問題だけが範囲になる", () => {
    const pool = drawPool(
      AP_SETS,
      settings({ setIds: [R7_AKI.id, R7_HARU.id], fields: ["セキュリティ"] }),
    );
    const expected = [...R7_AKI.questions, ...R7_HARU.questions].filter(
      (question) => question.field === "セキュリティ",
    );
    expect(pool).toEqual(expected);
  });

  it("回か分野を 1 つも選ばなければ、範囲は空になる", () => {
    expect(drawPool(AP_SETS, settings({ setIds: [] }))).toEqual([]);
    expect(drawPool(AP_SETS, settings({ fields: [] }))).toEqual([]);
  });

  it("決めた数だけ、重複なく範囲の中から引く", () => {
    const pool = drawPool(AP_SETS, settings({ setIds: [R7_AKI.id] }));
    const ids = new Set(pool.map((question) => sourceId(question.source)));

    const drawn = drawQuestions(pool, 20);
    expect(drawn).toHaveLength(20);
    const drawnIds = drawn.map((question) => sourceId(question.source));
    expect(new Set(drawnIds).size).toBe(20);
    expect(drawnIds.every((id) => ids.has(id))).toBe(true);
  });

  it("範囲が引く数より少なければ、範囲の全部を混ぜて出す", () => {
    const pool = R7_AKI.questions.slice(0, 5);
    expect(drawSize(pool.length, 20)).toBe(5);
    expect(drawSize(pool.length, "すべて")).toBe(5);
    const drawn = drawQuestions(pool, 20, fixedRandom([0.99]));
    expect(drawn).toHaveLength(5);
    expect(new Set(drawn)).toEqual(new Set(pool));
  });

  it("並びは乱数で決まり、範囲の並びのままとは限らない", () => {
    const pool = R7_AKI.questions.slice(0, 4);
    // 0 なら手前から順に、0.99 なら残りの末尾を取る
    expect(drawQuestions(pool, "すべて", fixedRandom([0]))).toEqual(pool);
    expect(drawQuestions(pool, "すべて", fixedRandom([0.99]))).toEqual([
      pool[3],
      pool[0],
      pool[1],
      pool[2],
    ]);
  });

  it("元の範囲は並べ替えない", () => {
    const pool = R7_AKI.questions.slice(0, 4);
    const copy = [...pool];
    drawQuestions(pool, 10, fixedRandom([0.99]));
    expect(pool).toEqual(copy);
  });
});
