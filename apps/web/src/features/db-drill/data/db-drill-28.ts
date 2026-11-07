import type { DbDrill } from "../types";

/** 更新と制約：参照動作 ON DELETE CASCADE と DELETE。 */
export const DB_DRILL_28: DbDrill = {
  id: "db-drill-28",
  topic: "更新と制約",
  title: "注文を消すと明細も一緒に消す",
  body: [
    {
      kind: "p",
      text: "R 社では，取り消された注文を削除するときに，その注文の明細も自動で削除したい。そこで，注文明細を図 1 のように定義した。",
    },
    {
      kind: "code",
      caption: "図 1　注文明細を定義する SQL 文",
      lines: [
        "CREATE TABLE 注文明細 (",
        "  注文番号   CHAR(4)  NOT NULL,",
        "  明細番号   INTEGER  NOT NULL,",
        "  商品コード CHAR(4)  NOT NULL,",
        "  数量       INTEGER  NOT NULL,",
        "  PRIMARY KEY (注文番号, 明細番号),",
        "  FOREIGN KEY (注文番号) REFERENCES 注文(注文番号)",
        "    ON DELETE {{a}}",
        ")",
      ],
    },
    {
      kind: "p",
      text: "注文には O1・O2・O3 の 3 行があり，注文明細には O1 の明細が 3 行，O2 が 2 行，O3 が 1 行ある。ここで図 2 を実行する。",
    },
    {
      kind: "code",
      caption: "図 2　注文を削除する SQL 文",
      lines: ["DELETE {{b}} 注文", " WHERE 注文番号 = 'O1'"],
    },
    {
      kind: "p",
      text: "図 2 の実行後，注文明細に残る行は {{c}} 行である。",
    },
    {
      kind: "p",
      text: "仮に空欄 a を SET NULL にして図 2 を実行すると，{{d}}。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "CASCADE",
      explain: "参照先の行を削除したとき、参照している行も連鎖して削除するのが ON DELETE CASCADE。",
    },
    {
      key: "b",
      hint: "SQL のキーワード",
      answer: "FROM",
      explain: "行の削除は DELETE FROM 表名 WHERE 条件。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "3",
      explain: "O1 の明細 3 行が一緒に消え、O2 の 2 行と O3 の 1 行が残る。6 − 3 = 3 行。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "注文番号は主キーの一部で NULL にできないので，削除はエラーになる" },
        { key: "イ", text: "O1 の明細 3 行の注文番号が NULL になって残る" },
        { key: "ウ", text: "O1 の明細 3 行も削除される" },
        { key: "エ", text: "注文の行だけが削除され，明細はそのまま O1 を指して残る" },
      ],
      answer: "ア",
      explain:
        "SET NULL は参照している列に NULL を入れる動作だが、注文番号は主キーの一部（NOT NULL）なので入れられず、制約違反で削除が失敗する。エは参照制約に反する状態なので起こらない。",
    },
  ],
  points: [
    "ON DELETE CASCADE：連鎖して削除。SET NULL：NULL を入れる。指定なし・RESTRICT：拒否。",
    "SET NULL は、参照している列が NULL を許すときにしか使えない。",
    "DELETE FROM 表 WHERE 条件。WHERE を忘れると全行が消える。",
  ],
};
