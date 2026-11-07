import type { DbDrill } from "../types";

/** 集約と副問合せ：DISTINCT と COUNT(DISTINCT …)。 */
export const DB_DRILL_19: DbDrill = {
  id: "db-drill-19",
  topic: "集約と副問合せ",
  title: "重複を除いて数える",
  body: [
    {
      kind: "p",
      text: "J 社の注文の表には，表 1 の行がある。",
    },
    {
      kind: "table",
      caption: "表 1　注文の行",
      headers: ["注文番号", "顧客番号", "商品コード"],
      rows: [
        ["1", "C1", "P1"],
        ["2", "C1", "P2"],
        ["3", "C2", "P1"],
        ["4", "C3", "P1"],
        ["5", "C1", "P1"],
      ],
    },
    {
      kind: "p",
      text: "注文したことのある顧客の一覧を，同じ顧客が 1 回だけ出るように求めるため，図 1 の SQL 文を作成した。",
    },
    {
      kind: "code",
      caption: "図 1　注文した顧客の一覧を求める SQL 文",
      lines: ["SELECT {{a}} 顧客番号", "  FROM 注文"],
    },
    { kind: "p", text: "図 1 の実行結果は {{b}} 行になる。次に，件数を図 2 の SQL 文で数えた。" },
    {
      kind: "code",
      caption: "図 2　件数を数える SQL 文",
      lines: [
        "SELECT COUNT(*),",
        "       COUNT(DISTINCT 顧客番号),",
        "       COUNT(DISTINCT 商品コード)",
        "  FROM 注文",
      ],
    },
    {
      kind: "table",
      caption: "表 2　図 2 の実行結果",
      headers: ["COUNT(*)", "COUNT(DISTINCT 顧客番号)", "COUNT(DISTINCT 商品コード)"],
      rows: [["5", "{{c}}", "{{d}}"]],
    },
    {
      kind: "p",
      text: "また，SELECT DISTINCT 顧客番号, 商品コード FROM 注文 の結果は {{e}} 行になる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "DISTINCT",
      explain: "SELECT DISTINCT は、結果から重複する行を取り除く。",
    },
    {
      key: "b",
      hint: "数値",
      answer: "3",
      explain: "顧客番号は C1・C2・C3 の 3 種類。C1 は 3 回注文しているが 1 行にまとまる。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "3",
      explain: "COUNT(DISTINCT 列) は、重複を除いた値の種類を数える。顧客は 3 人。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "2",
      explain: "商品コードは P1 と P2 の 2 種類。",
    },
    {
      key: "e",
      hint: "数値",
      answer: "4",
      explain:
        "DISTINCT は SELECT に並べた列の組で重複を判定する。（C1, P1）は 2 回あるので 1 行になり、（C1, P1）（C1, P2）（C2, P1）（C3, P1）の 4 行。",
    },
  ],
  points: [
    "SELECT DISTINCT は行全体（並べた列の組）で重複を除く。",
    "COUNT(*) は行数、COUNT(DISTINCT 列) は値の種類の数。",
    "「何人の顧客が」と問われたら、行数ではなく種類を数える。",
  ],
};
