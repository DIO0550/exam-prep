import { relationChoices } from "../relation-choices";
import type { DbDrill } from "../types";

const OLAP = [
  { key: "ア", text: "ドリルダウン" },
  { key: "イ", text: "ロールアップ" },
  { key: "ウ", text: "スライス" },
  { key: "エ", text: "ダイス" },
];

/** DB の応用：データウェアハウスのスタースキーマと、多次元分析の操作。 */
export const DB_DRILL_45: DbDrill = {
  id: "db-drill-45",
  topic: "DB の方式と応用",
  title: "売上分析のデータウェアハウス：スタースキーマ",
  body: [
    {
      kind: "p",
      text: "L 社は，各店舗の POS データを集めて売上を分析するため，データウェアハウスを構築する。分析の対象となる数値（売上数量・売上金額）を持つ表を {{a}} テーブル，分析の切り口（日付・店舗・商品）を持つ表をディメンションテーブルとし，図 1 のスタースキーマで設計した。",
    },
    {
      kind: "er",
      caption: "図 1　売上分析のスタースキーマ（一部の関連は空欄）",
      entities: [
        {
          id: "date",
          name: "日付",
          col: 1,
          row: 0,
          attrs: [
            { name: "日付キー", key: "pk" },
            { name: "年" },
            { name: "月" },
            { name: "曜日" },
          ],
        },
        {
          id: "item",
          name: "商品",
          col: 0,
          row: 1,
          attrs: [{ name: "商品コード", key: "pk" }, { name: "商品名" }, { name: "分類" }],
        },
        {
          id: "sales",
          name: "売上",
          col: 1,
          row: 1,
          attrs: [
            { name: "日付キー", key: "pk" },
            { name: "店舗コード", key: "pk" },
            { name: "商品コード", key: "pk" },
            { name: "売上数量" },
            { name: "売上金額" },
          ],
        },
        {
          id: "store",
          name: "店舗",
          col: 2,
          row: 1,
          attrs: [{ name: "店舗コード", key: "pk" }, { name: "店舗名" }, { name: "地域" }],
        },
      ],
      relations: [
        { from: "date", to: "sales", kind: "1:N" },
        { from: "sales", to: "item", blank: "b" },
        { from: "store", to: "sales", kind: "1:N" },
      ],
    },
    {
      kind: "p",
      text: "月別の売上を見ていて，ある月を日別に分けて見るように，集計の単位を細かい方へ移す操作を {{c}} という。",
    },
    {
      kind: "p",
      text: "店舗を「新宿店」だけに固定して，日付と商品の 2 つの軸で売上を見るように，ある軸の値を 1 つに固定して切り出す操作を {{d}} という。",
    },
    {
      kind: "p",
      text: "各店舗の業務システムからデータを取り出し，コードや形式をそろえるよう変換して，データウェアハウスに書き込む処理を {{e}} という。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: [
        { key: "ア", text: "ファクト" },
        { key: "イ", text: "マスタ" },
        { key: "ウ", text: "ビュー" },
        { key: "エ", text: "ジャーナル" },
      ],
      answer: "ア",
      explain:
        "分析の対象となる事実（いつ・どこで・何が・いくつ売れたか）を持つ表をファクトテーブルという。行数が非常に多くなる。",
    },
    {
      key: "b",
      hint: "記号（引く線）",
      choices: relationChoices("売上", "商品"),
      answer: "ウ",
      explain:
        "売上は外部キー（主キーの一部）の商品コードで商品を参照する。1 つの商品に売上の行がいくつもあるので、商品が 1、売上が多。選択肢は左が売上なので「売上 ← 商品」。",
    },
    {
      key: "c",
      hint: "記号",
      choices: OLAP,
      answer: "ア",
      explain:
        "年 → 月 → 日のように細かく掘り下げるのがドリルダウン。逆に、日 → 月 → 年とまとめていくのがロールアップ。",
    },
    {
      key: "d",
      hint: "記号",
      choices: OLAP,
      answer: "ウ",
      explain:
        "多次元のデータを、ある軸の値で薄く切り出すのがスライス。ダイスは、縦と横の軸を入れ替えるなど、分析の視点を変える操作。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "ETL" },
        { key: "イ", text: "OLTP" },
        { key: "ウ", text: "レプリケーション" },
        { key: "エ", text: "ストアドプロシージャ" },
      ],
      answer: "ア",
      explain:
        "抽出（Extract）・変換（Transform）・書込み（Load）の頭文字。OLTP は、受注のように日々の取引を 1 件ずつ処理する業務システムの側。",
    },
  ],
  points: [
    "スタースキーマ：中心にファクト（数値）、周りにディメンション（切り口）。ディメンションが 1、ファクトが多。",
    "ドリルダウン（細かく）、ロールアップ（まとめる）、スライス（1 軸を固定して切り出す）、ダイス（軸を入れ替える）。",
    "ETL で業務システムのデータをそろえてから、データウェアハウスに入れる。",
  ],
};
