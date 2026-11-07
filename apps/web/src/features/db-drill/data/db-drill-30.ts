import type { DbDrill } from "../types";

/** 更新と制約：一意索引の作成と、索引が効く検索・効きにくい検索。 */
export const DB_DRILL_30: DbDrill = {
  id: "db-drill-30",
  topic: "更新と制約",
  title: "メールアドレスに一意索引を付ける",
  body: [
    {
      kind: "p",
      text: "T 社の会員サイトでは，会員はメールアドレスでログインする。メールアドレスは会員ごとに異なり，同じアドレスで二重に登録されるのを防ぎたい。また，ログインのたびにメールアドレスで会員を探すので，その検索を速くしたい。",
    },
    {
      kind: "schema",
      caption: "図 1　関係スキーマ",
      schemas: [
        {
          name: "会員",
          columns: [{ name: "会員番号", key: "pk" }, { name: "メールアドレス" }, { name: "氏名" }],
        },
      ],
    },
    {
      kind: "code",
      caption: "図 2　索引を作る SQL 文",
      lines: ["CREATE {{a}} INDEX 会員_メール_IDX", "  ON 会員 ({{b}})"],
    },
    {
      kind: "p",
      text: "図 2 の索引を使った検索が効きにくい条件は {{c}} である。",
    },
    {
      kind: "p",
      text: "索引を多く作りすぎると，{{d}}。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "UNIQUE",
      explain:
        "一意索引（UNIQUE INDEX）は、同じ値の行を追加しようとするとエラーにする。二重登録の防止と検索の高速化を 1 つの索引でまかなえる。表の定義で UNIQUE 制約を付けても同じ働きになる。",
    },
    {
      key: "b",
      hint: "列名",
      answer: "メールアドレス",
      explain: "検索の条件に使い、重複を防ぎたいのはメールアドレス。",
    },
    {
      key: "c",
      hint: "記号",
      choices: [
        { key: "ア", text: "メールアドレス LIKE '%@example.com'" },
        { key: "イ", text: "メールアドレス = 'sato@example.com'" },
        { key: "ウ", text: "メールアドレス LIKE 'sato%'" },
        { key: "エ", text: "メールアドレス IN ('a@example.com', 'b@example.com')" },
      ],
      answer: "ア",
      explain:
        "索引は値の並び順で探すので、先頭が決まっている検索（=、IN、前方一致の 'sato%'）に効く。先頭が % の後方一致は、どこから探せばよいか決まらず、索引を全部たどることになる。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "行の追加・更新・削除のたびに索引も更新するので，更新処理が遅くなる" },
        { key: "イ", text: "検索が必ず遅くなる" },
        { key: "ウ", text: "表の行数に上限ができる" },
        { key: "エ", text: "主キーが使えなくなる" },
      ],
      answer: "ア",
      explain:
        "索引は表とは別に持つ並び替えた写しのようなもの。表を変えるたびに索引も直すので、更新が重くなり、記憶領域も使う。",
    },
  ],
  points: [
    "CREATE [UNIQUE] INDEX 索引名 ON 表 (列)。UNIQUE は重複を禁止する。",
    "索引が効くのは =、IN、範囲、前方一致。後方一致・中間一致（先頭が %）や、列に関数を掛けた条件は効きにくい。",
    "索引は検索を速くするが、更新を遅くする。",
  ],
};
