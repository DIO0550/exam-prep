import { describe, expect, it } from "vitest";

import type { Question } from "../types";
import { shortSource } from "../types";
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
      if (!question.figure) continue;
      expect(question.figure.caption, `${nameOf(question)} の図の見出し`).not.toMatch(
        /^(図|表)\s*[：:]/,
      );
      expect(question.figure.caption, `${nameOf(question)} の図の見出し`).not.toBe("");
    }
  });

  it("表の図は、見出しと各行の列数がそろっている", () => {
    for (const question of ALL) {
      if (question.figure?.type !== "table") continue;
      const { headers, rows } = question.figure;
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
      if (question.figure?.type !== "timeline") continue;
      const { span, tracks, marks } = question.figure;
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
      if (question.figure?.type !== "array") continue;
      const { headers, rows } = question.figure;
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
