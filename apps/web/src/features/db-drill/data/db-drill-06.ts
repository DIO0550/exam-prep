import type { DbDrill } from "../types";

/** 集約と副問合せ：NOT EXISTS と相関副問合せ。 */
export const DB_DRILL_06: DbDrill = {
  id: "db-drill-06",
  topic: "集約と副問合せ",
  title: "講座の予約：副問合せで絞り込む",
  body: [
    {
      kind: "p",
      text: "X 社のカルチャー教室では，会員の講座予約を次の表で管理している。",
    },
    {
      kind: "schema",
      caption: "図 1　関係スキーマ",
      schemas: [
        { name: "会員", columns: [{ name: "会員番号", key: "pk" }, { name: "氏名" }] },
        {
          name: "講座",
          columns: [{ name: "講座コード", key: "pk" }, { name: "講座名" }, { name: "定員" }],
        },
        {
          name: "予約",
          columns: [
            { name: "予約番号", key: "pk" },
            { name: "会員番号", key: "fk" },
            { name: "講座コード", key: "fk" },
            { name: "予約日" },
          ],
        },
      ],
    },
    {
      kind: "p",
      text: "一度も予約をしていない会員に案内を送るため，図 2 の SQL 文を作成した。",
    },
    {
      kind: "code",
      caption: "図 2　予約をしていない会員を求める SQL 文",
      lines: [
        "SELECT 会員.会員番号, 会員.氏名",
        "  FROM 会員",
        " WHERE {{a}} (SELECT * FROM 予約",
        "                WHERE 予約.会員番号 = {{b}})",
      ],
    },
    {
      kind: "p",
      text: "また，予約数が定員に達した講座を求めるため，図 3 の SQL 文を作成した。",
    },
    {
      kind: "code",
      caption: "図 3　予約数が定員に達した講座を求める SQL 文",
      lines: [
        "SELECT 講座.講座コード, 講座.講座名",
        "  FROM 講座",
        " WHERE 講座.定員 <= (SELECT {{c}} FROM 予約",
        "                     WHERE 予約.講座コード = 講座.講座コード)",
      ],
    },
    {
      kind: "p",
      text: "図 2・図 3 の副問合せのように，外側の問合せの行の値を参照し，その行ごとに評価される副問合せを {{d}} という。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "NOT EXISTS",
      explain:
        "副問合せの結果が 1 行も無いときに真になるのは NOT EXISTS。その会員の予約が 1 件も無い会員だけが残る。",
    },
    {
      key: "b",
      hint: "表名.列名",
      answer: "会員.会員番号",
      explain:
        "外側の会員の行と結び付けるので、会員.会員番号と書く。表名を付けずに「会員番号」とだけ書くと、副問合せの中では予約.会員番号と解釈され、常に真の条件になってしまう。",
    },
    {
      key: "c",
      hint: "集約関数",
      answer: "COUNT(*)",
      accepts: ["COUNT(予約.予約番号)", "COUNT(予約番号)"],
      explain:
        "その講座の予約の行数を数える。予約数が定員以上なら定員に達している。COUNT(予約.予約番号) でも、予約番号は NULL にならないので同じ結果になる。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "相関副問合せ" },
        { key: "イ", text: "スカラ副問合せ" },
        { key: "ウ", text: "導出表" },
        { key: "エ", text: "再帰問合せ" },
      ],
      answer: "ア",
      explain:
        "外側の表の列（会員.会員番号、講座.講座コード）を中で参照する副問合せは相関副問合せ。外側の 1 行ごとに副問合せが評価される。",
    },
  ],
  points: [
    "「〜が無いもの」は NOT EXISTS（または NOT IN）。NOT IN は副問合せの結果に NULL があると 1 行も返らないので注意。",
    "相関副問合せでは、外側の表の列に必ず表名を付ける。",
    "1 つの値を返す副問合せ（スカラ副問合せ）は、比較演算子の右辺に置ける。",
  ],
};
