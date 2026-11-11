import type { DbDrill } from "../types";

/** 実行結果：完全外部結合で、どちらか一方にしか無い行も並べる。 */
export const DB_DRILL_63: DbDrill = {
  id: "db-drill-63",
  topic: "実行結果",
  title: "完全外部結合で予算と実績を突き合わせる",
  body: [
    {
      kind: "p",
      text: "S 社では，部署ごとの予算と実績を別の表で管理しており，表 1・表 2 の行がある（単位は万円）。総務は今期まだ実績が無く，広報は予算を立てずに支出した。",
    },
    {
      kind: "table",
      caption: "表 1　予算の行",
      headers: ["部署", "予算額"],
      rows: [
        ["営業", "500"],
        ["開発", "800"],
        ["総務", "200"],
      ],
    },
    {
      kind: "table",
      caption: "表 2　実績の行",
      headers: ["部署", "実績額"],
      rows: [
        ["営業", "520"],
        ["開発", "750"],
        ["広報", "100"],
      ],
    },
    {
      kind: "p",
      text: "どちらか一方にしか無い部署も漏らさずに並べるため，図 1 の SQL 文を作成した。",
    },
    {
      kind: "code",
      caption: "図 1　予算と実績を突き合わせる SQL 文",
      lines: [
        "SELECT COALESCE(予算.部署, 実績.部署) AS 部署,",
        "       予算.予算額, 実績.実績額",
        "  FROM 予算 {{a}} 実績",
        "    ON 予算.部署 = 実績.部署",
      ],
    },
    {
      kind: "p",
      text: "図 1 の実行結果は {{b}} 行である。総務の行の実績額は {{c}} になる。",
    },
    {
      kind: "p",
      text: "1 行目を COALESCE を使わずに SELECT 予算.部署, … とすると，広報の行の部署は {{d}} になってしまう。",
    },
    {
      kind: "p",
      text: "空欄 a を INNER JOIN にすると，結果は {{e}} 行になる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "FULL OUTER JOIN",
      accepts: ["FULL JOIN"],
      explain:
        "左右どちらの表の行も、相手が無くても全て残すのは完全外部結合（FULL OUTER JOIN）。左だけ残すのが LEFT、右だけ残すのが RIGHT。",
    },
    {
      key: "b",
      hint: "数値",
      answer: "4",
      explain:
        "両方にある営業・開発の 2 行、予算だけにある総務の 1 行、実績だけにある広報の 1 行で 4 行。",
    },
    {
      key: "c",
      hint: "値（NULL なら NULL と書く）",
      answer: "NULL",
      explain: "総務は実績の表に相手が無いので、実績の列は NULL で補われる。",
    },
    {
      key: "d",
      hint: "値（NULL なら NULL と書く）",
      answer: "NULL",
      explain:
        "広報は予算の表に相手が無いので、予算.部署 は NULL。COALESCE で「予算側が NULL なら実績側の部署」とすれば、どの行にも部署名が出る。",
    },
    {
      key: "e",
      hint: "数値",
      answer: "2",
      explain: "両方の表にある営業と開発の 2 行だけになる。",
    },
  ],
  points: [
    "完全外部結合（FULL OUTER JOIN）は、左右どちらの行も相手が無くても残す。",
    "相手の無い側の列は NULL。結合に使った列は COALESCE(左.列, 右.列) で 1 つにまとめる。",
    "結合の種類と行数：内部 ⊂ 左（右）外部 ⊂ 完全外部。",
  ],
};
