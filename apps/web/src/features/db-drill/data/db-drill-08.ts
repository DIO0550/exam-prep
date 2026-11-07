import type { DbDrill } from "../types";

/** 更新と制約：INSERT・UPDATE とトランザクション。 */
export const DB_DRILL_08: DbDrill = {
  id: "db-drill-08",
  topic: "更新と制約",
  title: "出荷の登録と在庫の更新をまとめて行う",
  body: [
    {
      kind: "p",
      text: "Z 社の倉庫システムでは，商品を出荷するときに，出荷の行を追加し，在庫数を減らす。",
    },
    {
      kind: "schema",
      caption: "図 1　関係スキーマ",
      schemas: [
        { name: "在庫", columns: [{ name: "商品コード", key: "pk" }, { name: "在庫数" }] },
        {
          name: "出荷",
          columns: [
            { name: "出荷番号", key: "pk" },
            { name: "商品コード", key: "fk" },
            { name: "出荷数" },
            { name: "出荷日" },
          ],
        },
      ],
    },
    {
      kind: "p",
      text: "商品 P010 を 3 個出荷する処理を，図 2 のように 1 つのトランザクションで行う。",
    },
    {
      kind: "code",
      caption: "図 2　出荷を登録する SQL 文",
      lines: [
        "INSERT {{a}} 出荷 (出荷番号, 商品コード, 出荷数, 出荷日)",
        "  {{b}} ('S0101', 'P010', 3, '2026-11-07');",
        "UPDATE 在庫 {{c}} 在庫数 = 在庫数 - 3",
        " WHERE 商品コード = 'P010';",
        "{{d}};",
      ],
    },
    {
      kind: "p",
      text: "INSERT の後，UPDATE の前に障害が起きたときは，ロールバックして INSERT も取り消す。出荷だけが記録されて在庫が減らない，という中途半端な状態を残さないためで，これはトランザクションの ACID 特性のうち {{e}} に当たる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "INTO",
      explain: "行の追加は INSERT INTO 表名 (列, …)。",
    },
    {
      key: "b",
      hint: "SQL のキーワード",
      answer: "VALUES",
      explain:
        "追加する値は VALUES (値, …) で、列の並びと同じ順に書く。副問合せ（SELECT 文）の結果を追加することもできる。",
    },
    {
      key: "c",
      hint: "SQL のキーワード",
      answer: "SET",
      explain: "更新は UPDATE 表名 SET 列 = 式 WHERE 条件。WHERE を忘れると全行が更新される。",
    },
    {
      key: "d",
      hint: "SQL のキーワード",
      answer: "COMMIT",
      explain: "トランザクションの更新を確定するのは COMMIT。取り消すのは ROLLBACK。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "原子性（Atomicity）" },
        { key: "イ", text: "一貫性（Consistency）" },
        { key: "ウ", text: "独立性（Isolation）" },
        { key: "エ", text: "永続性（Durability）" },
      ],
      answer: "ア",
      explain:
        "トランザクションの処理は「全部行うか、全く行わないか」のどちらかになる、というのが原子性。独立性は並行して動くトランザクションが互いに影響しないこと、永続性は COMMIT した結果が障害でも失われないこと。",
    },
  ],
  points: [
    "INSERT INTO … VALUES、UPDATE … SET … WHERE、DELETE FROM … WHERE。",
    "COMMIT で確定、ROLLBACK で取消し。",
    "ACID：原子性・一貫性・独立性・永続性。",
  ],
};
