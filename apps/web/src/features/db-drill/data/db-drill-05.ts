import type { DbDrill } from "../types";

/** 集約と副問合せ：GROUP BY・HAVING・降順の並べ替え。 */
export const DB_DRILL_05: DbDrill = {
  id: "db-drill-05",
  topic: "集約と副問合せ",
  title: "店舗ごとの売上合計を絞り込む",
  body: [
    {
      kind: "p",
      text: "W 社は複数の店舗で販売を行っており，売上を次の表で管理している。",
    },
    {
      kind: "schema",
      caption: "図 1　関係スキーマ",
      schemas: [
        {
          name: "店舗",
          columns: [{ name: "店舗コード", key: "pk" }, { name: "店舗名" }, { name: "地域" }],
        },
        {
          name: "売上",
          columns: [
            { name: "売上番号", key: "pk" },
            { name: "店舗コード", key: "fk" },
            { name: "売上日" },
            { name: "金額" },
          ],
        },
      ],
    },
    {
      kind: "p",
      text: "2026 年 10 月の売上合計が 100 万円以上の店舗を，売上合計の多い順に一覧にするため，図 2 の SQL 文を作成した。",
    },
    {
      kind: "code",
      caption: "図 2　売上合計が 100 万円以上の店舗を求める SQL 文",
      lines: [
        "SELECT 売上.店舗コード, SUM(売上.金額) AS 売上合計",
        "  FROM 売上",
        " WHERE 売上.売上日 BETWEEN '2026-10-01' AND '2026-10-31'",
        " {{a}} 売上.店舗コード",
        " {{b}} SUM(売上.金額) >= 1000000",
        " ORDER BY 売上合計 {{c}}",
      ],
    },
    {
      kind: "p",
      text: "図 2 で，期間の条件を WHERE 句に書き，金額の条件を空欄 b の句に書いているのは，{{d}} からである。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "GROUP BY",
      explain:
        "店舗ごとに合計を出すので、店舗コードでグループにまとめる。SELECT に集約関数以外で書いた列は、GROUP BY にも書く。",
    },
    {
      key: "b",
      hint: "SQL のキーワード",
      answer: "HAVING",
      explain: "合計（集約した値）に対する条件は HAVING に書く。WHERE には集約関数を書けない。",
    },
    {
      key: "c",
      hint: "SQL のキーワード",
      answer: "DESC",
      explain: "多い順は降順（DESC）。何も書かないと昇順（ASC）になる。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        {
          key: "ア",
          text: "WHERE 句はグループにまとめる前の行を絞り込み，HAVING 句はまとめた後のグループを絞り込む",
        },
        {
          key: "イ",
          text: "WHERE 句はグループにまとめた後のグループを絞り込み，HAVING 句はまとめる前の行を絞り込む",
        },
        { key: "ウ", text: "HAVING 句には日付の条件を書けない" },
        { key: "エ", text: "WHERE 句と HAVING 句は同時に使えない" },
      ],
      answer: "ア",
      explain:
        "処理の順は FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY。10 月の行だけを集計したいので期間は WHERE で先に絞り、合計が出た後の条件は HAVING で絞る。",
    },
  ],
  points: [
    "評価の順：FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY。",
    "集約関数（SUM・COUNT・AVG・MAX・MIN）の条件は HAVING。",
    "ORDER BY では SELECT で付けた別名（売上合計）を使える。",
  ],
};
