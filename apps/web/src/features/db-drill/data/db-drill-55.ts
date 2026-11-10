import type { DbDrill } from "../types";

const RESULT = [
  { key: "ア", text: "更新され，P1 は低価格商品のビューから見えなくなる" },
  { key: "イ", text: "エラーになり，P1 の単価は変わらない" },
  { key: "ウ", text: "更新され，P1 は単価 1200 のまま低価格商品のビューに残る" },
  { key: "エ", text: "ビューの P1 だけが更新され，商品の表の単価は変わらない" },
];

/** 更新と制約：ビューを通した更新と WITH CHECK OPTION、更新できないビュー。 */
export const DB_DRILL_55: DbDrill = {
  id: "db-drill-55",
  topic: "更新と制約",
  title: "ビューを通した更新と WITH CHECK OPTION",
  body: [
    {
      kind: "p",
      text: "J 社では，商品の表から単価 1000 円未満の商品だけを見せるビューを作り，売場の担当者にはこのビューを通して単価を直してもらうことにした。商品の表には，商品コード P1，単価 800 の行がある。",
    },
    {
      kind: "code",
      caption: "図 1　ビューを定義する SQL 文",
      lines: [
        "CREATE VIEW 低価格商品 {{a}}",
        "  SELECT 商品コード, 商品名, 単価",
        "    FROM 商品",
        "   WHERE 単価 < 1000",
        "  {{b}}",
      ],
    },
    {
      kind: "p",
      text: "担当者が UPDATE 低価格商品 SET 単価 = 1200 WHERE 商品コード = 'P1' を実行すると，{{c}}。",
    },
    {
      kind: "p",
      text: "仮に図 1 から空欄 b を取り除いたビューであれば，同じ UPDATE 文を実行すると，{{d}}。",
    },
    {
      kind: "p",
      text: "図 1 のビューは 1 行が商品の表の 1 行に対応するので更新できる。一方，{{e}} は，ビューの行を元の表の行に対応付けられないので，ビューを通して更新できない。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "AS",
      explain: "CREATE VIEW ビュー名 AS 問合せ。AS の後の SELECT 文の結果がビューの中身になる。",
    },
    {
      key: "b",
      hint: "SQL のキーワード",
      answer: "WITH CHECK OPTION",
      explain:
        "ビューを通して追加・更新した行が、ビューの条件（WHERE 単価 < 1000）を満たすかを検査させる指定。満たさない変更はエラーにする。",
    },
    {
      key: "c",
      hint: "記号",
      choices: RESULT,
      answer: "イ",
      explain:
        "更新後の単価 1200 は、ビューの条件の単価 < 1000 を満たさない。WITH CHECK OPTION があるので、この更新は拒否され、P1 は 800 のまま。",
    },
    {
      key: "d",
      hint: "記号",
      choices: RESULT,
      answer: "ア",
      explain:
        "検査が無いので、商品の表の P1 は 1200 に更新される。ビューは条件に合う行を見せるだけなので、更新した直後から P1 はビューに現れなくなり、担当者は自分では直せなくなる。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "分類ごとの単価の平均を GROUP BY で求めるビュー" },
        { key: "イ", text: "商品の表から一部の列だけを選んだビュー" },
        { key: "ウ", text: "商品の表から WHERE で一部の行だけを選んだビュー" },
        { key: "エ", text: "列に別名を付けて並べ直したビュー" },
      ],
      answer: "ア",
      explain:
        "集約したビューの 1 行は、元の表の何行もをまとめた値。平均を 500 に変えろと言われても、どの行をどう変えればよいか決まらない。GROUP BY・集約関数・DISTINCT を使ったビューは更新できない。",
    },
  ],
  points: [
    "CREATE VIEW ビュー名 AS SELECT … [WITH CHECK OPTION]。",
    "WITH CHECK OPTION は、ビューを通した追加・更新の結果がビューの条件を満たすかを検査する。",
    "ビューの行が元の表の 1 行に対応するときだけ、ビューを通して更新できる。集約・DISTINCT を使うと更新できない。",
  ],
};
