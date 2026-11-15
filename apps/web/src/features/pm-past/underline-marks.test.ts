import { describe, expect, it } from "vitest";

import { PM_TRANSCRIPTS } from "./transcripts";
import type { PmTranscript } from "./types";
import {
  imageUnderlineMarks,
  markOfRef,
  UNDERLINE_REF,
  underlineMark,
  underlineMarksOf,
} from "./underline-marks";

describe("下線部の印", () => {
  it("下線部の先頭の印を読み、印で始まらない下線は印なしにする", () => {
    expect(underlineMark("①二つの属性をサブタイプに移す")).toBe("①");
    expect(underlineMark("（ア）新会計システムに組み込まれたコントロール")).toBe("（ア）");
    expect(underlineMark("適切でないもの")).toBeUndefined();
  });

  it("設問・解説の「下線①」「下線部②」「下線（ア）」を見つけ、印を取り出す", () => {
    expect("本文中の下線①について，下線部②と下線（ア）".split(UNDERLINE_REF)).toEqual([
      "本文中の",
      "下線①",
      "について，",
      "下線部②",
      "と",
      "下線（ア）",
      "",
    ]);
    expect(markOfRef("下線部②")).toBe("②");
    expect(markOfRef("下線（ア）")).toBe("（ア）");
    // 印の無い「下線」は指していない
    expect("設問文の下線にも注意".split(UNDERLINE_REF)).toHaveLength(1);
  });

  it("図の代替テキストからは、[[②…]] と「（この一文に下線②）」の両方を読み、主キーの下線は数えない", () => {
    expect(imageUnderlineMarks("・②添付ファイル付きメールに対して…。（この一文に下線②）")).toEqual([
      "②",
    ]);
    expect(imageUnderlineMarks("[[③経路表]]、[[主:部屋 ID]]、下線③")).toEqual(["③"]);
    expect(imageUnderlineMarks("部屋：[[主:部屋 ID]]、[[外:部屋種別 ID]]")).toEqual([]);
  });

  it("本文の段落・項目・表・コードと図から、飛べる先の印を集める", () => {
    const marks = underlineMarksOf([
      { kind: "heading", text: "[[⑨見出しは下線として描かない]]" },
      { kind: "p", text: "…[[①最初]]。[[適切でないもの]]" },
      { kind: "items", items: [{ label: "(1)", text: "x", sub: "[[②項目の続き]]" }] },
      { kind: "table", caption: "表1", headers: ["a"], rows: [[["[[③セルの箇条書き]]"]]] },
      { kind: "code", caption: "図1", lines: ["SELECT [[④列]]"] },
      { kind: "image", image: { src: "/x.webp", width: 1, height: 1, alt: "（下線⑤）" } },
    ]);
    expect([...marks].sort()).toEqual(["①", "②", "③", "④", "⑤"]);
  });
});

/** 設問と解説に出てくる文字列。ここで「下線①」と書いたところが、押すと本文へ飛ぶ。 */
const referringTexts = (t: PmTranscript): string[] => [
  t.intent,
  t.overview,
  ...t.approach,
  ...t.parts.flatMap((part) => [
    part.text,
    ...(part.items ?? []).map((item) => item.text),
    ...(part.glossary ?? []).map((g) => g.note),
    ...part.slots.flatMap((slot) => [
      slot.explain,
      ...slot.steps,
      ...(slot.choiceNotes ?? []).map((n) => n.note),
      ...(slot.points ?? []),
      ...(slot.pitfalls ?? []),
      ...(slot.knowledge ?? []),
    ]),
  ]),
];

describe("書き起こした問の下線部", () => {
  it.each(Object.entries(PM_TRANSCRIPTS))("%s の設問・解説が指す下線部は、本文にある", (_, t) => {
    const marks = underlineMarksOf(t.body);
    const referred = referringTexts(t).flatMap((text) =>
      text
        .split(UNDERLINE_REF)
        .filter((_, i) => i % 2 === 1)
        .map(markOfRef),
    );
    expect(referred.filter((mark) => !marks.has(mark))).toEqual([]);
  });
});
