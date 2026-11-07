import { relationChoices } from "../relation-choices";
import type { DbDrill } from "../types";

/** 表の設計：E-R 図の関連と、主キー・外部キー。 */
export const DB_DRILL_01: DbDrill = {
  id: "db-drill-01",
  topic: "表の設計",
  title: "図書館の貸出管理：主キーと外部キー",
  body: [
    {
      kind: "p",
      text: "S 市立図書館では，会員への書籍の貸出を関係データベースで管理する。同じ書籍（同じ ISBN）を複数冊所蔵しており，1 冊ずつに蔵書番号を振っている。1 回の貸出で 1 冊を貸し出し，返却されたら返却日を記録する。",
    },
    {
      kind: "p",
      text: "設計途中の E-R 図を図 1 に示す。貸出は属性だけを決めた段階で，主キー・外部キーの下線と，他のエンティティとの関連はまだ記入していない。",
    },
    {
      kind: "er",
      caption: "図 1　設計途中の E-R 図",
      entities: [
        {
          id: "member",
          name: "会員",
          col: 0,
          row: 0,
          attrs: [{ name: "会員番号", key: "pk" }, { name: "氏名" }, { name: "電話番号" }],
        },
        {
          id: "book",
          name: "書籍",
          col: 1,
          row: 0,
          attrs: [{ name: "ISBN", key: "pk" }, { name: "書名" }, { name: "著者名" }],
        },
        {
          id: "loan",
          name: "貸出",
          col: 0,
          row: 1,
          attrs: [
            { name: "貸出番号" },
            { name: "会員番号" },
            { name: "蔵書番号" },
            { name: "貸出日" },
            { name: "返却期限日" },
            { name: "返却日" },
          ],
        },
        {
          id: "copy",
          name: "蔵書",
          col: 1,
          row: 1,
          attrs: [{ name: "蔵書番号", key: "pk" }, { name: "ISBN", key: "fk" }, { name: "受入日" }],
        },
      ],
      relations: [{ from: "book", to: "copy", blank: "a" }],
    },
    {
      kind: "p",
      text: "貸出の主キーは貸出番号とする。このとき，外部キーとして破線の下線を付ける属性は {{b}} である。",
    },
    {
      kind: "p",
      text: "仮に貸出番号を使わず，主キーを（会員番号，蔵書番号，{{c}}）の組にしても，同じ会員が同じ蔵書を別の日に借り直したときの行を区別できる（同じ日に同じ蔵書を 2 回借りることは無いものとする）。",
    },
    {
      kind: "p",
      text: "まだ返却されていない貸出では，返却日の値が無い状態，すなわち {{d}} になっている。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号（引く線）",
      choices: relationChoices("書籍", "蔵書"),
      answer: "イ",
      explain:
        "蔵書は外部キー ISBN で書籍を参照する。同じ ISBN の本を複数冊持てるので、1 つの書籍に蔵書が何件も対応する（1 対多）。矢印は「多」の側、つまり外部キーを持つ蔵書の側に向ける。",
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        { key: "ア", text: "会員番号だけ" },
        { key: "イ", text: "蔵書番号だけ" },
        { key: "ウ", text: "会員番号と蔵書番号" },
        { key: "エ", text: "会員番号，蔵書番号，貸出日" },
      ],
      answer: "ウ",
      explain:
        "外部キーは「他のエンティティの主キーを参照する属性」。会員番号は会員の主キー、蔵書番号は蔵書の主キーを参照しているので、どちらも外部キー。貸出日はどれも参照していない。E-R 図に書き込むなら、会員 → 貸出、蔵書 → 貸出 の 2 本の矢印が加わる。",
    },
    {
      key: "c",
      hint: "属性名",
      answer: "貸出日",
      explain:
        "会員番号と蔵書番号の組だけでは、同じ会員が同じ本を 2 回借りたときに重複する。借りた日を加えれば、同じ日に 2 回借りることは無いので行を一意に特定できる。",
    },
    {
      key: "d",
      hint: "SQL のキーワード",
      answer: "NULL",
      explain:
        "値が無いことは NULL で表す。未返却の貸出を探すときは「返却日 = NULL」ではなく「返却日 IS NULL」と書く（NULL との比較は = では真にならない）。",
    },
  ],
  points: [
    "E-R 図の矢印は「多」の側に向ける。外部キーを持つエンティティが「多」の側になる。",
    "主キーは実線の下線、外部キーは破線の下線。主キーの一部である外部キーには破線を付けない。",
    "未設定の値は NULL。条件は IS NULL ／ IS NOT NULL で書く。",
  ],
};
