import { relationChoices } from "../relation-choices";
import type { DbDrill } from "../types";

/** E-R 図：E-R 図から結合の条件を読み取って SQL を書く。 */
export const DB_DRILL_13: DbDrill = {
  id: "db-drill-13",
  topic: "E-R 図",
  title: "店舗の在庫：E-R 図から結合の条件を書く",
  body: [
    {
      kind: "p",
      text: "D 社はチェーン店で日用品を販売している。在庫は店舗と商品の組ごとに 1 つ持ち，在庫数を記録する。E-R 図を図 1 に示す。E-R 図のエンティティ名を表名に，属性名を列名にして表を定義している。",
    },
    {
      kind: "er",
      caption: "図 1　店舗在庫の E-R 図",
      entities: [
        {
          id: "store",
          name: "店舗",
          col: 0,
          row: 0,
          attrs: [{ name: "店舗コード", key: "pk" }, { name: "店舗名" }, { name: "地域" }],
        },
        {
          id: "stock",
          name: "在庫",
          col: 1,
          row: 0,
          attrs: [
            { name: "店舗コード", key: "pk" },
            { name: "商品コード", key: "pk" },
            { name: "在庫数" },
          ],
        },
        {
          id: "item",
          name: "商品",
          col: 2,
          row: 0,
          attrs: [{ name: "商品コード", key: "pk" }, { name: "商品名" }, { name: "単価" }],
        },
      ],
      relations: [
        { from: "store", to: "stock", kind: "1:N" },
        { from: "stock", to: "item", blank: "a" },
      ],
    },
    {
      kind: "p",
      text: "在庫数が 10 未満の在庫を，店舗名と商品名を付けて一覧にするため，図 2 の SQL 文を作成した。",
    },
    {
      kind: "code",
      caption: "図 2　在庫が少ない店舗と商品を求める SQL 文",
      lines: [
        "SELECT 店舗.店舗名, 商品.商品名, 在庫.在庫数",
        "  FROM 在庫",
        "  JOIN 店舗 ON 在庫.店舗コード = {{b}}",
        "  JOIN 商品 ON {{c}} = 商品.商品コード",
        " WHERE 在庫.在庫数 {{d}} 10",
      ],
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号（引く線）",
      choices: relationChoices("在庫", "商品"),
      answer: "ウ",
      explain:
        "1 つの商品は複数の店舗に在庫があり、在庫 1 行の商品は 1 つ。商品が 1、在庫が多なので、在庫の側（図の左）に矢印を向ける。店舗 → 在庫 と同じ形になる。",
    },
    {
      key: "b",
      hint: "表名.列名",
      answer: "店舗.店舗コード",
      explain:
        "結合の条件は、E-R 図の関連の線を、外部キーと参照先の主キーの等号に直したもの。在庫の店舗コードが店舗の店舗コードを参照している。",
    },
    {
      key: "c",
      hint: "表名.列名",
      answer: "在庫.商品コード",
      explain:
        "在庫の商品コードが商品の商品コードを参照している。両方の表に同じ名前の列があるので、表名を付けて書く。",
    },
    {
      key: "d",
      hint: "比較演算子",
      answer: "<",
      explain: "「10 未満」は 10 を含まないので < 。「10 以下」なら <= になる。",
    },
  ],
  points: [
    "E-R 図の関連 1 本が、結合の条件 1 つ（外部キー = 参照先の主キー）に当たる。",
    "3 つ以上の表を結合するときは、関連をたどる順に JOIN を重ねる。",
    "未満・以下、超・以上の違いは、境界の値を含むかどうか。",
  ],
};
