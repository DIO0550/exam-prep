import type { DbDrill } from "../types";

/** 関係代数：選択・射影・結合・直積と、SQL との対応。 */
export const DB_DRILL_36: DbDrill = {
  id: "db-drill-36",
  topic: "関係代数",
  title: "選択・射影・結合を SQL と対応させる",
  body: [
    {
      kind: "p",
      text: "関係（表）社員と部署に，表 1・表 2 の行（タプル）がある。",
    },
    {
      kind: "table",
      caption: "表 1　社員",
      headers: ["社員番号", "氏名", "部署コード"],
      rows: [
        ["E1", "青木", "D1"],
        ["E2", "井上", "D2"],
        ["E3", "上田", "D1"],
      ],
    },
    {
      kind: "table",
      caption: "表 2　部署",
      headers: ["部署コード", "部署名"],
      rows: [
        ["D1", "営業"],
        ["D2", "開発"],
        ["D3", "総務"],
      ],
    },
    {
      kind: "p",
      text: "社員から部署コードが D1 の行だけを取り出す演算は {{a}} である。社員から氏名の列だけを取り出す演算は {{b}} である。",
    },
    {
      kind: "p",
      text: "SQL では，行を取り出す条件は {{c}} 句に書き，取り出す列は SELECT の後に並べる。",
    },
    {
      kind: "p",
      text: "社員と部署を部署コードで（自然）結合すると，結果は {{d}} 行になる。結合の条件を付けずに社員と部署の直積をとると，結果は {{e}} 行になる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: [
        { key: "ア", text: "選択" },
        { key: "イ", text: "射影" },
        { key: "ウ", text: "結合" },
        { key: "エ", text: "商" },
      ],
      answer: "ア",
      explain: "条件に合う行（タプル）を取り出すのが選択。表を横に切る、と覚える。",
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        { key: "ア", text: "選択" },
        { key: "イ", text: "射影" },
        { key: "ウ", text: "結合" },
        { key: "エ", text: "商" },
      ],
      answer: "イ",
      explain:
        "指定した列（属性）だけを取り出すのが射影。表を縦に切る。結果に同じ行ができたら 1 つにまとめる。",
    },
    {
      key: "c",
      hint: "SQL のキーワード",
      answer: "WHERE",
      explain:
        "選択は WHERE 句、射影は SELECT の列の並び、結合は FROM 句の JOIN（または WHERE の結合条件）に当たる。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "3",
      explain:
        "社員の 3 行それぞれに、部署コードの一致する部署が 1 行ずつある。総務（D3）に社員はいないので結果に出ない。",
    },
    {
      key: "e",
      hint: "数値",
      answer: "9",
      explain:
        "直積は全ての組合せ。社員 3 行 × 部署 3 行 = 9 行。結合は、直積から条件に合う行を選択したものと考えられる。",
    },
  ],
  points: [
    "選択＝行を取り出す（WHERE）、射影＝列を取り出す（SELECT の列）、結合＝共通の属性で行をつなぐ（JOIN）。",
    "直積は全組合せで、行数は掛け算。結合 ＝ 直積 ＋ 選択。",
    "射影では重複した行を 1 つにまとめる（SQL なら DISTINCT に当たる）。",
  ],
};
