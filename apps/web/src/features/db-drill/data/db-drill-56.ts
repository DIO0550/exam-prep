import type { DbDrill } from "../types";

/** 更新と制約：UPDATE の SET に相関副問合せを書き、集計した値を書き込む。 */
export const DB_DRILL_56: DbDrill = {
  id: "db-drill-56",
  topic: "更新と制約",
  title: "注文の合計を顧客の表に書き込む",
  body: [
    {
      kind: "p",
      text: "K 社では，顧客ごとの累計購入額を顧客の表に持たせ，夜間に注文の表から計算し直している。顧客の表と注文の表には，表 1・表 2 の行がある。",
    },
    {
      kind: "table",
      caption: "表 1　顧客の行（計算し直す前）",
      headers: ["顧客番号", "顧客名", "累計購入額"],
      rows: [
        ["C1", "山田", "0"],
        ["C2", "佐藤", "0"],
        ["C3", "鈴木", "0"],
      ],
    },
    {
      kind: "table",
      caption: "表 2　注文の行",
      headers: ["注文番号", "顧客番号", "金額"],
      rows: [
        ["O1", "C1", "3000"],
        ["O2", "C1", "2000"],
        ["O3", "C3", "1500"],
      ],
    },
    {
      kind: "code",
      caption: "図 1　累計購入額を計算し直す SQL 文",
      lines: [
        "UPDATE 顧客",
        "   SET 累計購入額 = (SELECT {{a}}(SUM(注文.金額), 0)",
        "                     FROM 注文",
        "                    WHERE 注文.顧客番号 = {{b}})",
      ],
    },
    {
      kind: "p",
      text: "図 1 を実行すると，C1 の累計購入額は 5000，C2 の累計購入額は {{c}} になる。",
    },
    {
      kind: "p",
      text: "空欄 a を使わずに SET 累計購入額 = (SELECT SUM(注文.金額) FROM 注文 WHERE …) とすると，C2 の累計購入額は {{d}} になってしまう。",
    },
    {
      kind: "p",
      text: "また，副問合せの WHERE 句を書き忘れると，どの顧客の累計購入額も {{e}} になる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "関数名",
      answer: "COALESCE",
      explain:
        "COALESCE(値, 0) は、値が NULL なら 0 を返す。注文の無い顧客は SUM が NULL になるので、0 に置き換える。",
    },
    {
      key: "b",
      hint: "表名.列名",
      answer: "顧客.顧客番号",
      explain:
        "更新している顧客の行ごとに、その顧客の注文だけを合計する相関副問合せにする。外側の顧客の列を参照するので、表名を付けて顧客.顧客番号と書く。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "0",
      explain: "C2 の注文は無い。SUM は NULL になるが、COALESCE で 0 になる。",
    },
    {
      key: "d",
      hint: "値（NULL なら NULL と書く）",
      answer: "NULL",
      explain:
        "対象の行が 1 行も無いときの SUM は 0 ではなく NULL。そのまま書き込むと、累計購入額が NULL になる（列に NOT NULL 制約があれば、エラーになる）。",
    },
    {
      key: "e",
      hint: "数値",
      answer: "6500",
      explain:
        "顧客と結び付ける条件が無いと、毎回すべての注文を合計することになる。3000 + 2000 + 1500 = 6500 が全顧客に書き込まれる。",
    },
  ],
  points: [
    "UPDATE 表 SET 列 = (相関副問合せ) で、行ごとに別の表から集計した値を書き込める。",
    "対象が 0 行のとき、COUNT は 0、SUM・AVG・MAX・MIN は NULL を返す。0 にしたいなら COALESCE を使う。",
    "UPDATE に WHERE 句が無ければ、全ての行が更新される。",
  ],
};
