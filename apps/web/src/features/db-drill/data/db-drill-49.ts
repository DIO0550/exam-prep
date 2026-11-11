import type { DbDrill } from "../types";

/** SELECT と結合：ORDER BY と FETCH FIRST で上位の行を取り出す。同順位の扱い。 */
export const DB_DRILL_49: DbDrill = {
  id: "db-drill-49",
  topic: "SELECT と結合",
  title: "売上の上位 3 件だけを取り出す",
  body: [
    {
      kind: "p",
      text: "C 社では，商品ごとの今月の売上額を表 1 のようにまとめている。",
    },
    {
      kind: "table",
      caption: "表 1　商品売上の行",
      headers: ["商品コード", "売上額"],
      rows: [
        ["P1", "500"],
        ["P2", "900"],
        ["P3", "700"],
        ["P4", "500"],
        ["P5", "300"],
      ],
    },
    {
      kind: "p",
      text: "売上額の多い順に上位 3 件を表示するため，図 1 の SQL 文を作成した。売上額が同じときは商品コードの昇順に並べる。",
    },
    {
      kind: "code",
      caption: "図 1　売上の上位 3 件を求める SQL 文",
      lines: [
        "SELECT 商品コード, 売上額",
        "  FROM 商品売上",
        " ORDER BY 売上額 {{a}}, 商品コード",
        " {{b}} 3 ROWS ONLY",
      ],
    },
    {
      kind: "p",
      text: "図 1 の実行結果の 3 行目の商品コードは {{c}} である。",
    },
    {
      kind: "p",
      text: "ORDER BY 句から商品コードを除き，ROWS ONLY を ROWS WITH TIES に変えると，3 件目と同じ売上額の行も含めて返すので，結果は {{d}} 行になる。",
    },
    {
      kind: "p",
      text: "ORDER BY 句を付けずに FETCH FIRST 3 ROWS ONLY だけを書くと，{{e}}。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "DESC",
      explain: "多い順は降順なので DESC。何も書かなければ昇順（ASC）になる。",
    },
    {
      key: "b",
      hint: "SQL のキーワード",
      answer: "FETCH FIRST",
      accepts: ["FETCH NEXT"],
      explain:
        "並べた結果の先頭から n 行だけを返すのは FETCH FIRST n ROWS ONLY（標準 SQL）。DBMS によっては LIMIT 3 や TOP 3 と書くものもある。",
    },
    {
      key: "c",
      hint: "商品コード",
      answer: "P1",
      explain:
        "売上額の降順に P2（900）、P3（700）と並び、500 の P1 と P4 は商品コードの昇順で P1 が先になる。3 行目は P1。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "4",
      explain:
        "WITH TIES は、最後の行と ORDER BY の値が同じ行も一緒に返す。3 件目の 500 と同じ P4 も入り、P2・P3・P1・P4 の 4 行。商品コードを ORDER BY に残したままだと同じ値の行が無いので、3 行のまま。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "どの 3 行が返るかは決まらない" },
        { key: "イ", text: "主キーの昇順に並べた先頭の 3 行が必ず返る" },
        { key: "ウ", text: "表に登録した順の先頭の 3 行が必ず返る" },
        { key: "エ", text: "構文の誤りになり，実行できない" },
      ],
      answer: "ア",
      explain:
        "関係データベースの表の行には順序が無い。ORDER BY が無ければ結果の順序は DBMS 任せなので、「上位 3 件」の意味にならない。上位を取るときは必ず ORDER BY と組み合わせる。",
    },
  ],
  points: [
    "上位 n 件：ORDER BY 列 DESC FETCH FIRST n ROWS ONLY。ORDER BY が無いと、どの行が返るか決まらない。",
    "同じ値の行で並びを決めたいときは、ORDER BY に 2 つ目のキーを書く。",
    "WITH TIES は、n 件目と同じ値の行も一緒に返す。",
  ],
};
