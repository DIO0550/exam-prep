import type { DbDrill } from "../types";

/** SELECT と結合：左外部結合と COUNT の引数、結果の表。 */
export const DB_DRILL_04: DbDrill = {
  id: "db-drill-04",
  topic: "SELECT と結合",
  title: "注文の無い顧客も含めて件数を数える",
  body: [
    {
      kind: "p",
      text: "V 社の通信販売システムには，次の表がある。",
    },
    {
      kind: "schema",
      caption: "図 1　関係スキーマ",
      schemas: [
        { name: "顧客", columns: [{ name: "顧客番号", key: "pk" }, { name: "顧客名" }] },
        {
          name: "注文",
          columns: [
            { name: "注文番号", key: "pk" },
            { name: "顧客番号", key: "fk" },
            { name: "注文日" },
          ],
        },
      ],
    },
    {
      kind: "p",
      text: "一度も注文していない顧客も含めて，顧客ごとの注文件数を求めるため，図 2 の SQL 文を作成した。",
    },
    {
      kind: "code",
      caption: "図 2　顧客ごとの注文件数を求める SQL 文",
      lines: [
        "SELECT 顧客.顧客番号, 顧客.顧客名, COUNT({{a}}) AS 注文件数",
        "  FROM 顧客 {{b}} 注文",
        "    ON 顧客.顧客番号 = 注文.顧客番号",
        " GROUP BY 顧客.顧客番号, 顧客.顧客名",
      ],
    },
    {
      kind: "table",
      caption: "表 1　顧客の行",
      headers: ["顧客番号", "顧客名"],
      rows: [
        ["C01", "山田"],
        ["C02", "佐藤"],
        ["C03", "鈴木"],
      ],
    },
    {
      kind: "table",
      caption: "表 2　注文の行",
      headers: ["注文番号", "顧客番号", "注文日"],
      rows: [
        ["O1", "C01", "2026-10-03"],
        ["O2", "C01", "2026-10-15"],
        ["O3", "C03", "2026-10-20"],
      ],
    },
    {
      kind: "p",
      text: "表 1・表 2 の行に対して図 2 の SQL 文を実行すると，結果は表 3 になる。",
    },
    {
      kind: "table",
      caption: "表 3　図 2 の実行結果",
      headers: ["顧客番号", "顧客名", "注文件数"],
      rows: [
        ["C01", "山田", "2"],
        ["C02", "佐藤", "{{c}}"],
        ["C03", "鈴木", "1"],
      ],
    },
    {
      kind: "p",
      text: "なお，空欄 a を * にして COUNT(*) とすると，佐藤の注文件数は {{d}} になってしまう。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: [
        { key: "ア", text: "*" },
        { key: "イ", text: "注文.注文番号" },
        { key: "ウ", text: "顧客.顧客番号" },
        { key: "エ", text: "DISTINCT 顧客.顧客番号" },
      ],
      answer: "イ",
      explain:
        "COUNT(列) は、その列が NULL でない行だけを数える。注文の無い顧客は外部結合で注文側の列が NULL になるので、注文.注文番号を数えれば 0 件になる。顧客側の列や * では、その 1 行が数えられてしまう。",
    },
    {
      key: "b",
      hint: "SQL のキーワード",
      answer: "LEFT OUTER JOIN",
      accepts: ["LEFT JOIN"],
      explain:
        "左の表（顧客）の行を、右の表（注文）に対応する行が無くても全部残すのは左外部結合。OUTER は省略できる。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "0",
      explain:
        "佐藤（C02）の注文は無い。外部結合で注文番号が NULL の行が 1 行でき、COUNT(注文.注文番号) は NULL を数えないので 0。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "1",
      explain:
        "COUNT(*) は NULL かどうかに関係なく行を数える。外部結合でできた C02 の 1 行が数えられて 1 になる。",
    },
  ],
  points: [
    "相手の無い行も残したい → 外部結合。残したい表が左なら LEFT OUTER JOIN。",
    "外部結合で相手が無い行は、相手の表の列が全て NULL になる。",
    "COUNT(*) は行数、COUNT(列) は NULL でない値の数。外部結合と組み合わせるときは右の表の列を数える。",
  ],
};
