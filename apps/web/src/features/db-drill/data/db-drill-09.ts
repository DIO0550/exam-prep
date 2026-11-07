import type { DbDrill } from "../types";

/** 実行結果：GROUP BY と集約関数の結果の表を埋める。 */
export const DB_DRILL_09: DbDrill = {
  id: "db-drill-09",
  topic: "実行結果",
  title: "成績の集計結果を表に書き込む",
  body: [
    {
      kind: "p",
      text: "資格講座の小テストの成績を，表 1 の行のとおり記録している。主キーは（学生番号，科目コード）である。",
    },
    {
      kind: "table",
      caption: "表 1　成績の行",
      headers: ["学生番号", "科目コード", "点数"],
      rows: [
        ["S1", "K1", "80"],
        ["S1", "K2", "60"],
        ["S2", "K1", "90"],
        ["S2", "K2", "70"],
        ["S3", "K1", "70"],
        ["S3", "K3", "100"],
      ],
    },
    {
      kind: "code",
      caption: "図 1　科目ごとに集計する SQL 文",
      lines: [
        "SELECT 科目コード, COUNT(*) AS 人数,",
        "       AVG(点数) AS 平均点, MAX(点数) AS 最高点",
        "  FROM 成績",
        " GROUP BY 科目コード",
        "HAVING COUNT(*) >= 2",
        " ORDER BY 科目コード",
      ],
    },
    {
      kind: "p",
      text: "表 1 の行に対して図 1 の SQL 文を実行した結果を表 2 に示す。",
    },
    {
      kind: "table",
      caption: "表 2　図 1 の実行結果",
      headers: ["科目コード", "人数", "平均点", "最高点"],
      rows: [
        ["K1", "{{a}}", "{{b}}", "90"],
        ["K2", "2", "{{c}}", "{{d}}"],
      ],
    },
    {
      kind: "p",
      text: "図 1 から HAVING 句を取り除くと，結果の行数は {{e}} 行になる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "数値",
      answer: "3",
      explain: "科目コード K1 の行は S1・S2・S3 の 3 行。COUNT(*) は 3。",
    },
    {
      key: "b",
      hint: "数値",
      answer: "80",
      explain: "K1 の点数は 80・90・70。合計 240 ÷ 3 = 80。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "65",
      explain: "K2 の点数は 60・70。合計 130 ÷ 2 = 65。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "70",
      explain: "K2 の点数のうち大きい方は 70。",
    },
    {
      key: "e",
      hint: "数値",
      answer: "3",
      explain:
        "K3 は S3 の 1 行だけなので、HAVING COUNT(*) >= 2 で除かれていた。HAVING が無ければ K1・K2・K3 の 3 グループ、つまり 3 行になる。",
    },
  ],
  points: [
    "GROUP BY の結果は、グループ 1 つにつき 1 行。",
    "結果の表を埋める問題は、まず WHERE で残る行、次にグループ分け、最後に HAVING で残るグループの順に書き出す。",
    "AVG・SUM・MAX・MIN は NULL を無視する。COUNT(*) だけが NULL の行も数える。",
  ],
};
