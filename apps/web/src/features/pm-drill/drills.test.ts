import { describe, expect, it } from "vitest";

import { blanksInText, textsOf } from "@/features/fill-drill/blanks";
import { figureProblems } from "@/features/fill-drill/figure-problems";
import { isCorrect } from "@/features/fill-drill/grade";

import { PM_DRILL_BOOKS, PM_DRILL_ORDER } from "./books";
import type { PmBlock } from "./types";

type BodyFigure = Extract<PmBlock, { kind: "figure" }>["figure"];

/** 本文の図の中の文字（部品・注記・線のラベル・囲み・やり取り・系列の名前）。 */
const figureTexts = (figure: BodyFigure): string[] => {
  if (figure.type === "diagram") {
    const { nodes, edges = [], groups = [] } = figure;
    return [
      ...nodes.flatMap((node) => [node.label, node.note ?? "", ...(node.fields ?? [])]),
      ...edges.map((edge) => edge.label ?? ""),
      ...groups.map((group) => group.label),
    ];
  }
  if (figure.type === "sequence") {
    return [
      ...figure.actors,
      ...figure.steps.map((step) =>
        "label" in step ? step.label : "note" in step ? step.note : step.divider,
      ),
    ];
  }
  return [figure.x.label, figure.y.label, ...figure.series.map((series) => series.label)];
};

/** 本文に出てくる空欄の名前を、出てくる順に集める。図には空欄を置かない。 */
const blanksIn = (block: PmBlock): string[] =>
  block.kind === "figure" ? [] : textsOf(block).flatMap(blanksInText);

describe("午後の穴埋めドリル（セキュリティ・アーキテクチャ・サービスマネジメント・監査）", () => {
  it("どの種類も左の一覧に並び、記録のキーも画面の名前も重ならない", () => {
    expect([...PM_DRILL_ORDER].sort()).toEqual(Object.keys(PM_DRILL_BOOKS).sort());
    const screens = PM_DRILL_ORDER.map((id) => PM_DRILL_BOOKS[id].screen);
    expect(new Set(screens).size).toBe(screens.length);
  });

  for (const id of PM_DRILL_ORDER) {
    const book = PM_DRILL_BOOKS[id];

    describe(book.title, () => {
      it("問題 ID は重複せず、種類の名前で始まる", () => {
        const ids = book.drills.map((drill) => drill.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const drillId of ids) expect(drillId.startsWith(`${id}-drill-`)).toBe(true);
      });

      it("一覧は分野の順に並び、どの分野にも 1 問以上ある", () => {
        const order = book.drills.map((drill) => book.topics.indexOf(drill.topic));
        expect(order).toEqual([...order].sort((a, b) => a - b));
        expect(order).not.toContain(-1);
        for (const topic of book.topics) {
          expect(
            book.drills.some((drill) => drill.topic === topic),
            topic,
          ).toBe(true);
        }
      });

      for (const drill of book.drills) {
        describe(drill.id, () => {
          it("本文の空欄と解答欄が、同じ名前・同じ順でそろっている", () => {
            const inBody = [...new Set(drill.body.flatMap(blanksIn))];
            expect(inBody).toEqual(drill.blanks.map((blank) => blank.key));
          });

          it("正解が選択肢にある（選ぶ欄）／正解の書き方で正解になる（書く欄）", () => {
            for (const blank of drill.blanks) {
              if (blank.choices) {
                const keys = blank.choices.map((choice) => choice.key);
                expect(keys, `空欄 ${blank.key}`).toContain(blank.answer);
                expect(new Set(keys).size).toBe(keys.length);
                const texts = blank.choices.map((choice) => choice.text);
                expect(new Set(texts).size, `空欄 ${blank.key} の選択肢`).toBe(texts.length);
              }
              expect(isCorrect(blank, blank.answer)).toBe(true);
              for (const accepted of blank.accepts ?? []) {
                expect(isCorrect(blank, accepted)).toBe(true);
              }
            }
          });

          it("本文の図は書き方に誤りが無く、空欄を置かない", () => {
            for (const block of drill.body) {
              if (block.kind !== "figure") continue;
              expect(figureProblems(block.figure), block.figure.caption).toEqual([]);
              expect(figureTexts(block.figure).filter((text) => text.includes("{{"))).toEqual([]);
            }
          });

          it("解説・考え方（2 段階以上）・まとめがある", () => {
            expect(drill.points.length).toBeGreaterThan(0);
            for (const blank of drill.blanks) {
              expect(blank.explain, `空欄 ${blank.key}`).not.toBe("");
              const steps = blank.steps ?? [];
              expect(steps.length, `空欄 ${blank.key}`).toBeGreaterThanOrEqual(2);
              for (const step of steps) expect(step.trim(), `空欄 ${blank.key}`).not.toBe("");
            }
          });

          it("解説の図は書き方に誤りが無い", () => {
            for (const blank of drill.blanks) {
              if (!blank.figure) continue;
              expect(figureProblems(blank.figure), `空欄 ${blank.key} の図`).toEqual([]);
            }
          });
        });
      }
    });
  }
});
