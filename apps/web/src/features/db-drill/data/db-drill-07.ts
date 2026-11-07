import type { DbDrill } from "../types";

/** 更新と制約：CREATE TABLE の制約と参照制約の動き。 */
export const DB_DRILL_07: DbDrill = {
  id: "db-drill-07",
  topic: "更新と制約",
  title: "受講の表を CREATE TABLE で定義する",
  body: [
    {
      kind: "p",
      text: "Y 社の研修管理システムでは，受講者がどの講座を受講したかを受講の表で管理する。受講者は同じ講座を 1 度だけ受講でき，受講後に 1〜5 の 5 段階で評価を付ける（未評価のときは NULL）。",
    },
    {
      kind: "schema",
      caption: "図 1　関係スキーマ（一部）",
      schemas: [
        { name: "講座", columns: [{ name: "講座コード", key: "pk" }, { name: "講座名" }] },
        {
          name: "受講",
          columns: [
            { name: "受講者番号", key: "pk" },
            { name: "講座コード", key: "pk" },
            { name: "申込日" },
            { name: "評価" },
          ],
        },
      ],
    },
    {
      kind: "code",
      caption: "図 2　受講の表を定義する SQL 文",
      lines: [
        "CREATE TABLE 受講 (",
        "  受講者番号  CHAR(6)  NOT NULL,",
        "  講座コード  CHAR(4)  NOT NULL,",
        "  申込日      DATE     NOT NULL,",
        "  評価        INTEGER  {{a}} (評価 BETWEEN 1 AND 5),",
        "  {{b}} (受講者番号, 講座コード),",
        "  {{c}} (講座コード) {{d}} 講座(講座コード)",
        ")",
      ],
    },
    {
      kind: "p",
      text: "受講の行が残っている講座の行を，講座の表から DELETE 文で削除しようとすると，{{e}}。なお，参照動作（ON DELETE）は指定していない。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "CHECK",
      explain:
        "列の値の範囲を制限するのは検査制約（CHECK）。評価が NULL のときは条件が不明になり、CHECK 制約は違反にならないので、未評価も記録できる。",
    },
    {
      key: "b",
      hint: "SQL のキーワード",
      answer: "PRIMARY KEY",
      explain:
        "主キーは PRIMARY KEY。複数列の組を主キーにするときは、列の定義の後に表制約として PRIMARY KEY (列, 列) と書く。主キーの列は NULL にできず、値の組は重複できない。",
    },
    {
      key: "c",
      hint: "SQL のキーワード",
      answer: "FOREIGN KEY",
      explain: "外部キーは FOREIGN KEY (列) で指定する。",
    },
    {
      key: "d",
      hint: "SQL のキーワード",
      answer: "REFERENCES",
      explain:
        "参照先の表と列は REFERENCES 表名(列名) で書く。参照先の列は主キー（または UNIQUE）でなければならない。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "参照制約に違反するので，削除は拒否される" },
        { key: "イ", text: "講座の行が削除され，対応する受講の行も一緒に削除される" },
        { key: "ウ", text: "講座の行が削除され，受講の講座コードは NULL になる" },
        { key: "エ", text: "講座の行が削除され，受講の行はそのまま残る" },
      ],
      answer: "ア",
      explain:
        "参照されている行を消すと、受講の講座コードが存在しない講座を指してしまう。参照動作を指定しなければ（NO ACTION ／ RESTRICT）、削除は拒否される。イは ON DELETE CASCADE、ウは ON DELETE SET NULL を指定したときの動き。",
    },
  ],
  points: [
    "主な制約：PRIMARY KEY（一意かつ NOT NULL）、UNIQUE（一意）、NOT NULL、CHECK（条件）、FOREIGN KEY … REFERENCES（参照制約）。",
    "参照動作：指定なし・RESTRICT は拒否、CASCADE は連鎖して削除、SET NULL は NULL を入れる。",
    "CHECK 制約は条件が「偽」のときだけ違反。NULL で「不明」になるときは違反にならない。",
  ],
};
