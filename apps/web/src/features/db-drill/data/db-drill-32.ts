import type { DbDrill } from "../types";

/** 実行結果：UNION・UNION ALL・INTERSECT・EXCEPT の結果の行数。 */
export const DB_DRILL_32: DbDrill = {
  id: "db-drill-32",
  topic: "実行結果",
  title: "2 店舗の顧客を集合演算で比べる",
  body: [
    {
      kind: "p",
      text: "V 社は A 店と B 店で，購買した顧客の顧客番号を表 1・表 2 のように記録している（同じ顧客が何度も購買すると，その回数だけ行がある）。",
    },
    {
      kind: "table",
      caption: "表 1　A店購買の行",
      headers: ["顧客番号"],
      rows: [["C1"], ["C2"], ["C3"]],
    },
    {
      kind: "table",
      caption: "表 2　B店購買の行",
      headers: ["顧客番号"],
      rows: [["C2"], ["C3"], ["C3"], ["C4"]],
    },
    {
      kind: "code",
      caption: "図 1　どちらかの店で購買した顧客を求める SQL 文",
      lines: ["SELECT 顧客番号 FROM A店購買", "UNION", "SELECT 顧客番号 FROM B店購買"],
    },
    {
      kind: "p",
      text: "図 1 の実行結果は {{a}} 行である。UNION を UNION ALL にすると，結果は {{b}} 行になる。",
    },
    {
      kind: "p",
      text: "両方の店で購買した顧客を求めるには，UNION の代わりに {{c}} を使う。その結果は {{d}} 行である。A 店だけで購買した顧客を EXCEPT で求めると，結果は {{e}} 行になる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "数値",
      answer: "4",
      explain: "UNION は和集合で、重複を除く。C1・C2・C3・C4 の 4 行。",
    },
    {
      key: "b",
      hint: "数値",
      answer: "7",
      explain: "UNION ALL は重複を除かずに全行をつなぐ。3 + 4 = 7 行。",
    },
    {
      key: "c",
      hint: "SQL のキーワード",
      answer: "INTERSECT",
      explain: "両方の結果にある行だけを残すのは INTERSECT（共通集合）。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "2",
      explain:
        "A 店にも B 店にもいるのは C2 と C3。B 店で C3 が 2 行あっても、INTERSECT は重複を除くので 2 行。",
    },
    {
      key: "e",
      hint: "数値",
      answer: "1",
      explain: "A 店の顧客から B 店の顧客を除く（差集合）と C1 だけが残る。",
    },
  ],
  points: [
    "UNION：和（重複を除く）、UNION ALL：和（重複を残す）、INTERSECT：共通、EXCEPT：差。",
    "集合演算でつなぐ SELECT は、列の数と型をそろえる。",
    "重複を除く必要が無いなら UNION ALL の方が速い（重複を探す手間が無い）。",
  ],
};
