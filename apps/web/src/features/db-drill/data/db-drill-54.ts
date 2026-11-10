import type { DbDrill } from "../types";

/** 集約と副問合せ：ウィンドウ関数の SUM で累計、範囲を限って移動平均を求める。 */
export const DB_DRILL_54: DbDrill = {
  id: "db-drill-54",
  topic: "集約と副問合せ",
  title: "月別売上の累計をウィンドウ関数で出す",
  body: [
    {
      kind: "p",
      text: "H 社の月別売上の表には，表 1 の行がある（売上額の単位は万円）。",
    },
    {
      kind: "table",
      caption: "表 1　月別売上の行",
      headers: ["年月", "売上額"],
      rows: [
        ["2026-04", "100"],
        ["2026-05", "150"],
        ["2026-06", "120"],
        ["2026-07", "200"],
      ],
    },
    {
      kind: "p",
      text: "年度の初めからの累計を月ごとに並べるため，図 1 の SQL 文を作成した。",
    },
    {
      kind: "code",
      caption: "図 1　売上の累計を求める SQL 文",
      lines: [
        "SELECT 年月, 売上額,",
        "       {{a}}(売上額) OVER (ORDER BY 年月",
        "         ROWS BETWEEN {{b}} AND CURRENT ROW) AS 累計",
        "  FROM 月別売上",
      ],
    },
    {
      kind: "table",
      caption: "表 2　図 1 の実行結果",
      headers: ["年月", "売上額", "累計"],
      rows: [
        ["2026-04", "100", "100"],
        ["2026-05", "150", "250"],
        ["2026-06", "120", "{{c}}"],
        ["2026-07", "200", "{{d}}"],
      ],
    },
    {
      kind: "p",
      text: "空欄 a を AVG にし，ROWS BETWEEN {{e}} PRECEDING AND CURRENT ROW とすると，その月を含む直近 3 か月の移動平均になる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "集約関数",
      answer: "SUM",
      explain:
        "集約関数に OVER を付けるとウィンドウ関数になり、行をまとめずに、行ごとに決めた範囲の集計を出せる。累計は SUM。",
    },
    {
      key: "b",
      hint: "SQL のキーワード",
      answer: "UNBOUNDED PRECEDING",
      explain:
        "UNBOUNDED PRECEDING は「最初の行から」。最初の行から今の行（CURRENT ROW）までを合計すれば累計になる。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "370",
      explain: "4 月から 6 月までの合計で、100 + 150 + 120 = 370。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "570",
      explain: "370 に 7 月の 200 を足して 570。",
    },
    {
      key: "e",
      hint: "数値",
      answer: "2",
      explain:
        "「2 行前から今の行まで」で 3 行分になる。7 月なら (150 + 120 + 200) ÷ 3 = 約 156.7。最初の月は前の行が無いので、ある行だけで平均する。",
    },
  ],
  points: [
    "累計：SUM(列) OVER (ORDER BY 順の列 ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)。",
    "n 行の移動平均：AVG(列) OVER (ORDER BY … ROWS BETWEEN n−1 PRECEDING AND CURRENT ROW)。",
    "グループごとに累計し直すときは、OVER の中に PARTITION BY を足す。GROUP BY と違い、行はまとめられない。",
  ],
};
