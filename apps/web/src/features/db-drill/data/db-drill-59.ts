import type { DbDrill } from "../types";

/** 更新と制約：トリガーで更新の前後の値を履歴の表に残す。行単位と文単位。 */
export const DB_DRILL_59: DbDrill = {
  id: "db-drill-59",
  topic: "更新と制約",
  title: "トリガーで単価の変更履歴を残す",
  body: [
    {
      kind: "p",
      text: "N 社では，商品の単価を変えたときに，変更前と変更後の単価を単価履歴の表に自動で残すことにした。",
    },
    {
      kind: "schema",
      caption: "図 1　関係スキーマ",
      schemas: [
        {
          name: "商品",
          columns: [
            { name: "商品コード", key: "pk" },
            { name: "商品名" },
            { name: "分類" },
            { name: "単価" },
          ],
        },
        {
          name: "単価履歴",
          columns: [
            { name: "履歴番号", key: "pk" },
            { name: "商品コード", key: "fk" },
            { name: "旧単価" },
            { name: "新単価" },
            { name: "変更日時" },
          ],
        },
      ],
    },
    {
      kind: "p",
      text: "履歴番号は，行を追加すると DBMS が自動で採番する。図 2 の SQL 文で，商品の表にトリガーを定義した。",
    },
    {
      kind: "code",
      caption: "図 2　単価の変更を記録するトリガー",
      lines: [
        "CREATE TRIGGER 単価変更記録",
        "  {{a}} UPDATE OF 単価 ON 商品",
        "  REFERENCING OLD ROW AS O NEW ROW AS N",
        "  FOR EACH {{b}}",
        "  INSERT INTO 単価履歴 (商品コード, 旧単価, 新単価, 変更日時)",
        "    VALUES (N.商品コード, {{c}}.単価, N.単価, CURRENT_TIMESTAMP)",
      ],
    },
    {
      kind: "p",
      text: "分類が '文具' の商品は 3 件ある。UPDATE 商品 SET 単価 = 単価 * 1.1 WHERE 分類 = '文具' を実行すると，単価履歴に {{d}} 行が追加される。",
    },
    {
      kind: "p",
      text: "トリガーとは，{{e}} 仕組みである。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "AFTER",
      explain:
        "単価の更新が済んだ後に履歴を書くので AFTER。BEFORE は更新の前に動き、入れる値の検査や補正に使う。",
    },
    {
      key: "b",
      hint: "SQL のキーワード",
      answer: "ROW",
      explain:
        "FOR EACH ROW は、更新された行ごとに 1 回ずつ動く。行ごとの変更前（OLD）・変更後（NEW）の値を参照できる。FOR EACH STATEMENT は文ごとに 1 回だけ動く。",
    },
    {
      key: "c",
      hint: "相関名",
      answer: "O",
      explain:
        "REFERENCING OLD ROW AS O で、変更前の行に O という名前を付けている。旧単価には O.単価、新単価には N.単価を入れる。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "3",
      explain:
        "FOR EACH ROW なので、更新された 3 行のそれぞれでトリガーが動き、3 行が追加される。FOR EACH STATEMENT なら、UPDATE 文 1 回につき 1 回だけ動く。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        {
          key: "ア",
          text: "表への追加・更新・削除をきっかけに，定義しておいた処理を DBMS が自動で実行する",
        },
        { key: "イ", text: "決まった時刻になると，定義しておいた SQL 文を DBMS が実行する" },
        { key: "ウ", text: "利用者が呼び出したときに，DBMS に登録した一連の処理を実行する" },
        { key: "エ", text: "問合せの結果を，表と同じように名前を付けて参照できるようにする" },
      ],
      answer: "ア",
      explain:
        "トリガーは、表の変更（INSERT・UPDATE・DELETE）を契機に自動で動く。利用者が CALL で呼び出すのはストアドプロシージャ、名前を付けた問合せはビュー。",
    },
  ],
  points: [
    "CREATE TRIGGER 名前 {BEFORE | AFTER} {INSERT | UPDATE [OF 列] | DELETE} ON 表 … FOR EACH {ROW | STATEMENT} 処理。",
    "行トリガー（FOR EACH ROW）は変更された行ごとに動き、OLD（変更前）・NEW（変更後）の行を参照できる。",
    "履歴の記録や、関連する表の自動更新など、アプリケーションに任せると漏れやすい処理に使う。",
  ],
};
