import { describe, expect, it } from "vitest";

import { blanksInText, textsOf } from "@/features/fill-drill/blanks";
import { isCorrect } from "@/features/fill-drill/grade";

import { DB_DRILLS, DB_TOPICS } from "./drills";
import { erProblems } from "./er-layout";
import type { DbBlock } from "./types";

/** 本文に出てくる空欄の名前を、出てくる順に集める。 */
const blanksIn = (block: DbBlock): string[] => {
  if (block.kind === "er") {
    // 図の中は、エンティティ（名前・属性）の順、次に関連の順に数える。
    const texts = block.entities.flatMap((e) => [e.name, ...e.attrs.map((a) => a.name)]);
    return [
      ...texts.flatMap(blanksInText),
      ...block.relations.flatMap((r) => ("blank" in r ? [r.blank] : [])),
    ];
  }
  const texts =
    block.kind === "schema"
      ? block.schemas.flatMap((schema) => schema.columns.map((column) => column.name))
      : textsOf(block);
  return texts.flatMap(blanksInText);
};

describe("SQL・表の穴埋めドリル", () => {
  it("問題 ID は重複しない", () => {
    const ids = DB_DRILLS.map((drill) => drill.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("一覧は分野の順に並び、全ての問を含む", () => {
    const order = DB_DRILLS.map((drill) => DB_TOPICS.indexOf(drill.topic));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(order).not.toContain(-1);
  });

  it("どの分野にも 1 問以上ある", () => {
    for (const topic of DB_TOPICS) {
      expect(DB_DRILLS.some((drill) => drill.topic === topic)).toBe(true);
    }
  });

  for (const drill of DB_DRILLS) {
    describe(drill.id, () => {
      it("本文の空欄と解答欄が、同じ名前・同じ順でそろっている", () => {
        const inBody = [...new Set(drill.body.flatMap(blanksIn))];
        expect(inBody).toEqual(drill.blanks.map((blank) => blank.key));
      });

      it("正解が選択肢にある（選ぶ欄）／正解の書き方で正解になる（書く欄）", () => {
        for (const blank of drill.blanks) {
          if (blank.choices) {
            expect(blank.choices.map((choice) => choice.key)).toContain(blank.answer);
          }
          expect(isCorrect(blank, blank.answer)).toBe(true);
          for (const accepted of blank.accepts ?? []) {
            expect(isCorrect(blank, accepted)).toBe(true);
          }
        }
      });

      it("E-R 図の書き方に誤りが無い（箱の重なり・知らないエンティティ・空欄の位置）", () => {
        for (const block of drill.body) {
          if (block.kind === "er") expect(erProblems(block.entities, block.relations)).toEqual([]);
        }
      });

      it("解説とまとめがある", () => {
        expect(drill.points.length).toBeGreaterThan(0);
        for (const blank of drill.blanks) expect(blank.explain).not.toBe("");
      });
    });
  }
});
