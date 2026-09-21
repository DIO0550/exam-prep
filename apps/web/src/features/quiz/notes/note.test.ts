import { describe, expect, it } from "vitest";

import {
  emptyNotes,
  isBlankNote,
  isEmptyNote,
  NOTE_VERSION,
  noteOf,
  parseNotes,
  STROKE_LIMIT,
  TEXT_LIMIT,
  withoutLastStroke,
  withoutStrokes,
  withStroke,
  withText,
} from "./note";

const WRITTEN = {
  version: NOTE_VERSION,
  notes: { q1: { text: "メモ", strokes: [[0, 0, 10, 10]] } },
};

describe("withText", () => {
  it("問題ごとに文章を持つ", () => {
    const record = withText(emptyNotes(), "q1", "台形の面積で解く");

    expect(noteOf(record, "q1").text).toBe("台形の面積で解く");
    expect(noteOf(record, "q2").text).toBe("");
  });

  it("手書きは残したまま文章だけ差し替える", () => {
    const record = withText(WRITTEN, "q1", "書き直し");

    expect(noteOf(record, "q1")).toEqual({ text: "書き直し", strokes: [[0, 0, 10, 10]] });
  });

  it("1 文字も無くなると、その問題の項目ごと消える（保存先を無駄に太らせない）", () => {
    const record = withText(withText(emptyNotes(), "q1", "メモ"), "q1", "");

    expect(record.notes.q1).toBeUndefined();
  });

  it("改行や空白だけでも消さずに持つ（書き始めに行を空けられるように）", () => {
    const record = withText(emptyNotes(), "q1", "\n\n");

    expect(noteOf(record, "q1").text).toBe("\n\n");
  });

  it(`${TEXT_LIMIT} 文字を超えるぶんは切る`, () => {
    const record = withText(emptyNotes(), "q1", "あ".repeat(TEXT_LIMIT + 100));

    expect(noteOf(record, "q1").text).toHaveLength(TEXT_LIMIT);
  });
});

describe("withStroke", () => {
  it("ひと筆ずつ足す", () => {
    const record = withStroke(withStroke(emptyNotes(), "q1", [0, 0, 5, 5]), "q1", [9, 9, 1, 1]);

    expect(noteOf(record, "q1").strokes).toEqual([
      [0, 0, 5, 5],
      [9, 9, 1, 1],
    ]);
  });

  it("点が 1 つも無いひと筆は足さない", () => {
    expect(withStroke(emptyNotes(), "q1", []).notes.q1).toBeUndefined();
  });

  it(`${STROKE_LIMIT} 筆を超えたら足さない`, () => {
    const full = {
      version: NOTE_VERSION,
      notes: { q1: { text: "", strokes: Array.from({ length: STROKE_LIMIT }, () => [0, 0]) } },
    };

    expect(withStroke(full, "q1", [1, 1]).notes.q1?.strokes).toHaveLength(STROKE_LIMIT);
  });
});

describe("withoutLastStroke", () => {
  it("最後のひと筆だけ取り消す", () => {
    const record = withStroke(WRITTEN, "q1", [5, 5, 6, 6]);

    expect(noteOf(withoutLastStroke(record, "q1"), "q1").strokes).toEqual([[0, 0, 10, 10]]);
  });

  it("手書きが無ければ何も変えない", () => {
    const record = emptyNotes();

    expect(withoutLastStroke(record, "q1")).toBe(record);
  });
});

describe("withoutStrokes", () => {
  it("手書きだけ消して文章は残す", () => {
    expect(noteOf(withoutStrokes(WRITTEN, "q1"), "q1")).toEqual({ text: "メモ", strokes: [] });
  });

  it("文章も無ければ、その問題の項目ごと消える", () => {
    const record = withStroke(emptyNotes(), "q1", [0, 0, 1, 1]);

    expect(withoutStrokes(record, "q1").notes.q1).toBeUndefined();
  });
});

describe("isEmptyNote", () => {
  it("読めるものが無ければ空（「メモあり」の印を出さない）", () => {
    expect(isEmptyNote({ text: " \n", strokes: [] })).toBe(true);
    expect(isEmptyNote({ text: "", strokes: [[0, 0]] })).toBe(false);
    expect(isEmptyNote({ text: "メモ", strokes: [] })).toBe(false);
  });
});

describe("isBlankNote", () => {
  it("1 文字も無いときだけ true。空白や改行は「ある」と見る", () => {
    expect(isBlankNote({ text: "", strokes: [] })).toBe(true);
    expect(isBlankNote({ text: "\n", strokes: [] })).toBe(false);
    expect(isBlankNote({ text: "", strokes: [[0, 0]] })).toBe(false);
  });
});

describe("parseNotes", () => {
  it("保存した形をそのまま戻す", () => {
    expect(parseNotes(structuredClone(WRITTEN))).toEqual(WRITTEN);
  });

  it("版が違うメモは捨てる", () => {
    expect(parseNotes({ ...WRITTEN, version: NOTE_VERSION + 1 })).toEqual(emptyNotes());
  });

  it("メモですらない値は捨てる", () => {
    expect(parseNotes(null)).toEqual(emptyNotes());
    expect(parseNotes({ version: NOTE_VERSION, notes: "メモ" })).toEqual(emptyNotes());
  });

  it("崩れている問題だけ落として、他の問題のメモは残す", () => {
    const broken = {
      version: NOTE_VERSION,
      notes: {
        q1: { text: "残る", strokes: [] },
        q2: { text: "点が数でない", strokes: [["0", "0"]] },
        q3: { text: 7, strokes: [] },
        q4: { text: "点が奇数個", strokes: [[0, 0, 5]] },
      },
    };

    expect(parseNotes(broken)).toEqual({
      version: NOTE_VERSION,
      notes: { q1: { text: "残る", strokes: [] } },
    });
  });
});
