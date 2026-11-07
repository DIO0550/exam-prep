import { describe, expect, it } from "vitest";

import { DB_DRILLS, DB_TOPICS } from "./drills";
import { isCorrect } from "./grade";
import type { DbBlock } from "./types";

const BLANK = /\{\{([^}]+)\}\}/g;

/** 本文に出てくる空欄の名前を、出てくる順に集める。 */
const blanksIn = (block: DbBlock): string[] => {
  const texts =
    block.kind === "p"
      ? [block.text]
      : block.kind === "code"
        ? block.lines
        : block.kind === "table"
          ? block.rows.flat()
          : block.schemas.flatMap((schema) => schema.columns.map((column) => column.name));
  return texts.flatMap((text) => [...text.matchAll(BLANK)].map((match) => match[1] ?? ""));
};

describe("SQL・表の穴埋めドリル", () => {
  it("問題 ID は重複しない", () => {
    const ids = DB_DRILLS.map((drill) => drill.id);
    expect(new Set(ids).size).toBe(ids.length);
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

      it("解説とまとめがある", () => {
        expect(drill.points.length).toBeGreaterThan(0);
        for (const blank of drill.blanks) expect(blank.explain).not.toBe("");
      });
    });
  }
});
