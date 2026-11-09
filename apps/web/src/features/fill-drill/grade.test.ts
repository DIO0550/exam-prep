import { describe, expect, it } from "vitest";

import { countCorrect, isCorrect, normalizeAnswer } from "./grade";
import type { FillBlank } from "./types";

const text = (answer: string, accepts?: string[]): FillBlank => ({
  key: "a",
  hint: "SQL のキーワード",
  answer,
  accepts,
  explain: "",
});

describe("normalizeAnswer", () => {
  it("大文字・小文字、全角・半角、空白の違いを吸収する", () => {
    expect(normalizeAnswer("  group   by ")).toBe("GROUP BY");
    expect(normalizeAnswer("ＧＲＯＵＰ　ＢＹ")).toBe("GROUP BY");
    expect(normalizeAnswer("count ( * )")).toBe("COUNT(*)");
    expect(normalizeAnswer("会員 . 会員番号")).toBe("会員.会員番号");
  });

  it("末尾のセミコロンは問わない", () => {
    expect(normalizeAnswer("commit;")).toBe("COMMIT");
  });

  it("アドレスの区切り（ピリオド・スラッシュ・コロン）の前後の空白は問わない", () => {
    expect(normalizeAnswer("192.168.1.0 / 24")).toBe("192.168.1.0/24");
    expect(normalizeAnswer("１９２．１６８．１．１")).toBe("192.168.1.1");
    expect(normalizeAnswer("2001 : db8 :: 1")).toBe("2001:DB8::1");
    expect(normalizeAnswer("syn + ack")).toBe("SYN+ACK");
  });
});

describe("isCorrect", () => {
  it("書く欄は、正解か accepts の書き方なら正解", () => {
    const blank = text("LEFT OUTER JOIN", ["LEFT JOIN"]);
    expect(isCorrect(blank, "left outer join")).toBe(true);
    expect(isCorrect(blank, "left join")).toBe(true);
    expect(isCorrect(blank, "RIGHT JOIN")).toBe(false);
  });

  it("空の欄は不正解", () => {
    expect(isCorrect(text("ON"), "")).toBe(false);
    expect(isCorrect(text("ON"), "  ")).toBe(false);
  });

  it("選ぶ欄は、記号が一致すれば正解", () => {
    const blank: FillBlank = {
      ...text("イ"),
      choices: [
        { key: "ア", text: "1 対 1" },
        { key: "イ", text: "1 対多" },
      ],
    };
    expect(isCorrect(blank, "イ")).toBe(true);
    expect(isCorrect(blank, "ア")).toBe(false);
  });

  it("countCorrect は正解した欄を数える", () => {
    const blanks = [
      { ...text("ON"), key: "a" },
      { ...text("SET"), key: "b" },
    ];
    expect(countCorrect(blanks, { a: "on", b: "WHERE" })).toBe(1);
  });
});
