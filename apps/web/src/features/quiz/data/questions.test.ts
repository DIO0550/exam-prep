import { describe, expect, it } from "vitest";

import type { Question } from "../types";
import { figuresOf, SKETCH_NAMES, shortSource, sourceId, timelineGroups } from "../types";
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
  it("問題 ID が、問題集をまたいで重複しない", () => {
    // 解答状況は問題 ID をキーに 1 つの表へ入れている。重複すると別の問題の記録が混ざる。
    const ids = ALL.map((question) => sourceId(question.source));
    expect(new Set(ids).size).toBe(ALL.length);
  });

  it("IPA の回は 1 回 80 問ある", () => {
    // 書き下ろしの問題集は問題数が回ごとに違うので、原本のある回だけを見る。
    for (const set of QUESTION_SETS.filter((candidate) => candidate.exam === "AP")) {
      expect(set.questions, set.id).toHaveLength(80);
    }
  });

  it("書き下ろした問題は、典拠を持つ", () => {
    // 出どころの分からない問題を混ぜないための検査。出典表記にもこの値が出る。
    for (const question of ALL) {
      if (question.source.kind !== "original") continue;
      expect(question.source.reference, `${nameOf(question)} の典拠`).not.toBe("");
    }
  });

  it("書き下ろした問題は、正解の選択肢にだけ「これが正解」と書いてある", () => {
    // 選択肢ごとの補足は手で書くので、選択肢を並べ替えた拍子に answer とずれる。
    // 「これが正解」と書いた選択肢が answer と一致することを、機械で押さえておく。
    for (const question of ALL) {
      if (question.source.kind !== "original") continue;
      const marked = question.choices
        .map((choice, index) => (choice.note?.includes("これが正解") ? index : -1))
        .filter((index) => index >= 0);
      expect(marked, `${nameOf(question)} の「これが正解」`).toEqual([question.answer]);
    }
  });

  it("書き下ろした問題は、すべての選択肢に補足と解説が付いている", () => {
    // 間違えた理由が解説本文まで読まないと分からない状態にしない。
    for (const question of ALL) {
      if (question.source.kind !== "original") continue;
      for (const choice of question.choices) {
        expect(choice.note, `${nameOf(question)} の「${choice.text}」`).toBeTruthy();
      }
      expect(question.explain, `${nameOf(question)} の解説`).toBeTruthy();
    }
  });

  it("正解の添字が、選択肢の範囲に収まっている", () => {
    for (const question of ALL) {
      expect(question.answer, `${nameOf(question)} の正解`).toBeGreaterThanOrEqual(0);
      expect(question.answer, `${nameOf(question)} の正解`).toBeLessThan(question.choices.length);
    }
  });

  it("問題文や解説に改行が入っていない（並べて示すものは stem や figure へ）", () => {
    // 文字列は段落や項目にそのまま流しているので、改行は表示に出ない。
    // 「・」で並べたつもりのものが 1 行に溶けるため、並べるなら stem.list か figure を使う。
    for (const question of ALL) {
      const texts = [
        question.text,
        question.explain ?? "",
        ...(question.points ?? []),
        ...(question.stem?.list?.items ?? []),
        ...question.choices.flatMap((choice) => [choice.text, choice.note ?? ""]),
      ];
      for (const text of texts) {
        expect(text, `${nameOf(question)} の「${text.slice(0, 20)}」`).not.toContain("\n");
      }
    }
  });

  it("箇条書きの項目は行頭の点を持たない（点は描画側が付ける）", () => {
    // 原本の「・」をそのまま写すと、描画側の点と二重に出る。
    // 「・・・」は点ではなく中身（途中を省いた段）なので、そのまま通す。
    for (const question of ALL) {
      for (const item of question.stem?.list?.items ?? []) {
        expect(item, `${nameOf(question)} の箇条書き`).not.toMatch(/^・[^・]/);
      }
    }
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
      const { span, marks } = timeline;
      for (const group of timelineGroups(timeline)) {
        for (const track of group.tracks) {
          for (const bar of track.bars) {
            expect(bar.start, `${nameOf(question)} の「${bar.label}」`).toBeGreaterThanOrEqual(0);
            expect(
              bar.start + bar.length,
              `${nameOf(question)} の「${bar.label}」`,
            ).toBeLessThanOrEqual(span);
          }
        }

        // 締切と「終わらなかった分」も目盛りの中に収める
        if (group.deadline) {
          expect(group.deadline.at, `${nameOf(question)} の ${group.label} の締切`).toBeLessThan(
            span,
          );
        }
        if (group.missed) {
          const { track, start, length } = group.missed;
          expect(
            group.tracks.map((candidate) => candidate.label),
            `${nameOf(question)} の ${group.label} の未完の段`,
          ).toContain(track);
          expect(
            start + length,
            `${nameOf(question)} の ${group.label} の未完`,
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
