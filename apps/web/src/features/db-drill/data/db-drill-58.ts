import type { DbDrill } from "../types";

/** 更新と制約：ALTER TABLE で、既定値付きの列と検査制約を後から加える。 */
export const DB_DRILL_58: DbDrill = {
  id: "db-drill-58",
  topic: "更新と制約",
  title: "ALTER TABLE で列と制約を後から足す",
  body: [
    {
      kind: "p",
      text: "M 社の会員の表は，会員（会員番号，氏名，メールアドレス）として運用しており，既に数万行がある。会員ランクを管理することになり，図 1 の SQL 文で列を追加した。今いる会員は全て '一般' とする。",
    },
    {
      kind: "code",
      caption: "図 1　会員ランクの列を追加する SQL 文",
      lines: ["ALTER TABLE 会員", "  {{a}} 会員ランク VARCHAR(10) {{b}} '一般' NOT NULL"],
    },
    {
      kind: "p",
      text: "図 1 を実行した直後，既にあった会員の行の会員ランクは {{c}} になっている。",
    },
    {
      kind: "p",
      text: "続いて，会員ランクに決められた値しか入らないよう，図 2 の SQL 文で制約を加えた。",
    },
    {
      kind: "code",
      caption: "図 2　会員ランクの値を制限する SQL 文",
      lines: [
        "ALTER TABLE 会員",
        "  ADD CONSTRAINT 会員ランク_CHK",
        "  {{d}} (会員ランク IN ('一般', 'シルバー', 'ゴールド'))",
      ],
    },
    {
      kind: "p",
      text: "なお，図 1 で空欄 b の指定を付けずに NOT NULL だけを付けると，{{e}}。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "ADD COLUMN",
      accepts: ["ADD"],
      explain:
        "既にある表に列を足すのは ALTER TABLE 表名 ADD [COLUMN] 列定義。COLUMN は省略できる。列を消すのは DROP COLUMN。",
    },
    {
      key: "b",
      hint: "SQL のキーワード",
      answer: "DEFAULT",
      explain:
        "DEFAULT 値 は、値を指定しないときに入る既定値。列を追加したとき、既にある行にもこの値が入る。",
    },
    {
      key: "c",
      hint: "値",
      answer: "一般",
      accepts: ["'一般'"],
      explain: "既定値の '一般' が、既にあった全ての行に入る。",
    },
    {
      key: "d",
      hint: "SQL のキーワード",
      answer: "CHECK",
      explain:
        "列の値が条件を満たすかを検査するのは検査制約（CHECK）。ADD CONSTRAINT 制約名 で、後から名前付きで加えられる。既にある行が条件に反していると、制約を加えられない。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        {
          key: "ア",
          text: "既にある行の新しい列が NULL になり，NOT NULL に反するので列を追加できない",
        },
        { key: "イ", text: "既にある行の新しい列に空文字列が入る" },
        { key: "ウ", text: "既にある行が全て削除される" },
        { key: "エ", text: "NOT NULL の指定が無視され，NULL のまま追加される" },
      ],
      answer: "ア",
      explain:
        "既定値が無いと、既にある行の新しい列には NULL が入るしかない。それでは NOT NULL を満たせないので、行のある表には追加できない。既定値を付けるか、いったん NULL を許して追加し、値を埋めてから NOT NULL にする。",
    },
  ],
  points: [
    "ALTER TABLE 表 ADD [COLUMN] 列定義 ／ DROP COLUMN 列 ／ ADD CONSTRAINT 制約名 制約。",
    "DEFAULT は値を省略したときの既定値。列を追加するときは、既にある行にも入る。",
    "行がある表に NOT NULL の列を足すには、既定値を付ける。",
  ],
};
