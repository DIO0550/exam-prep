import type { DbDrill } from "../types";

/** SELECT と結合：内部結合・範囲の条件・並べ替え。 */
export const DB_DRILL_03: DbDrill = {
  id: "db-drill-03",
  topic: "SELECT と結合",
  title: "社員と部署を結合して一覧にする",
  body: [
    {
      kind: "p",
      text: "U 社の人事システムでは，社員と部署を次の表で管理している。",
    },
    {
      kind: "schema",
      caption: "図 1　関係スキーマ",
      schemas: [
        {
          name: "社員",
          columns: [
            { name: "社員番号", key: "pk" },
            { name: "氏名" },
            { name: "部署コード", key: "fk" },
            { name: "入社年月日" },
          ],
        },
        { name: "部署", columns: [{ name: "部署コード", key: "pk" }, { name: "部署名" }] },
      ],
    },
    {
      kind: "p",
      text: "2020 年中に入社した社員の社員番号，氏名，部署名を，社員番号の昇順に一覧にするため，図 2 の SQL 文を作成した。所属する部署が決まっていない社員はいない。",
    },
    {
      kind: "code",
      caption: "図 2　2020 年入社の社員を一覧にする SQL 文",
      lines: [
        "SELECT 社員.社員番号, 社員.氏名, 部署.部署名",
        "  FROM 社員 {{a}} 部署",
        "    {{b}} 社員.部署コード = 部署.部署コード",
        " WHERE 社員.入社年月日 {{c}} '2020-01-01' AND '2020-12-31'",
        " {{d}} 社員.社員番号",
      ],
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "INNER JOIN",
      accepts: ["JOIN"],
      explain:
        "両方の表に対応する行があるものだけを取り出すのは内部結合（INNER JOIN）。INNER は省略して JOIN とも書ける。全社員に部署があるので、外部結合にする必要はない。",
    },
    {
      key: "b",
      hint: "SQL のキーワード",
      answer: "ON",
      explain: "JOIN で結合するときの結合条件は ON の後に書く。",
    },
    {
      key: "c",
      hint: "SQL のキーワード",
      answer: "BETWEEN",
      explain:
        "「A 以上 B 以下」は BETWEEN A AND B。両端の値を含む。入社年月日 >= '2020-01-01' AND 入社年月日 <= '2020-12-31' と同じ意味になる。",
    },
    {
      key: "d",
      hint: "SQL のキーワード",
      answer: "ORDER BY",
      explain: "並べ替えは ORDER BY。昇順（ASC）は省略できるので、列名だけ書けば昇順になる。",
    },
  ],
  points: [
    "内部結合：FROM 表1 INNER JOIN 表2 ON 結合条件。FROM 表1, 表2 WHERE 結合条件 と書いても同じ結果になる。",
    "BETWEEN は両端を含む。",
    "ORDER BY の既定は昇順（ASC）、降順は DESC。",
  ],
};
