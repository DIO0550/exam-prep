import type { DbDrill } from "../types";

/** 実行結果：ウィンドウ関数 LAG で前の行の値を取り、前月との差を出す。 */
export const DB_DRILL_60: DbDrill = {
  id: "db-drill-60",
  topic: "実行結果",
  title: "LAG で前月との差を出す",
  body: [
    {
      kind: "p",
      text: "P 社の月別売上の表には，表 1 の行がある（売上額の単位は万円）。",
    },
    {
      kind: "table",
      caption: "表 1　月別売上の行",
      headers: ["年月", "売上額"],
      rows: [
        ["2026-07", "300"],
        ["2026-08", "360"],
        ["2026-09", "330"],
        ["2026-10", "400"],
      ],
    },
    {
      kind: "p",
      text: "月ごとに前月からの増減を見るため，図 1 の SQL 文を作成した。",
    },
    {
      kind: "code",
      caption: "図 1　前月との差を求める SQL 文",
      lines: [
        "SELECT 年月, 売上額,",
        "       売上額 - {{a}}(売上額) OVER (ORDER BY 年月) AS 前月差",
        "  FROM 月別売上",
        " ORDER BY 年月",
      ],
    },
    {
      kind: "table",
      caption: "表 2　図 1 の実行結果",
      headers: ["年月", "売上額", "前月差"],
      rows: [
        ["2026-07", "300", "{{b}}"],
        ["2026-08", "360", "60"],
        ["2026-09", "330", "{{c}}"],
        ["2026-10", "400", "{{d}}"],
      ],
    },
    {
      kind: "p",
      text: "空欄 a を LEAD に変えると，{{e}} の売上額との差になる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "関数名",
      answer: "LAG",
      explain:
        "LAG(列) OVER (ORDER BY …) は、並べた順で 1 つ前の行の値を返す。前月の売上額を同じ行に持ってこられるので、引き算で差が出せる。",
    },
    {
      key: "b",
      hint: "値（NULL なら NULL と書く）",
      answer: "NULL",
      explain:
        "最初の行には前の行が無いので、LAG は NULL を返す。NULL を含む計算の結果は NULL。LAG(売上額, 1, 0) のように 3 つ目の引数を書くと、前の行が無いときの値を決められる。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "-30",
      accepts: ["−30", "▲30"],
      explain: "330 − 360 = −30。前月より 30 減った。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "70",
      explain: "400 − 330 = 70。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "次の行（翌月）" },
        { key: "イ", text: "2 つ前の行（前々月）" },
        { key: "ウ", text: "最初の行（2026-07）" },
        { key: "エ", text: "全ての行の平均" },
      ],
      answer: "ア",
      explain:
        "LEAD は次の行の値を返す（LAG の逆）。最初の行の値は FIRST_VALUE、全ての行の平均は AVG(売上額) OVER () で求められる。",
    },
  ],
  points: [
    "LAG(列 [, n [, 既定値]]) は n 行前、LEAD は n 行後の値。n を省略すると 1。",
    "前後の行が無いときは NULL（既定値を書けばその値）になる。",
    "店舗ごとに前月と比べるなら、OVER (PARTITION BY 店舗 ORDER BY 年月) とする。",
  ],
};
