import type { DbDrill } from "../types";

/** 更新と制約：副問合せを使った DELETE、WHERE の無い DELETE、取消しと DROP の違い。 */
export const DB_DRILL_57: DbDrill = {
  id: "db-drill-57",
  topic: "更新と制約",
  title: "退会した会員の予約を DELETE で消す",
  body: [
    {
      kind: "p",
      text: "L 社のスポーツクラブでは，会員と施設の予約を表 1・表 2 のように管理している。退会した会員の予約は，月末にまとめて削除する。",
    },
    {
      kind: "table",
      caption: "表 1　会員の行",
      headers: ["会員番号", "氏名", "状態"],
      rows: [
        ["M1", "青木", "在籍"],
        ["M2", "井上", "退会"],
        ["M3", "上田", "在籍"],
        ["M4", "江藤", "退会"],
      ],
    },
    {
      kind: "table",
      caption: "表 2　予約の行",
      headers: ["予約番号", "会員番号", "利用日"],
      rows: [
        ["R1", "M1", "2026-12-01"],
        ["R2", "M2", "2026-12-03"],
        ["R3", "M2", "2026-12-10"],
        ["R4", "M3", "2026-12-05"],
        ["R5", "M4", "2026-12-07"],
      ],
    },
    {
      kind: "code",
      caption: "図 1　退会した会員の予約を削除する SQL 文",
      lines: [
        "DELETE {{a}} 予約",
        " WHERE 会員番号 {{b}} (SELECT 会員番号 FROM 会員",
        "                     WHERE 状態 = '退会')",
      ],
    },
    {
      kind: "p",
      text: "図 1 を実行すると，予約の行が {{c}} 行削除される。",
    },
    {
      kind: "p",
      text: "誤って WHERE 句を付けずに DELETE を実行すると，{{d}}。COMMIT の前であれば，{{e}} 文で削除を取り消せる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "FROM",
      explain: "行の削除は DELETE FROM 表名 WHERE 条件。",
    },
    {
      key: "b",
      hint: "SQL のキーワード",
      answer: "IN",
      accepts: ["= ANY"],
      explain:
        "副問合せは退会した会員の会員番号（M2・M4）を複数返す。そのどれかに一致するかは IN で調べる。= だと副問合せが 2 行を返したときにエラーになる。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "3",
      explain: "M2 の R2・R3 と、M4 の R5 の 3 行。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "予約の全ての行が削除され，表の定義は残る" },
        { key: "イ", text: "予約の表の定義ごと削除される" },
        { key: "ウ", text: "条件が無いので 1 行も削除されない" },
        { key: "エ", text: "構文の誤りになり，実行できない" },
      ],
      answer: "ア",
      explain:
        "WHERE の無い DELETE は、全ての行を削除する（空の表が残る）。表の定義ごと消すのは DROP TABLE。",
    },
    {
      key: "e",
      hint: "SQL のキーワード",
      answer: "ROLLBACK",
      explain:
        "ROLLBACK は、トランザクションの中で行った更新を全て取り消し、開始前の状態に戻す。COMMIT した後は ROLLBACK では戻せない。",
    },
  ],
  points: [
    "DELETE FROM 表 WHERE 条件。条件には副問合せも書ける。複数の値と比べるときは IN。",
    "WHERE の無い DELETE は全行削除。表の定義を消すのは DROP TABLE。",
    "COMMIT 前なら ROLLBACK で取り消せる。COMMIT 後は戻せない。",
  ],
};
