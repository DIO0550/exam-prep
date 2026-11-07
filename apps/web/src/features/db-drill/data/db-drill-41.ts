import type { DbDrill } from "../types";

/** トランザクション：分離性水準と、ダーティリード・ノンリピータブルリード・ファントムリード。 */
export const DB_DRILL_41: DbDrill = {
  id: "db-drill-41",
  topic: "トランザクションと障害回復",
  title: "分離性水準と起きうる現象",
  body: [
    {
      kind: "p",
      text: "SQL では，トランザクションの分離性水準（隔離性水準）を SET TRANSACTION ISOLATION LEVEL 文で指定する。水準を下げるほど多くのトランザクションを同時に実行しやすくなるが，表 1 の現象が起きうる。",
    },
    {
      kind: "table",
      caption: "表 1　分離性水準と起きうる現象（○：起きうる，−：起きない）",
      headers: ["分離性水準", "ダーティリード", "ノンリピータブルリード", "ファントムリード"],
      rows: [
        ["READ UNCOMMITTED", "○", "○", "○"],
        ["READ COMMITTED", "−", "○", "○"],
        ["{{a}}", "−", "−", "○"],
        ["SERIALIZABLE", "−", "−", "−"],
      ],
    },
    {
      kind: "p",
      text: "T1 が COMMIT していない更新を T2 が読み，その後 T1 がロールバックすると，T2 は一度も確定しなかった値を使ったことになる。これを {{b}} という。",
    },
    {
      kind: "p",
      text: "T1 が同じ行を 2 回読む間に，T2 がその行を更新して COMMIT し，1 回目と 2 回目で値が変わることを {{c}} という。T1 が同じ条件で 2 回検索する間に，T2 が条件に合う行を挿入して COMMIT し，2 回目には行が増えていることを {{d}} という。",
    },
    {
      kind: "p",
      text: "SERIALIZABLE では，トランザクションを並行して実行した結果が，それらを {{e}} 実行した結果と同じになることが保証される。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "REPEATABLE READ",
      explain:
        "REPEATABLE READ は、一度読んだ行は COMMIT まで他から更新させないので、同じ行を読み直しても値は変わらない。ただし、条件に合う行の挿入までは防げないので、ファントムリードは起きうる。",
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        { key: "ア", text: "ダーティリード" },
        { key: "イ", text: "ノンリピータブルリード" },
        { key: "ウ", text: "ファントムリード" },
        { key: "エ", text: "ロストアップデート" },
      ],
      answer: "ア",
      explain:
        "COMMIT 前の、まだ「汚れた」値を読むのがダーティリード。READ COMMITTED 以上では、COMMIT 済みの値しか読まないので起きない。",
    },
    {
      key: "c",
      hint: "記号",
      choices: [
        { key: "ア", text: "ダーティリード" },
        { key: "イ", text: "ノンリピータブルリード" },
        { key: "ウ", text: "ファントムリード" },
        { key: "エ", text: "ロストアップデート" },
      ],
      answer: "イ",
      explain:
        "同じ行を読み直したら値が違う（繰り返し読めない）のがノンリピータブルリード。読み直しの対象は、既にある同じ行。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "ダーティリード" },
        { key: "イ", text: "ノンリピータブルリード" },
        { key: "ウ", text: "ファントムリード" },
        { key: "エ", text: "ロストアップデート" },
      ],
      answer: "ウ",
      explain:
        "1 回目には無かった行が、2 回目に幽霊（ファントム）のように現れる。行の値ではなく、行の数が変わるのがノンリピータブルリードとの違い。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "ある順序で 1 つずつ（直列に）" },
        { key: "イ", text: "全て同時に" },
        { key: "ウ", text: "ロックをかけずに" },
        { key: "エ", text: "開始した順と逆の順序で" },
      ],
      answer: "ア",
      explain:
        "並行に実行しても、何らかの順序で 1 つずつ実行したのと同じ結果になることを直列化可能性という。SERIALIZABLE はこれを保証する最も厳しい水準。",
    },
  ],
  points: [
    "水準は READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE の順に厳しくなる。",
    "ダーティリード＝未 COMMIT の値を読む、ノンリピータブルリード＝同じ行の値が変わる、ファントムリード＝行が増減する。",
    "厳しい水準ほど矛盾は減るが、待ちが増えて並行性は下がる。",
  ],
};
