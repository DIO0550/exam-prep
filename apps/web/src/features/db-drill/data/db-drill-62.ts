import type { DbDrill } from "../types";

/** 実行結果：相関副問合せで「自分より上の人数」を数えて順位にする。 */
export const DB_DRILL_62: DbDrill = {
  id: "db-drill-62",
  topic: "実行結果",
  title: "相関副問合せで順位を数える",
  body: [
    {
      kind: "p",
      text: "R 高校の小テストの成績の表には，表 1 の行がある。",
    },
    {
      kind: "table",
      caption: "表 1　成績の行",
      headers: ["学生番号", "点数"],
      rows: [
        ["S1", "80"],
        ["S2", "95"],
        ["S3", "80"],
        ["S4", "70"],
        ["S5", "60"],
      ],
    },
    {
      kind: "p",
      text: "ウィンドウ関数を使えない DBMS で順位を付けるため，図 1 の SQL 文を作成した。",
    },
    {
      kind: "code",
      caption: "図 1　順位を求める SQL 文",
      lines: [
        "SELECT X.学生番号, X.点数,",
        "       (SELECT COUNT(*) FROM 成績 Y",
        "         WHERE Y.点数 > X.点数) + 1 AS 順位",
        "  FROM 成績 X",
        " ORDER BY 順位, X.学生番号",
      ],
    },
    {
      kind: "table",
      caption: "表 2　図 1 の実行結果",
      headers: ["学生番号", "点数", "順位"],
      rows: [
        ["S2", "95", "1"],
        ["S1", "80", "{{a}}"],
        ["S3", "80", "2"],
        ["S4", "70", "{{b}}"],
        ["S5", "60", "5"],
      ],
    },
    {
      kind: "p",
      text: "副問合せの条件を Y.点数 >= X.点数 にして + 1 を取り除くと，S1 の順位は {{c}} になる。",
    },
    {
      kind: "p",
      text: "図 1 の順位は，ウィンドウ関数を使って {{d}}() OVER (ORDER BY 点数 DESC) と書いたものと同じになる。",
    },
    {
      kind: "p",
      text: "図 1 の COUNT(*) を COUNT(DISTINCT Y.点数) にすると，S4 の順位は {{e}} になる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "数値",
      answer: "2",
      explain: "S1（80）より点数が高いのは S2（95）の 1 人。1 + 1 = 2 位。",
    },
    {
      key: "b",
      hint: "数値",
      answer: "4",
      explain:
        "S4（70）より高いのは S2・S1・S3 の 3 人。3 + 1 = 4 位。同点の 2 人がいるので 3 位は飛ばされる。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "3",
      explain:
        "80 以上は S2・S1・S3 の 3 人（自分も含む）。同点の人を全員「自分より上」に数えるので、同点が下の順位にそろう（1, 3, 3, 4, 5）。",
    },
    {
      key: "d",
      hint: "関数名",
      answer: "RANK",
      explain:
        "同点を同じ順位にし、次の順位を人数分飛ばす（1, 2, 2, 4, 5）のは RANK。飛ばさないのは DENSE_RANK、同点でも連番にするのは ROW_NUMBER。",
    },
    {
      key: "e",
      hint: "数値",
      answer: "3",
      explain:
        "70 より高い点数の種類は 95 と 80 の 2 つ。2 + 1 = 3。同点でも順位を飛ばさない DENSE_RANK と同じ付け方になる（1, 2, 2, 3, 4）。",
    },
  ],
  points: [
    "「自分より大きい行の数 + 1」が RANK と同じ順位になる。相関副問合せは外側の 1 行ごとに評価される。",
    "COUNT(DISTINCT …) で値の種類を数えると、DENSE_RANK と同じ付け方になる。",
    "> と >=、+ 1 の有無で、同点の扱いが変わる。実行結果を問われたら同点の行に注意する。",
  ],
};
