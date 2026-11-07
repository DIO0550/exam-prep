import type { DbDrill } from "../types";

/** 更新と制約：INSERT … SELECT で集計結果を別の表に入れる。 */
export const DB_DRILL_29: DbDrill = {
  id: "db-drill-29",
  topic: "更新と制約",
  title: "月次の集計結果を INSERT … SELECT で残す",
  body: [
    {
      kind: "p",
      text: "S 社では，毎月の初めに前月の店舗ごとの売上合計を月次売上の表に記録している。",
    },
    {
      kind: "schema",
      caption: "図 1　関係スキーマ",
      schemas: [
        {
          name: "売上",
          columns: [
            { name: "売上番号", key: "pk" },
            { name: "店舗コード" },
            { name: "売上日" },
            { name: "金額" },
          ],
        },
        {
          name: "月次売上",
          columns: [
            { name: "年月", key: "pk" },
            { name: "店舗コード", key: "pk" },
            { name: "売上合計" },
          ],
        },
      ],
    },
    {
      kind: "code",
      caption: "図 2　2026 年 10 月分を記録する SQL 文",
      lines: [
        "INSERT INTO 月次売上 (年月, 店舗コード, 売上合計)",
        "  {{a}} '2026-10', 店舗コード, SUM(金額)",
        "    FROM 売上",
        "   WHERE 売上日 BETWEEN '2026-10-01' AND '2026-10-31'",
        "   GROUP BY {{b}}",
      ],
    },
    {
      kind: "table",
      caption: "表 1　売上の行",
      headers: ["売上番号", "店舗コード", "売上日", "金額"],
      rows: [
        ["1", "S1", "2026-10-03", "500"],
        ["2", "S1", "2026-10-20", "700"],
        ["3", "S2", "2026-10-15", "400"],
        ["4", "S3", "2026-09-30", "900"],
      ],
    },
    {
      kind: "p",
      text: "表 1 の行に対して図 2 を実行すると，月次売上に {{c}} 行が追加される。誤って図 2 をもう一度実行すると，{{d}}。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "SELECT",
      explain:
        "INSERT INTO 表 (列, …) の後に VALUES の代わりに SELECT 文を書くと、問合せの結果の行をまとめて追加できる。'2026-10' のような定数も SELECT に並べられる。",
    },
    {
      key: "b",
      hint: "列名",
      answer: "店舗コード",
      accepts: ["売上.店舗コード"],
      explain: "店舗ごとに合計するので、店舗コードでグループにまとめる。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "2",
      explain:
        "10 月の売上は S1 の 2 行と S2 の 1 行。S3 の売上は 9 月なので入らない。S1・S2 の 2 行が追加される。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        {
          key: "ア",
          text: "主キー（年月，店舗コード）が重複するので，一意性制約違反でエラーになる",
        },
        { key: "イ", text: "同じ内容の行がもう 2 行追加される" },
        { key: "ウ", text: "既にある行の売上合計が 2 倍に更新される" },
        { key: "エ", text: "何も起きずに正常に終わる" },
      ],
      answer: "ア",
      explain:
        "月次売上の主キーは（年月，店舗コード）。（2026-10，S1）などが既にあるので、同じ組の行は追加できない。主キーが二重登録を防いでくれる。",
    },
  ],
  points: [
    "INSERT INTO 表 (列…) SELECT …：問合せの結果をまとめて追加する。",
    "SELECT には定数も並べられる。",
    "主キー（一意性制約）があれば、同じ処理を 2 回流しても重複した行は入らない。",
  ],
};
