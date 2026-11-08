import { describe, expect, it } from "vitest";

import { parsePmAnswers, withAnswer, withoutAnswers } from "./answers";
import {
  rowSpansOfColumn,
  rowSpansOfFirstColumn,
  rowSpansOfLastColumn,
} from "./components/pm-reader";
import { PM_EXAMS, PM_PROBLEMS, pmProblemId } from "./data";
import { PM_TRANSCRIPTS } from "./transcripts";
import type { PmBlock, PmTranscript } from "./types";

const ALL_IDS = new Set(PM_EXAMS.flatMap((e) => PM_PROBLEMS.map((p) => pmProblemId(e, p.no))));

/** 本文に出てくる文字列を全部集める。 */
const textsOf = (block: PmBlock): string[] => {
  switch (block.kind) {
    case "heading":
    case "p":
      return [block.text];
    case "items":
      return block.items.flatMap((item) => [item.label, item.text, item.sub ?? ""]);
    case "image":
      return [block.image.alt];
    case "table":
      return [block.caption, ...block.headers, ...block.rows.flat(2)];
    case "code":
      return [block.caption, ...block.lines];
  }
};

const allTexts = (t: PmTranscript): string[] => [
  t.lead,
  t.intent,
  t.overview,
  ...t.approach,
  ...t.body.flatMap(textsOf),
  ...t.parts.flatMap((part) => [
    part.text,
    ...(part.items ?? []).flatMap((item) => [
      item.text,
      ...(item.choices ?? []).map((c) => c.text),
    ]),
    ...(part.choices ?? []).map((c) => c.text),
    ...(part.glossary ?? []).map((g) => g.note),
    ...part.slots.flatMap((slot) => [
      slot.answer,
      slot.explain,
      slot.hint,
      ...slot.clues,
      ...slot.steps,
      ...(slot.choiceNotes ?? []).map((n) => n.note),
      ...(slot.points ?? []),
      ...(slot.pitfalls ?? []),
      ...(slot.knowledge ?? []),
    ]),
  ]),
];

const blanksIn = (text: string): string[] =>
  [...text.matchAll(/\{\{([^}]+)\}\}/g)].map((match) => match[1] ?? "");

describe.each(Object.values(PM_TRANSCRIPTS))("書き起こし $id", (t) => {
  it("一覧にある問の ID で登録されている", () => {
    expect(ALL_IDS.has(t.id)).toBe(true);
    expect(PM_TRANSCRIPTS[t.id]).toBe(t);
  });

  it("文字列に改行を含めず、空欄と下線の書き方が閉じている", () => {
    for (const text of allTexts(t)) {
      expect(text).not.toMatch(/\n/);
      expect(text.split("{{").length).toBe(text.split("}}").length);
      expect(text.split("[[").length).toBe(text.split("]]").length);
    }
  });

  it("主キー・外部キーは [[主:…]]・[[外:…]] で書き、〔主〕などの別の書き方は使わない", () => {
    for (const text of allTexts(t)) {
      expect(text).not.toMatch(/〔主〕|〔外〕|［主］|［外］|［主キー］|［外部キー］/);
      // 「主：」「外部キー:」など、印の書き間違いは下線のまま描かれてしまうので見つける
      for (const [, inner] of text.matchAll(/\[\[([^\]]+)\]\]/g)) {
        if (/^[^:：]{1,4}[:：]/.test(inner ?? "")) expect(inner).toMatch(/^(主|外):\S/);
      }
    }
  });

  it("下線付きの解答例は言葉で添えず、下線の書き方で書く", () => {
    for (const slot of t.parts.flatMap((part) => part.slots)) {
      expect(slot.answer, slot.key).not.toMatch(/下線付き/);
    }
  });

  it("設問で問う空欄は、どれも本文にある", () => {
    const inBody = new Set(t.body.flatMap(textsOf).flatMap(blanksIn));
    for (const part of t.parts) {
      for (const blank of blanksIn(part.text)) expect(inBody).toContain(blank);
    }
  });

  it("欄の名前は重ならず、解答群のある欄は解答例が解答群の記号になっている", () => {
    const slots = t.parts.flatMap((part) => part.slots);
    expect(new Set(slots.map((s) => s.key)).size).toBe(slots.length);
    for (const slot of slots) {
      expect(slot.answer).not.toBe("");
      expect(slot.explain).not.toBe("");
      if (slot.choices) {
        expect(slot.choices.map((c) => c.key)).toContain(slot.answer);
        expect(new Set(slot.choices.map((c) => c.key)).size).toBe(slot.choices.length);
      }
    }
  });

  it("どの欄にも、本文の手がかりと答えまでの考え方がある", () => {
    expect(t.approach.length).toBeGreaterThan(0);
    for (const slot of t.parts.flatMap((part) => part.slots)) {
      expect(slot.clues.length, slot.key).toBeGreaterThan(0);
      expect(slot.steps.length, slot.key).toBeGreaterThan(1);
      // 記述の欄は、解答に入れたい要素を書く
      if (!slot.choices) expect(slot.points?.length, slot.key).toBeGreaterThan(0);
    }
  });

  it("本文の手がかりは、本文からそのまま引いている", () => {
    const plain = (text: string) => text.replace(/\[\[|\]\]/g, "");
    const body = t.body.flatMap(textsOf).map(plain).join("\n");
    for (const slot of t.parts.flatMap((part) => part.slots)) {
      for (const clue of slot.clues) expect(body, slot.key).toContain(plain(clue));
    }
  });

  it("選択肢ごとの判定と用語の説明は、解答群の記号に対応している", () => {
    for (const part of t.parts) {
      if (part.glossary) {
        const keys = part.glossary.map((g) => g.key);
        expect(new Set(keys).size).toBe(keys.length);
        if (part.choices) {
          expect(keys).toEqual(part.choices.map((c) => c.key));
        } else {
          // 小問ごとの解答群しか無い設問は、どれかの解答群の記号であればよい
          const all = new Set(
            (part.items ?? []).flatMap((item) => item.choices ?? []).map((c) => c.key),
          );
          for (const key of keys) expect(all).toContain(key);
        }
      }
      for (const slot of part.slots) {
        if (!slot.choiceNotes) continue;
        expect(slot.choiceNotes.map((n) => n.key)).toEqual(slot.choices?.map((c) => c.key));
      }
    }
  });

  it("「◯字以内」の欄は、解答例がその字数に収まる", () => {
    for (const slot of t.parts.flatMap((part) => part.slots)) {
      const limit = slot.hint.match(/^(\d+)字以内$/);
      if (limit) expect([...slot.answer].length).toBeLessThanOrEqual(Number(limit[1]));
    }
  });
});

describe("書いた答えの保存", () => {
  it("欄ごとに書き換え、空にしたら外し、1 問分まとめて消せる", () => {
    let answers = withAnswer({}, "p1", "設問1 a", "ク");
    answers = withAnswer(answers, "p1", "設問2 c", "初期");
    expect(answers).toEqual({ p1: { "設問1 a": "ク", "設問2 c": "初期" } });
    answers = withAnswer(answers, "p1", "設問1 a", "");
    expect(answers).toEqual({ p1: { "設問2 c": "初期" } });
    expect(withoutAnswers(answers, "p1")).toEqual({});
  });

  it("保存された値は、形の合わない項目を捨てて読む", () => {
    expect(parsePmAnswers(null)).toEqual({});
    expect(parsePmAnswers({ p1: { a: "ア", b: 3 }, p2: "x" })).toEqual({ p1: { a: "ア" } });
  });
});

describe("表の 1 列目の結合", () => {
  it("同じ値が続く行を先頭の行にまとめ、離れた同じ値はまとめない", () => {
    const rows = [
      ["A", "1"],
      ["A", "2"],
      ["B", "3"],
      ["A", "4"],
      ["A", "5"],
      ["A", "6"],
    ];
    expect(rowSpansOfFirstColumn(rows)).toEqual([2, 0, 1, 3, 0, 0]);
  });

  it("2 列目は、1 列目も同じ値の行どうしだけをまとめる", () => {
    const rows = [
      ["1", "受付", "a"],
      ["2", "実現", "b"],
      ["2", "実現", "c"],
      ["3", "実現", "d"],
    ];
    expect(rowSpansOfColumn(rows, 0)).toEqual([1, 2, 0, 1]);
    // 項番 2 と 3 は 2 列目が同じ「実現」でも、1 列目が違うのでまとめない
    expect(rowSpansOfColumn(rows, 1)).toEqual([1, 2, 0, 1]);
  });

  it("改行して並ぶ箇条書きのセルは、全ての行が同じときだけまとめる", () => {
    const rows = [
      ["販売", ["受注", "請求"], "会計"],
      ["販売", ["受注", "請求"], "生産"],
      ["販売", ["受注"], "会計"],
    ];
    expect(rowSpansOfColumn(rows, 1)).toEqual([2, 0, 1]);
  });

  it("右端の列は、左の結合する列と右端の列の両方が同じ行どうしだけをまとめる", () => {
    const rows = [
      ["販売", "会計", "ホスト系"],
      ["販売", "生産", "ホスト系"],
      ["生産", "会計", "ホスト系"],
      ["生産", "購買", "オープン系"],
    ];
    // 3 行目は右端が同じ「ホスト系」でも、1 列目が違うのでまとめない
    expect(rowSpansOfLastColumn(rows, 1)).toEqual([2, 0, 1, 1]);
  });
});
