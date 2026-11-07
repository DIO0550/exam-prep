import type { DbDrill } from "../types";

/** 実行結果：複数の列での GROUP BY と、HAVING COUNT(DISTINCT …)。 */
export const DB_DRILL_35: DbDrill = {
  id: "db-drill-35",
  topic: "実行結果",
  title: "社員と年度の組でまとめて数える",
  body: [
    {
      kind: "p",
      text: "Y 社では，社員が受講した研修を年度ごとに表 1 のように記録している。",
    },
    {
      kind: "table",
      caption: "表 1　受講の行",
      headers: ["社員番号", "研修コード", "年度"],
      rows: [
        ["E1", "K1", "2025"],
        ["E1", "K2", "2025"],
        ["E1", "K1", "2026"],
        ["E2", "K1", "2025"],
        ["E2", "K1", "2026"],
        ["E3", "K2", "2026"],
      ],
    },
    {
      kind: "code",
      caption: "図 1　社員と年度ごとに受講件数を数える SQL 文",
      lines: ["SELECT 社員番号, 年度, COUNT(*) AS 件数", "  FROM 受講", " GROUP BY 社員番号, 年度"],
    },
    {
      kind: "p",
      text: "図 1 の実行結果は {{a}} 行である。図 1 に HAVING COUNT(*) >= 2 を加えると，結果は {{b}} 行になる。",
    },
    {
      kind: "code",
      caption: "図 2　2 種類以上の研修を受講した社員を求める SQL 文",
      lines: [
        "SELECT 社員番号",
        "  FROM 受講",
        " GROUP BY 社員番号",
        "HAVING COUNT({{c}} 研修コード) >= 2",
      ],
    },
    {
      kind: "p",
      text: "図 2 で求められる社員は {{d}} である。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "数値",
      answer: "5",
      explain:
        "（社員番号，年度）の組でまとめる。（E1, 2025）（E1, 2026）（E2, 2025）（E2, 2026）（E3, 2026）の 5 グループ、5 行。",
    },
    {
      key: "b",
      hint: "数値",
      answer: "1",
      explain: "件数が 2 以上なのは（E1, 2025）の 2 件だけ。",
    },
    {
      key: "c",
      hint: "SQL のキーワード",
      answer: "DISTINCT",
      explain:
        "「2 種類以上」なので、研修コードの重複を除いて数える。DISTINCT が無いと、E2 は K1 を 2 回受講しただけで 2 になってしまう。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "E1 だけ" },
        { key: "イ", text: "E1 と E2" },
        { key: "ウ", text: "E1，E2，E3" },
        { key: "エ", text: "該当なし" },
      ],
      answer: "ア",
      explain: "E1 は K1・K2 の 2 種類。E2 は K1 だけ、E3 は K2 だけで 1 種類。",
    },
  ],
  points: [
    "GROUP BY に複数の列を書くと、その組ごとに 1 行になる。",
    "「何件」なら COUNT(*)、「何種類」なら COUNT(DISTINCT 列)。",
    "HAVING はグループにまとめた後の条件。",
  ],
};
