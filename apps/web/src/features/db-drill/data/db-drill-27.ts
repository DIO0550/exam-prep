import type { DbDrill } from "../types";

/** 更新と制約：副問合せを使った UPDATE。 */
export const DB_DRILL_27: DbDrill = {
  id: "db-drill-27",
  topic: "更新と制約",
  title: "カテゴリを指定して単価を上げる",
  body: [
    {
      kind: "p",
      text: "Q 社では，原材料費の値上がりに合わせて，カテゴリ名が「文具」の商品の単価を一律 1 割上げることにした。カテゴリ名は一意とは限らず，「文具」という名前のカテゴリが複数ある。",
    },
    {
      kind: "schema",
      caption: "図 1　関係スキーマ",
      schemas: [
        {
          name: "カテゴリ",
          columns: [{ name: "カテゴリコード", key: "pk" }, { name: "カテゴリ名" }],
        },
        {
          name: "商品",
          columns: [
            { name: "商品コード", key: "pk" },
            { name: "カテゴリコード", key: "fk" },
            { name: "単価" },
          ],
        },
      ],
    },
    {
      kind: "code",
      caption: "図 2　単価を 1 割上げる SQL 文",
      lines: [
        "UPDATE 商品",
        "   {{a}} 単価 = 単価 * {{b}}",
        " WHERE 商品.カテゴリコード {{c}}",
        "       (SELECT カテゴリ.カテゴリコード FROM カテゴリ",
        "         WHERE カテゴリ.カテゴリ名 = '文具')",
      ],
    },
    {
      kind: "p",
      text: "図 2 で WHERE 句を書き忘れると，{{d}}。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "SET",
      explain: "UPDATE 表名 SET 列 = 式。右辺の単価は更新前の値。",
    },
    {
      key: "b",
      hint: "数値",
      answer: "1.1",
      explain: "1 割上げるので 1.1 倍。0.1 を掛けると、単価が元の 1 割に下がってしまう。",
    },
    {
      key: "c",
      hint: "SQL のキーワード",
      answer: "IN",
      explain:
        "「文具」のカテゴリが複数あるので、副問合せは 2 行以上を返しうる。= ではエラーになるので IN を使う。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "全ての商品の単価が 1 割上がる" },
        { key: "イ", text: "どの商品も更新されない" },
        { key: "ウ", text: "構文エラーになる" },
        { key: "エ", text: "最初の 1 行だけが更新される" },
      ],
      answer: "ア",
      explain: "UPDATE の WHERE は更新する行の条件。書かなければ全行が対象になる。DELETE も同じ。",
    },
  ],
  points: [
    "UPDATE 表 SET 列 = 式 WHERE 条件。条件に副問合せを使える。",
    "副問合せが複数行を返しうるなら IN。",
    "WHERE の無い UPDATE ／ DELETE は全行が対象になる。",
  ],
};
