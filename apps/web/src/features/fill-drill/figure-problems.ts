import {
  chartProblems,
  diagramProblems,
  karnaughProblems,
  sequenceProblems,
  vennProblems,
} from "@/features/quiz/figure-layout";
import type { Figure } from "@/features/quiz/types";

/**
 * 解説の図の書き間違い（部品の重なり・登場人物の抜け・表の列数の食い違いなど）。
 * 穴埋めドリルのテストで、空欄ごとの図と本文の図を確かめるのに使う。
 */
export const figureProblems = (figure: Figure): string[] => {
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
  if (figure.type === "calc") {
    const exprs = figure.lines.map((line) => line.expr);
    if (new Set(exprs).size !== exprs.length)
      problems.push("同じ式が 2 回出てくる（キーが重なる）");
  }
  return problems;
};
