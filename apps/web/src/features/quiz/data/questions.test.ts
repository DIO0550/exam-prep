import { describe, expect, it } from "vitest";

import type { Question } from "../types";
import { figuresOf, SKETCH_NAMES, shortSource } from "../types";
import { QUESTION_SETS } from "./questions";

/**
 * 問題データが、画面が想定している形に収まっているかの検査。
 *
 * データは手で書き足していくもので、崩れても型では落ちない（列数のずれ、目盛りをはみ出す帯、
 * 書いているうちに紛れ込んだ別の文字など）。描画側の前提をここに書いておき、
 * 収録を増やしたときに気付けるようにする。
 */

const ALL: Question[] = QUESTION_SETS.flatMap((set) => set.questions);

/** 問題を指す短い名前。落ちたときにどれか分かるようにする。 */
const nameOf = (question: Question) => shortSource(question.source);

/** 表の列数の上限。これを超えると、狭い画面で横スクロールしても読めなくなる。 */
const TABLE_COLUMN_LIMIT = 6;

/** ハングルとキリル文字。日本語の解説に混じるのは書き間違い。 */
const FOREIGN_SCRIPT = /[ᄀ-ᇿ가-힯Ѐ-ӿ]/;

describe("問題データ", () => {
  it("1 回 80 問で、問題 ID が重複しない", () => {
    const ids = ALL.map((question) => `${question.source.year}-${question.source.term}`);
    expect(new Set(ids).size).toBe(QUESTION_SETS.length);
    for (const set of QUESTION_SETS) expect(set.questions).toHaveLength(80);
  });

  it("図の見出しは呼び名を持たない（図・表は描画側が中身に合わせて付ける）", () => {
    for (const question of ALL) {
      for (const figure of figuresOf(question)) {
        expect(figure.caption, `${nameOf(question)} の図の見出し`).not.toMatch(/^(図|表)\s*[：:]/);
        expect(figure.caption, `${nameOf(question)} の図の見出し`).not.toBe("");
      }
    }
  });

  it("図の見本は、名前から引ける形だけを使う", () => {
    for (const question of ALL) {
      for (const figure of figuresOf(question)) {
        if (figure.type !== "sketch") continue;
        expect(figure.items.length, `${nameOf(question)} の図の見本`).toBeGreaterThanOrEqual(2);
        for (const item of figure.items) {
          expect(SKETCH_NAMES, `${nameOf(question)} の「${item.name}」`).toContain(item.name);
          expect(item.note, `${nameOf(question)} の「${item.name}」の説明`).not.toBe("");
        }
      }
    }
  });

  it("表の図は、見出しと各行の列数がそろっている", () => {
    for (const question of ALL) {
      const table = figuresOf(question).find((figure) => figure.type === "table");
      if (!table) continue;
      const { headers, rows } = table;
      expect(headers.length, `${nameOf(question)} の表の列数`).toBeGreaterThanOrEqual(2);
      expect(headers.length, `${nameOf(question)} の表の列数`).toBeLessThanOrEqual(
        TABLE_COLUMN_LIMIT,
      );
      for (const row of rows) {
        expect(row.length, `${nameOf(question)} の行「${row[0]}」`).toBe(headers.length);
      }
    }
  });

  it("タイムチャートの帯は、目盛りの中に収まっている", () => {
    for (const question of ALL) {
      const timeline = figuresOf(question).find((figure) => figure.type === "timeline");
      if (!timeline) continue;
      const { span, tracks, marks } = timeline;
      for (const track of tracks) {
        for (const bar of track.bars) {
          expect(bar.start, `${nameOf(question)} の「${bar.label}」`).toBeGreaterThanOrEqual(0);
          expect(
            bar.start + bar.length,
            `${nameOf(question)} の「${bar.label}」`,
          ).toBeLessThanOrEqual(span);
        }
      }
      for (const mark of marks ?? []) {
        expect(mark.at, `${nameOf(question)} の目印「${mark.label}」`).toBeLessThan(span);
      }
    }
  });

  it("配列図のセル数は、見出しと段でそろっている", () => {
    for (const question of ALL) {
      const array = figuresOf(question).find((figure) => figure.type === "array");
      if (!array) continue;
      const { headers, rows } = array;
      const width = headers?.length ?? rows[0]?.cells.length;
      for (const row of rows) {
        expect(row.cells.length, `${nameOf(question)} の段「${row.label}」`).toBe(width);
        for (const index of row.marked ?? []) {
          expect(index, `${nameOf(question)} の段「${row.label}」の強調`).toBeLessThan(width ?? 0);
        }
        for (const index of row.swap ?? []) {
          expect(index, `${nameOf(question)} の段「${row.label}」の交換`).toBeLessThan(width ?? 0);
        }
      }
    }
  });

  it("解説に、日本語でも英数字でもない文字が紛れていない", () => {
    for (const question of ALL) {
      const text = [
        question.explain ?? "",
        ...(question.points ?? []),
        JSON.stringify(question.figure ?? {}),
        ...question.choices.map((choice) => choice.note ?? ""),
      ].join(" ");
      expect(FOREIGN_SCRIPT.test(text), `${nameOf(question)} の解説`).toBe(false);
    }
  });
});
