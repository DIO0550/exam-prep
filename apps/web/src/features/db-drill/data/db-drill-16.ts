import type { DbDrill } from "../types";

/** SELECT と結合：同じ表どうしを結合する（自己結合）。 */
export const DB_DRILL_16: DbDrill = {
  id: "db-drill-16",
  topic: "SELECT と結合",
  title: "社員と上司を自己結合で並べる",
  body: [
    {
      kind: "p",
      text: "G 社の社員の表では，各社員の上司を上司社員番号で表す。上司社員番号は同じ社員の表の社員番号を参照する外部キーで，社長には上司がいないので NULL である。",
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
            { name: "上司社員番号", key: "fk" },
          ],
        },
      ],
    },
    {
      kind: "table",
      caption: "表 1　社員の行",
      headers: ["社員番号", "氏名", "上司社員番号"],
      rows: [
        ["S01", "青木", "NULL"],
        ["S02", "井上", "S01"],
        ["S03", "上田", "S01"],
        ["S04", "江藤", "S02"],
      ],
    },
    {
      kind: "p",
      text: "全社員について，本人の氏名と上司の氏名を並べるため，図 2 の SQL 文を作成した。同じ表を 2 回使うので，それぞれに相関名（部下・上司）を付けている。",
    },
    {
      kind: "code",
      caption: "図 2　社員と上司の氏名を並べる SQL 文",
      lines: [
        "SELECT 部下.氏名 AS 社員氏名, 上司.氏名 AS 上司氏名",
        "  FROM 社員 {{a}} 部下",
        "  {{b}} 社員 上司",
        "    ON 部下.{{c}} = 上司.社員番号",
        " ORDER BY 部下.社員番号",
      ],
    },
    {
      kind: "table",
      caption: "表 2　図 2 の実行結果",
      headers: ["社員氏名", "上司氏名"],
      rows: [
        ["青木", "{{d}}"],
        ["井上", "青木"],
        ["上田", "青木"],
        ["江藤", "{{e}}"],
      ],
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "AS",
      explain:
        "表に別名（相関名）を付けるのは AS。FROM 社員 AS 部下 で、この SQL 文の中では社員の表を「部下」と呼べる。AS は省略して FROM 社員 部下 とも書ける。",
    },
    {
      key: "b",
      hint: "SQL のキーワード",
      answer: "LEFT OUTER JOIN",
      accepts: ["LEFT JOIN"],
      explain:
        "社長（青木）は上司社員番号が NULL で、結合の相手が無い。内部結合だと青木の行が消えるので、左外部結合で部下側の全行を残す。",
    },
    {
      key: "c",
      hint: "列名",
      answer: "上司社員番号",
      explain: "部下の行の上司社員番号と、上司の行の社員番号が一致する行どうしを結び付ける。",
    },
    {
      key: "d",
      hint: "値",
      answer: "NULL",
      explain: "青木には上司がいないので、外部結合で補われた上司側の列は NULL になる。",
    },
    {
      key: "e",
      hint: "氏名",
      answer: "井上",
      explain: "江藤の上司社員番号は S02。S02 の社員は井上。",
    },
  ],
  points: [
    "同じ表を 2 回使う自己結合では、相関名で「どちらの役割の表か」を区別する。",
    "上下関係・親子関係（上司と部下、親部署と子部署）は、自分の表を参照する外部キーで表す。",
    "相手がいない行（社長）も残すなら外部結合。",
  ],
};
