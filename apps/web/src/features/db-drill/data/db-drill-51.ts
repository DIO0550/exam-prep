import type { DbDrill } from "../types";

/** 集約と副問合せ：GROUP BY と HAVING COUNT(DISTINCT …) で「全てに当てはまるもの」を求める。 */
export const DB_DRILL_51: DbDrill = {
  id: "db-drill-51",
  topic: "集約と副問合せ",
  title: "全店舗で売れた商品を HAVING で求める",
  body: [
    {
      kind: "p",
      text: "E 社には 3 つの店舗があり，店舗と売上の表には表 1・表 2 の行がある。",
    },
    {
      kind: "table",
      caption: "表 1　店舗の行",
      headers: ["店舗コード", "店舗名"],
      rows: [
        ["S1", "駅前店"],
        ["S2", "本町店"],
        ["S3", "港店"],
      ],
    },
    {
      kind: "table",
      caption: "表 2　売上の行",
      headers: ["売上番号", "店舗コード", "商品コード"],
      rows: [
        ["1", "S1", "P1"],
        ["2", "S1", "P2"],
        ["3", "S1", "P2"],
        ["4", "S2", "P1"],
        ["5", "S2", "P3"],
        ["6", "S3", "P1"],
        ["7", "S3", "P2"],
      ],
    },
    {
      kind: "p",
      text: "全ての店舗で 1 回以上売れた商品を求めるため，図 1 の SQL 文を作成した。",
    },
    {
      kind: "code",
      caption: "図 1　全店舗で売れた商品を求める SQL 文",
      lines: [
        "SELECT 商品コード",
        "  FROM 売上",
        " GROUP BY 商品コード",
        "HAVING COUNT({{a}} 店舗コード) = (SELECT {{b}} FROM 店舗)",
      ],
    },
    {
      kind: "p",
      text: "図 1 の実行結果は，商品コード {{c}} の 1 行である。",
    },
    {
      kind: "p",
      text: "空欄 a を書かずに COUNT(店舗コード) とすると，全店舗では売れていない商品 {{d}} も結果に含まれてしまう。",
    },
    {
      kind: "p",
      text: "図 1 のように「全ての〜について当てはまるもの」を求める操作は，関係代数の {{e}} に当たる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "DISTINCT",
      explain:
        "数えたいのは、その商品が売れた店舗の種類の数。同じ店舗で何回売れても 1 店舗と数えるため、COUNT(DISTINCT 店舗コード) にする。",
    },
    {
      key: "b",
      hint: "集約関数",
      answer: "COUNT(*)",
      accepts: ["COUNT(店舗コード)", "COUNT(店舗.店舗コード)"],
      explain: "比べる相手は店舗の総数。店舗の表の行数を数える。",
    },
    {
      key: "c",
      hint: "商品コード",
      answer: "P1",
      explain:
        "P1 は S1・S2・S3 の 3 店舗で売れ、店舗数 3 と等しい。P2 は S1 と S3 の 2 店舗、P3 は S2 の 1 店舗。",
    },
    {
      key: "d",
      hint: "商品コード",
      answer: "P2",
      explain:
        "P2 の売上は S1 で 2 回、S3 で 1 回の計 3 行。DISTINCT が無いと行数の 3 を数えてしまい、店舗数 3 と等しくなる。S2 では売れていないのに結果に入る。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "商" },
        { key: "イ", text: "直積" },
        { key: "ウ", text: "射影" },
        { key: "エ", text: "和" },
      ],
      answer: "ア",
      explain:
        "「全ての店舗と組になっている商品」を求めるのは商（割り算）。SQL では、図 1 のように数を比べるか、NOT EXISTS を 2 重にして書く。",
    },
  ],
  points: [
    "「全ての〜で」は、グループごとに種類の数を数えて、全体の数と等しいかを HAVING で比べる。",
    "種類の数は COUNT(DISTINCT 列)。同じ値の重複を数えないように注意する。",
    "HAVING はグループにまとめた後の条件。副問合せの結果とも比べられる。",
  ],
};
