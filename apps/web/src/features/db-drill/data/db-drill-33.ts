import type { DbDrill } from "../types";

/** 実行結果：外部結合の相手側の条件を WHERE に書くか ON に書くか。 */
export const DB_DRILL_33: DbDrill = {
  id: "db-drill-33",
  topic: "実行結果",
  title: "外部結合の条件は ON か WHERE か",
  body: [
    {
      kind: "p",
      text: "W 社の顧客と注文の表には，表 1・表 2 の行がある。",
    },
    {
      kind: "table",
      caption: "表 1　顧客の行",
      headers: ["顧客番号", "顧客名"],
      rows: [
        ["C1", "山田"],
        ["C2", "佐藤"],
        ["C3", "鈴木"],
      ],
    },
    {
      kind: "table",
      caption: "表 2　注文の行",
      headers: ["注文番号", "顧客番号", "注文日"],
      rows: [
        ["O1", "C1", "2026-10-05"],
        ["O2", "C1", "2026-11-02"],
        ["O3", "C3", "2026-11-03"],
      ],
    },
    {
      kind: "code",
      caption: "図 1　顧客と注文を外部結合する SQL 文",
      lines: [
        "SELECT 顧客.顧客番号, 注文.注文番号",
        "  FROM 顧客 LEFT OUTER JOIN 注文",
        "    ON 顧客.顧客番号 = 注文.顧客番号",
      ],
    },
    {
      kind: "p",
      text: "図 1 の実行結果は {{a}} 行である。11 月の注文だけを顧客の全員分並べようとして，図 1 に WHERE 注文.注文日 >= '2026-11-01' を加えたところ，結果は {{b}} 行になった。",
    },
    {
      kind: "p",
      text: "この条件を WHERE 句ではなく，ON 顧客.顧客番号 = 注文.顧客番号 AND 注文.注文日 >= '2026-11-01' のように ON 句に書くと，結果は {{c}} 行になる。",
    },
    {
      kind: "p",
      text: "WHERE 句に書いたときに佐藤（C2）の行が結果から消えたのは，{{d}} からである。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "数値",
      answer: "4",
      explain:
        "C1 は O1・O2 の 2 行、C2 は注文が無いので注文番号が NULL の 1 行、C3 は O3 の 1 行。合計 4 行。",
    },
    {
      key: "b",
      hint: "数値",
      answer: "2",
      explain:
        "外部結合の結果に対して WHERE が働く。O1（10 月）の行と、注文日が NULL の C2 の行は条件が真にならず除かれ、C1-O2 と C3-O3 の 2 行になる。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "3",
      explain:
        "ON の条件は「どの注文と結び付けるか」の条件。11 月の注文だけが結び付き、相手の無い顧客は外部結合で残る。C1-O2、C2-NULL、C3-O3 の 3 行。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "外部結合で補われた NULL の注文日は，WHERE の比較で真にならず除かれる" },
        { key: "イ", text: "LEFT OUTER JOIN は WHERE 句と一緒に使えない" },
        { key: "ウ", text: "WHERE 句は結合の前に評価される" },
        { key: "エ", text: "佐藤の注文日が 10 月だった" },
      ],
      answer: "ア",
      explain:
        "NULL >= '2026-11-01' は不明なので、WHERE で行が残らない。結果として内部結合と同じになってしまう。相手側の表の条件は ON に書くのが定石。",
    },
  ],
  points: [
    "外部結合の相手側（右の表）の条件を WHERE に書くと、NULL の行が消えて内部結合と同じになる。",
    "相手側の条件は ON に書く。左の表の行を絞る条件は WHERE に書く。",
    "評価の順は FROM（結合と ON）→ WHERE。",
  ],
};
