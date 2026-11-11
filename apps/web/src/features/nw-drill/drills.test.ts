import { describe, expect, it } from "vitest";

import { blanksInText, textsOf } from "@/features/fill-drill/blanks";
import { isCorrect } from "@/features/fill-drill/grade";
import {
  chartProblems,
  diagramProblems,
  karnaughProblems,
  sequenceProblems,
  vennProblems,
} from "@/features/quiz/figure-layout";
import type { Figure } from "@/features/quiz/types";

import { NW_DRILLS, NW_TOPICS } from "./drills";
import { networkDescription } from "./figure-text";
import type { NwBlock } from "./types";

/** 構成図の中の文字（部品・注記・線のラベル・囲み）。 */
const figureTexts = (block: Extract<NwBlock, { kind: "figure" }>): string[] => {
  const { nodes, edges = [], groups = [] } = block.figure;
  return [
    ...nodes.flatMap((node) => [node.label, node.note ?? "", ...(node.fields ?? [])]),
    ...edges.map((edge) => edge.label ?? ""),
    ...groups.map((group) => group.label),
  ];
};

/** 解説の図の書き間違い（部品の重なり・登場人物の抜け・表の列数の食い違いなど）。 */
const figureProblems = (figure: Figure): string[] => {
  const problems: string[] = [];
  if (figure.caption.trim() === "") problems.push("見出しが空");
  if (/^(図|表)\s*[：:]/.test(figure.caption))
    problems.push("見出しに「図：」「表：」を書いている");
  if (figure.type === "diagram") problems.push(...diagramProblems(figure));
  if (figure.type === "sequence") problems.push(...sequenceProblems(figure));
  if (figure.type === "chart") problems.push(...chartProblems(figure));
  if (figure.type === "venn") problems.push(...vennProblems(figure));
  if (figure.type === "karnaugh") problems.push(...karnaughProblems(figure));
  if (figure.type === "table") {
    for (const row of figure.rows) {
      if (row.length !== figure.headers.length) problems.push(`表の行の列数が違う：${row[0]}`);
    }
  }
  if (figure.type === "array") {
    const width = figure.headers?.length ?? figure.rows[0]?.cells.length;
    for (const row of figure.rows) {
      if (row.cells.length !== width) problems.push(`配列の段の長さが違う：${row.label}`);
    }
  }
  return problems;
};

/** 本文に出てくる空欄の名前を、出てくる順に集める。構成図には空欄を置かない。 */
const blanksIn = (block: NwBlock): string[] =>
  block.kind === "figure" ? [] : textsOf(block).flatMap(blanksInText);

describe("ネットワークの穴埋めドリル", () => {
  it("問題 ID は重複しない", () => {
    const ids = NW_DRILLS.map((drill) => drill.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("一覧は分野の順に並び、全ての問を含む", () => {
    const order = NW_DRILLS.map((drill) => NW_TOPICS.indexOf(drill.topic));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(order).not.toContain(-1);
  });

  it("どの分野にも 1 問以上ある", () => {
    for (const topic of NW_TOPICS) {
      expect(NW_DRILLS.some((drill) => drill.topic === topic)).toBe(true);
    }
  });

  it("構成図の代替テキストは、機器・注記・つながりを文で並べる", () => {
    expect(
      networkDescription({
        type: "diagram",
        caption: "図 1　構成",
        nodes: [
          { id: "r", label: "ルータ", col: 0, row: 0, note: "10.0.0.1" },
          { id: "pc", label: "PC", col: 1, row: 0 },
        ],
        edges: [{ from: "r", to: "pc", label: "LAN" }],
        groups: [{ label: "社内 LAN", col: 0, row: 0, w: 2, h: 1 }],
      }),
    ).toBe("図 1　構成。機器：ルータ（10.0.0.1）、PC。接続：ルータ－PC（LAN）。範囲：社内 LAN。");
  });

  for (const drill of NW_DRILLS) {
    describe(drill.id, () => {
      it("本文の空欄と解答欄が、同じ名前・同じ順でそろっている", () => {
        const inBody = [...new Set(drill.body.flatMap(blanksIn))];
        expect(inBody).toEqual(drill.blanks.map((blank) => blank.key));
      });

      it("正解が選択肢にある（選ぶ欄）／正解の書き方で正解になる（書く欄）", () => {
        for (const blank of drill.blanks) {
          if (blank.choices) {
            const keys = blank.choices.map((choice) => choice.key);
            expect(keys).toContain(blank.answer);
            expect(new Set(keys).size).toBe(keys.length);
          }
          expect(isCorrect(blank, blank.answer)).toBe(true);
          for (const accepted of blank.accepts ?? []) {
            expect(isCorrect(blank, accepted)).toBe(true);
          }
        }
      });

      it("構成図は書き方に誤りが無く（部品の重なり・枠をまたぐ部品・線とラベル）、空欄を置かない", () => {
        for (const block of drill.body) {
          if (block.kind !== "figure") continue;
          expect(diagramProblems(block.figure)).toEqual([]);
          expect(figureTexts(block).filter((text) => text.includes("{{"))).toEqual([]);
        }
      });

      it("解説とまとめがある", () => {
        expect(drill.points.length).toBeGreaterThan(0);
        for (const blank of drill.blanks) expect(blank.explain).not.toBe("");
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
