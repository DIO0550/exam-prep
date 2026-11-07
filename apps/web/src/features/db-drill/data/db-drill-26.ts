import type { DbDrill } from "../types";

/** 実行結果：NULL を含む列に集約関数を使ったときの結果。 */
export const DB_DRILL_26: DbDrill = {
  id: "db-drill-26",
  topic: "実行結果",
  title: "NULL を含む列を集計する",
  body: [
    {
      kind: "p",
      text: "小テストの点数を表 1 のように記録している。欠席した学生の点数は NULL である。",
    },
    {
      kind: "table",
      caption: "表 1　テストの行",
      headers: ["学生番号", "点数"],
      rows: [
        ["S1", "80"],
        ["S2", "NULL"],
        ["S3", "60"],
        ["S4", "70"],
      ],
    },
    {
      kind: "code",
      caption: "図 1　点数を集計する SQL 文",
      lines: [
        "SELECT COUNT(*), COUNT(点数), AVG(点数),",
        "       AVG(COALESCE(点数, 0))",
        "  FROM テスト",
      ],
    },
    {
      kind: "table",
      caption: "表 2　図 1 の実行結果",
      headers: ["COUNT(*)", "COUNT(点数)", "AVG(点数)", "AVG(COALESCE(点数, 0))"],
      rows: [["{{a}}", "{{b}}", "{{c}}", "{{d}}"]],
    },
    {
      kind: "p",
      text: "また，SELECT 学生番号 FROM テスト WHERE 点数 <> 80 の結果は {{e}} 行になる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "数値",
      answer: "4",
      explain: "COUNT(*) は NULL かどうかに関係なく行数を数える。4 行。",
    },
    {
      key: "b",
      hint: "数値",
      answer: "3",
      explain: "COUNT(列) は NULL を数えない。S2 を除く 3。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "70",
      explain:
        "AVG も NULL を除いて計算する。(80 + 60 + 70) ÷ 3 = 70。欠席者を 0 点とした平均ではない。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "52.5",
      explain:
        "COALESCE(点数, 0) は、点数が NULL なら 0 に置き換える。(80 + 0 + 60 + 70) ÷ 4 = 52.5。欠席を 0 点として平均したいときに使う。",
    },
    {
      key: "e",
      hint: "数値",
      answer: "2",
      explain:
        "S3（60）と S4（70）の 2 行。S2 は NULL <> 80 が不明になり、WHERE で真にならないので残らない。",
    },
  ],
  points: [
    "集約関数（COUNT(列)・SUM・AVG・MAX・MIN）は NULL を無視する。COUNT(*) だけが NULL の行も数える。",
    "COALESCE(列, 値) で NULL を別の値に置き換えられる。",
    "NULL との比較は不明になり、= でも <> でも行は残らない。",
  ],
};
