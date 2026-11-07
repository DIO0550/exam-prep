import type { DbDrill } from "../types";

/** 集約と副問合せ：NOT IN の副問合せに NULL が混ざる落とし穴。 */
export const DB_DRILL_24: DbDrill = {
  id: "db-drill-24",
  topic: "集約と副問合せ",
  title: "NOT IN と NULL の落とし穴",
  body: [
    {
      kind: "p",
      text: "O 社の会員制サービスでは，会員が別の人を紹介すると紹介の行を記録する。紹介者が分からない紹介は，紹介者会員番号を NULL にしている。",
    },
    {
      kind: "table",
      caption: "表 1　会員の行",
      headers: ["会員番号", "氏名"],
      rows: [
        ["M1", "秋山"],
        ["M2", "石川"],
        ["M3", "内田"],
      ],
    },
    {
      kind: "table",
      caption: "表 2　紹介の行",
      headers: ["紹介番号", "紹介者会員番号"],
      rows: [
        ["R1", "M1"],
        ["R2", "NULL"],
      ],
    },
    {
      kind: "p",
      text: "まだ誰も紹介していない会員（M2 と M3 のはず）を求めるため，図 1 の SQL 文を作成した。",
    },
    {
      kind: "code",
      caption: "図 1　紹介していない会員を求める SQL 文",
      lines: [
        "SELECT 会員番号",
        "  FROM 会員",
        " WHERE 会員番号 NOT IN (SELECT 紹介者会員番号 FROM 紹介)",
      ],
    },
    {
      kind: "p",
      text: "ところが，図 1 の実行結果は {{a}} 行だった。{{b}} からである。",
    },
    {
      kind: "p",
      text: "副問合せに WHERE 紹介者会員番号 {{c}} を加えると，意図どおりの結果になる。また，図 2 のように NOT EXISTS で書けば，NULL があっても結果は {{d}} 行になる。",
    },
    {
      kind: "code",
      caption: "図 2　NOT EXISTS で書き直した SQL 文",
      lines: [
        "SELECT 会員番号",
        "  FROM 会員",
        " WHERE NOT EXISTS (SELECT * FROM 紹介",
        "                    WHERE 紹介.紹介者会員番号 = 会員.会員番号)",
      ],
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "数値",
      answer: "0",
      explain:
        "副問合せの結果に NULL が含まれると、NOT IN はどの行に対しても真にならず、結果は 0 行になる。",
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        {
          key: "ア",
          text: "M2 NOT IN (M1, NULL) は M2 <> M1 AND M2 <> NULL と同じで，M2 <> NULL が不明（真でも偽でもない）になる",
        },
        { key: "イ", text: "NOT IN の副問合せには主キーの列しか書けない" },
        { key: "ウ", text: "NULL は全ての値と等しいとみなされる" },
        { key: "エ", text: "副問合せが 2 行以上を返したのでエラーになった" },
      ],
      answer: "ア",
      explain:
        "NULL との比較は、= でも <> でも「不明」になる。真 AND 不明 は不明なので、WHERE で真にならず行が残らない。",
    },
    {
      key: "c",
      hint: "SQL のキーワード",
      answer: "IS NOT NULL",
      explain: "副問合せから NULL を除けば、M2 NOT IN (M1) は真になる。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "2",
      explain:
        "NOT EXISTS は「対応する行が 1 行も無い」かどうかを見る。M2・M3 を紹介者とする行は無いので、2 行残る。NULL の行はどの会員とも = にならないだけで、結果を壊さない。",
    },
  ],
  points: [
    "NOT IN (副問合せ) は、副問合せに NULL が 1 つでもあると結果が 0 行になる。",
    "NULL を含みうる列で「〜が無い」を調べるなら NOT EXISTS が安全。",
    "NULL との比較（=、<>、<、>）は全て不明。調べるときは IS NULL ／ IS NOT NULL。",
  ],
};
