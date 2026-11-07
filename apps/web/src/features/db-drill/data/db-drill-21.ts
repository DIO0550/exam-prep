import type { DbDrill } from "../types";

/** 集約と副問合せ：IN の副問合せを入れ子にする。 */
export const DB_DRILL_21: DbDrill = {
  id: "db-drill-21",
  topic: "集約と副問合せ",
  title: "東京の店舗で買った顧客を IN で探す",
  body: [
    {
      kind: "p",
      text: "L 社は複数の地域に店舗を持ち，会員の購買を記録している。",
    },
    {
      kind: "schema",
      caption: "図 1　関係スキーマ",
      schemas: [
        { name: "顧客", columns: [{ name: "顧客番号", key: "pk" }, { name: "氏名" }] },
        { name: "店舗", columns: [{ name: "店舗コード", key: "pk" }, { name: "地域" }] },
        {
          name: "購買",
          columns: [
            { name: "購買番号", key: "pk" },
            { name: "顧客番号", key: "fk" },
            { name: "店舗コード", key: "fk" },
            { name: "金額" },
          ],
        },
      ],
    },
    {
      kind: "p",
      text: "地域が東京の店舗で一度でも購買したことのある顧客を求めるため，図 2 の SQL 文を作成した。",
    },
    {
      kind: "code",
      caption: "図 2　東京の店舗で購買した顧客を求める SQL 文",
      lines: [
        "SELECT 顧客.顧客番号, 顧客.氏名",
        "  FROM 顧客",
        " WHERE 顧客.顧客番号 {{a}}",
        "       (SELECT 購買.顧客番号 FROM 購買",
        "         WHERE 購買.店舗コード IN",
        "               (SELECT 店舗.店舗コード FROM 店舗",
        "                 WHERE 店舗.地域 = {{b}}))",
      ],
    },
    {
      kind: "p",
      text: "空欄 a を = にすると，副問合せが 2 行以上を返したときに {{c}}。",
    },
    {
      kind: "p",
      text: "同じことを，顧客・購買・店舗を結合して（DISTINCT を付けずに）求めると，東京の店舗で 3 回購買した顧客は結果に {{d}} 行出る。図 2 では 1 行だけ出る。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "IN",
      explain: "副問合せが返す複数の値のどれかと一致すれば真になるのが IN。",
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        { key: "ア", text: "東京" },
        { key: "イ", text: "'東京'" },
        { key: "ウ", text: '"東京"' },
        { key: "エ", text: "[東京]" },
      ],
      answer: "イ",
      explain:
        "SQL の文字列定数は単一引用符（'）で囲む。引用符が無いと列名として扱われる。二重引用符は列名などの名前を囲むときに使う。",
    },
    {
      key: "c",
      hint: "記号",
      choices: [
        { key: "ア", text: "実行時にエラーになる" },
        { key: "イ", text: "副問合せの最初の 1 行とだけ比べる" },
        { key: "ウ", text: "副問合せの全ての行と一致するときだけ真になる" },
        { key: "エ", text: "結果は必ず 0 行になる" },
      ],
      answer: "ア",
      explain:
        "= の右辺に置く副問合せは 1 行 1 列（スカラ）でなければならない。2 行以上返るとエラーになる。複数の値と比べるときは IN（または = ANY）を使う。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "3",
      explain:
        "結合では購買 1 行ごとに結果の 1 行ができるので、3 回購買した顧客は 3 行出る。IN の副問合せなら、顧客の表の 1 行を条件で残すかどうかだけなので 1 行。",
    },
  ],
  points: [
    "IN (副問合せ) は「副問合せの結果のどれかと一致」。副問合せは入れ子にできる。",
    "文字列定数は '…' で囲む。",
    "結合は行が増えうるが、IN ／ EXISTS は外側の行を増やさない。",
  ],
};
