import type { DbDrill } from "../types";

/** SELECT と結合：3 つの表を結合して金額を集計する。 */
export const DB_DRILL_20: DbDrill = {
  id: "db-drill-20",
  topic: "SELECT と結合",
  title: "3 つの表を結合して受注金額を出す",
  body: [
    {
      kind: "p",
      text: "K 社の受注管理では，受注の金額を持たず，明細の数量と商品の単価から計算する。",
    },
    {
      kind: "schema",
      caption: "図 1　関係スキーマ",
      schemas: [
        {
          name: "受注",
          columns: [{ name: "受注番号", key: "pk" }, { name: "顧客番号" }, { name: "受注日" }],
        },
        {
          name: "受注明細",
          columns: [
            { name: "受注番号", key: "pk" },
            { name: "商品コード", key: "pk" },
            { name: "数量" },
          ],
        },
        {
          name: "商品",
          columns: [{ name: "商品コード", key: "pk" }, { name: "商品名" }, { name: "単価" }],
        },
      ],
    },
    {
      kind: "code",
      caption: "図 2　受注ごとの合計金額を求める SQL 文",
      lines: [
        "SELECT 受注.受注番号, SUM({{a}}) AS 合計金額",
        "  FROM 受注",
        "  JOIN 受注明細 ON 受注.受注番号 = 受注明細.受注番号",
        "  JOIN 商品 ON 受注明細.商品コード = 商品.商品コード",
        " WHERE 受注.受注日 = '2026-11-01'",
        " {{b}} 受注.受注番号",
      ],
    },
    {
      kind: "p",
      text: "受注 J1・J2 はどちらも 2026-11-01 の受注で，受注明細と商品は表 1・表 2 のとおりである。",
    },
    {
      kind: "table",
      caption: "表 1　受注明細の行",
      headers: ["受注番号", "商品コード", "数量"],
      rows: [
        ["J1", "P1", "2"],
        ["J1", "P2", "1"],
        ["J2", "P1", "3"],
      ],
    },
    {
      kind: "table",
      caption: "表 2　商品の行",
      headers: ["商品コード", "商品名", "単価"],
      rows: [
        ["P1", "クリップ", "100"],
        ["P2", "ファイル", "300"],
      ],
    },
    {
      kind: "table",
      caption: "表 3　図 2 の実行結果",
      headers: ["受注番号", "合計金額"],
      rows: [
        ["J1", "{{c}}"],
        ["J2", "{{d}}"],
      ],
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "式",
      answer: "受注明細.数量 * 商品.単価",
      accepts: ["商品.単価 * 受注明細.数量", "数量 * 単価", "単価 * 数量"],
      explain:
        "明細 1 行の金額は 数量 × 単価。それを受注ごとに SUM で足す。数量と単価は別の表にあるので、結合してから掛ける。",
    },
    {
      key: "b",
      hint: "SQL のキーワード",
      answer: "GROUP BY",
      explain: "受注ごとに合計するので、受注番号でグループにまとめる。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "500",
      explain: "J1 は P1 が 2 × 100 = 200、P2 が 1 × 300 = 300。合計 500。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "300",
      explain: "J2 は P1 が 3 × 100 = 300。",
    },
  ],
  points: [
    "3 つ以上の表は、関連（外部キー = 主キー）をたどって JOIN を重ねる。",
    "SUM の中には式を書ける。明細ごとに掛けてから足す。",
    "単価が後で変わると過去の受注の金額も変わる。受注時の金額を残したいなら、明細に受注単価を持たせる。",
  ],
};
