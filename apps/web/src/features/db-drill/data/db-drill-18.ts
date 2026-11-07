import type { DbDrill } from "../types";

/** SELECT と結合：AND と OR の優先順位、IN、BETWEEN。 */
export const DB_DRILL_18: DbDrill = {
  id: "db-drill-18",
  topic: "SELECT と結合",
  title: "AND と OR の優先順位で結果が変わる",
  body: [
    {
      kind: "p",
      text: "I 社の社員の表には，表 1 の行がある。",
    },
    {
      kind: "table",
      caption: "表 1　社員の行",
      headers: ["社員番号", "部署", "役職", "年齢"],
      rows: [
        ["E1", "営業", "主任", "30"],
        ["E2", "営業", "一般", "25"],
        ["E3", "開発", "主任", "40"],
        ["E4", "開発", "一般", "35"],
        ["E5", "総務", "主任", "45"],
      ],
    },
    {
      kind: "p",
      text: "営業部か開発部の主任を求めようとして，図 1 の SQL 文を書いた。",
    },
    {
      kind: "code",
      caption: "図 1　営業部か開発部の主任を求めようとした SQL 文",
      lines: [
        "SELECT 社員番号",
        "  FROM 社員",
        " WHERE 部署 = '営業' OR 部署 = '開発' AND 役職 = '主任'",
      ],
    },
    {
      kind: "p",
      text: "図 1 の実行結果は {{a}} 行になる。意図どおりにするには，OR の部分を括弧で囲む。括弧で囲んだときの結果は {{b}} 行である。",
    },
    {
      kind: "p",
      text: "括弧を使わずに，図 2 のように書くこともできる。",
    },
    {
      kind: "code",
      caption: "図 2　図 1 を書き直した SQL 文",
      lines: [
        "SELECT 社員番号",
        "  FROM 社員",
        " WHERE 部署 {{c}} ('営業', '開発') AND 役職 = '主任'",
      ],
    },
    {
      kind: "p",
      text: "なお，条件を 年齢 BETWEEN 30 AND 40 にすると，結果は {{d}} 行になる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "数値",
      answer: "3",
      explain:
        "AND は OR より先に評価される。条件は「部署 = '営業'」OR「部署 = '開発' AND 役職 = '主任'」となり、営業の E1・E2 と、開発の主任 E3 の 3 行。営業の一般社員 E2 まで入ってしまう。",
    },
    {
      key: "b",
      hint: "数値",
      answer: "2",
      explain: "(部署 = '営業' OR 部署 = '開発') AND 役職 = '主任' なら、E1 と E3 の 2 行。",
    },
    {
      key: "c",
      hint: "SQL のキーワード",
      answer: "IN",
      explain: "列 IN (値1, 値2) は「列 = 値1 OR 列 = 値2」と同じ。括弧の付け忘れを防げる。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "3",
      explain: "BETWEEN は両端を含むので、30 の E1、40 の E3、35 の E4 の 3 行。",
    },
  ],
  points: [
    "優先順位は NOT → AND → OR。OR を先にしたいときは括弧で囲む。",
    "同じ列の OR は IN に書き換えると読みやすく、間違えにくい。",
    "BETWEEN a AND b は a 以上 b 以下（両端を含む）。",
  ],
};
