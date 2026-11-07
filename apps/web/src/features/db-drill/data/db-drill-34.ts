import type { DbDrill } from "../types";

/** 実行結果：CASE 式と SUM による条件付き集計（クロス集計）。 */
export const DB_DRILL_34: DbDrill = {
  id: "db-drill-34",
  topic: "実行結果",
  title: "店頭と通販の売上を横に並べて集計する",
  body: [
    {
      kind: "p",
      text: "X 社の売上の表には，販売の区分（店頭・通販）がある。店舗ごとに，店頭と通販の売上合計を 1 行に並べたい。",
    },
    {
      kind: "table",
      caption: "表 1　売上の行",
      headers: ["売上番号", "店舗", "区分", "金額"],
      rows: [
        ["1", "S1", "店頭", "100"],
        ["2", "S1", "通販", "200"],
        ["3", "S1", "店頭", "300"],
        ["4", "S2", "通販", "400"],
      ],
    },
    {
      kind: "code",
      caption: "図 1　区分ごとの合計を横に並べる SQL 文",
      lines: [
        "SELECT 店舗,",
        "       SUM(CASE WHEN 区分 = '店頭' THEN 金額 {{a}} 0 END) AS 店頭計,",
        "       SUM(CASE WHEN 区分 = '通販' THEN 金額 ELSE 0 END) AS 通販計",
        "  FROM 売上",
        " GROUP BY 店舗",
      ],
    },
    {
      kind: "table",
      caption: "表 2　図 1 の実行結果",
      headers: ["店舗", "店頭計", "通販計"],
      rows: [
        ["S1", "{{b}}", "200"],
        ["S2", "{{c}}", "400"],
      ],
    },
    {
      kind: "p",
      text: "空欄 a と 0 を取り除いて CASE WHEN 区分 = '店頭' THEN 金額 END とすると，S2 の店頭計は {{d}} になる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "ELSE",
      explain:
        "区分が店頭でない行は 0 として足す。どの WHEN にも当てはまらないときの値は ELSE に書く。",
    },
    {
      key: "b",
      hint: "数値",
      answer: "400",
      explain: "S1 の店頭は売上番号 1 と 3。100 + 300 = 400。通販の行は 0 として足される。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "0",
      explain: "S2 には店頭の売上が無い。通販の行が 0 として足されるので 0。",
    },
    {
      key: "d",
      hint: "値",
      answer: "NULL",
      explain:
        "ELSE を省くと、当てはまらない行の CASE の値は NULL になる。S2 は全行が NULL で、SUM は NULL を無視するので、足すものが無く結果は NULL。0 にしたいなら ELSE 0 か COALESCE を使う。",
    },
  ],
  points: [
    "SUM(CASE WHEN 条件 THEN 値 ELSE 0 END) で、条件に合う行だけを足せる（条件付き集計）。",
    "区分ごとに列を分けて 1 行に並べる形をクロス集計という。",
    "全ての値が NULL のときの SUM は 0 ではなく NULL。",
  ],
};
