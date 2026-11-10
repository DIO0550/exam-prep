import type { DbDrill } from "../types";

/** SELECT と結合：左外部結合と IS NULL で、相手の無い行だけを取り出す。 */
export const DB_DRILL_47: DbDrill = {
  id: "db-drill-47",
  topic: "SELECT と結合",
  title: "一度も売れていない商品を外部結合で探す",
  body: [
    {
      kind: "p",
      text: "A 社の雑貨店では，商品と売上の明細を次の表で管理している。",
    },
    {
      kind: "schema",
      caption: "図 1　関係スキーマ",
      schemas: [
        { name: "商品", columns: [{ name: "商品コード", key: "pk" }, { name: "商品名" }] },
        {
          name: "売上明細",
          columns: [
            { name: "売上番号", key: "pk" },
            { name: "明細番号", key: "pk" },
            { name: "商品コード", key: "fk" },
            { name: "数量" },
          ],
        },
      ],
    },
    {
      kind: "table",
      caption: "表 1　商品の行",
      headers: ["商品コード", "商品名"],
      rows: [
        ["P1", "ボールペン"],
        ["P2", "ノート"],
        ["P3", "消しゴム"],
        ["P4", "定規"],
      ],
    },
    {
      kind: "table",
      caption: "表 2　売上明細の行",
      headers: ["売上番号", "明細番号", "商品コード", "数量"],
      rows: [
        ["1", "1", "P1", "2"],
        ["1", "2", "P2", "1"],
        ["2", "1", "P1", "5"],
      ],
    },
    {
      kind: "p",
      text: "一度も売れていない商品を棚から下ろす候補にするため，図 2 の SQL 文を作成した。",
    },
    {
      kind: "code",
      caption: "図 2　一度も売れていない商品を求める SQL 文",
      lines: [
        "SELECT 商品.商品コード, 商品.商品名",
        "  FROM 商品 {{a}} 売上明細",
        "    ON 商品.商品コード = 売上明細.商品コード",
        " WHERE 売上明細.売上番号 {{b}}",
      ],
    },
    {
      kind: "p",
      text: "図 2 から WHERE 句を除いて実行すると，結果は {{c}} 行になる。図 2 の実行結果は {{d}} 行である。",
    },
    {
      kind: "p",
      text: "空欄 b を = NULL と書くと，結果は {{e}} 行になる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "LEFT OUTER JOIN",
      accepts: ["LEFT JOIN"],
      explain:
        "売れていない商品は売上明細に相手の行が無い。内部結合では消えてしまうので、左の表（商品）の行を全部残す左外部結合にする。",
    },
    {
      key: "b",
      hint: "SQL のキーワード",
      answer: "IS NULL",
      explain:
        "外部結合で相手が無い行は、売上明細の列が全て NULL になる。NULL かどうかは IS NULL で調べる。売上番号は主キーの一部で、本当の行なら NULL にならないので、NULL なら「相手が無い」と言い切れる。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "5",
      explain:
        "P1 は売上明細の 2 行と結び付いて 2 行、P2 は 1 行。P3・P4 は相手が無いので、売上明細の列が NULL の行が 1 行ずつできる。2 + 1 + 1 + 1 = 5 行。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "2",
      explain: "売上明細の列が NULL になった P3（消しゴム）と P4（定規）の 2 行が残る。",
    },
    {
      key: "e",
      hint: "数値",
      answer: "0",
      explain:
        "NULL との = の比較は、相手が NULL でも真ではなく「不明」になる。WHERE で真にならないので 1 行も残らない。NULL を調べるときは必ず IS NULL を使う。",
    },
  ],
  points: [
    "「相手の無い行」は、外部結合 ＋ 相手側の列 IS NULL で取り出せる。NOT EXISTS で書いても同じ結果になる。",
    "IS NULL で調べる列は、相手側の主キーのように、本当の行では NULL にならない列を選ぶ。",
    "列 = NULL は常に不明になる。NULL の判定は IS NULL ／ IS NOT NULL。",
  ],
};
