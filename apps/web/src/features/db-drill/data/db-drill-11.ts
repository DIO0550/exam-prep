import { relationChoices } from "../relation-choices";
import type { DbDrill } from "../types";

/** E-R 図：業務の記述から関連の線と外部キーを書き込む。 */
export const DB_DRILL_11: DbDrill = {
  id: "db-drill-11",
  topic: "E-R 図",
  title: "ネットスーパーの注文：関連の線を引く",
  body: [
    {
      kind: "p",
      text: "B 社はネットスーパーを運営している。注文管理のデータベースを設計するにあたり，業務を次のように整理した。",
    },
    {
      kind: "p",
      text: "会員は何回でも注文できる。1 回の注文では複数の商品を注文でき，注文の中の 1 行ずつを注文明細として，注文ごとに 1 から明細番号を振る。商品は必ず 1 つのカテゴリに属し，1 つのカテゴリには複数の商品がある。",
    },
    {
      kind: "p",
      text: "これを基に作成した E-R 図（一部の関連と属性は空欄）を図 1 に示す。",
    },
    {
      kind: "er",
      caption: "図 1　注文管理の E-R 図",
      entities: [
        {
          id: "member",
          name: "会員",
          col: 0,
          row: 0,
          attrs: [{ name: "会員番号", key: "pk" }, { name: "氏名" }, { name: "住所" }],
        },
        {
          id: "order",
          name: "注文",
          col: 1,
          row: 0,
          attrs: [
            { name: "注文番号", key: "pk" },
            { name: "会員番号", key: "fk" },
            { name: "注文日時" },
            { name: "配送希望日" },
          ],
        },
        {
          id: "category",
          name: "カテゴリ",
          col: 2,
          row: 0,
          attrs: [{ name: "カテゴリコード", key: "pk" }, { name: "カテゴリ名" }],
        },
        {
          id: "line",
          name: "注文明細",
          col: 1,
          row: 1,
          attrs: [
            { name: "注文番号", key: "pk" },
            { name: "明細番号", key: "pk" },
            { name: "商品コード", key: "fk" },
            { name: "数量" },
          ],
        },
        {
          id: "item",
          name: "商品",
          col: 2,
          row: 1,
          attrs: [
            { name: "商品コード", key: "pk" },
            { name: "商品名" },
            { name: "単価" },
            { name: "{{a}}", key: "fk" },
          ],
        },
      ],
      relations: [
        { from: "member", to: "order", blank: "b" },
        { from: "line", to: "order", blank: "c" },
        { from: "item", to: "category", blank: "d" },
        { from: "item", to: "line", kind: "1:N" },
      ],
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "属性名",
      answer: "カテゴリコード",
      explain:
        "商品は必ず 1 つのカテゴリに属するので、商品の側にカテゴリを指す外部キーを持たせる。カテゴリの主キーであるカテゴリコードを、破線の下線付きで加える。",
    },
    {
      key: "b",
      hint: "記号（引く線）",
      choices: relationChoices("会員", "注文"),
      answer: "イ",
      explain:
        "1 人の会員が何回も注文する。注文には外部キーの会員番号があり、1 つの注文の会員は 1 人に決まる。会員が 1、注文が多なので、注文の側に矢印を向ける。",
    },
    {
      key: "c",
      hint: "記号（引く線）",
      choices: relationChoices("注文明細", "注文"),
      answer: "ウ",
      explain:
        "1 回の注文に注文明細が何行もある。注文明細の主キー（注文番号，明細番号）の注文番号が注文を参照している。注文が 1、注文明細が多なので、矢印は注文明細の側（図では下）に向く。選択肢は左が注文明細なので「注文明細 ← 注文」。",
    },
    {
      key: "d",
      hint: "記号（引く線）",
      choices: relationChoices("商品", "カテゴリ"),
      answer: "ウ",
      explain:
        "1 つのカテゴリに商品が何件もあり、商品は 1 つのカテゴリに属する。カテゴリが 1、商品が多なので、商品の側に矢印を向ける。選択肢は左が商品なので「商品 ← カテゴリ」。",
    },
  ],
  points: [
    "関連の向きは、外部キーで見分ける。外部キーを持つ側が「多」で、矢印の先になる。",
    "主キーの一部が他のエンティティを参照しているとき（注文明細の注文番号）も、参照先が 1、参照元が多。",
    "業務の記述の「何回でも」「複数の」「必ず 1 つの」が、多と 1 を決める手がかりになる。",
  ],
};
