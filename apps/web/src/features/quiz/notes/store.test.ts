import { beforeEach, describe, expect, it, vi } from "vitest";

import { emptyNotes, NOTE_VERSION, noteOf } from "./note";
import { loadNotes, NOTES_KEY } from "./storage";
import { noteStore } from "./store";

const QUESTION = "ap-r07-aki-am-01";

describe("noteStore", () => {
  beforeEach(() => {
    noteStore.clear();
  });

  it("文章は localStorage に残る", () => {
    noteStore.setText(QUESTION, "桁落ちの例を書き出す");

    expect(noteOf(loadNotes(), QUESTION).text).toBe("桁落ちの例を書き出す");
  });

  it("手書きはひと筆ずつ足され、取り消せる", () => {
    noteStore.addStroke(QUESTION, [0, 0, 10, 10]);
    noteStore.addStroke(QUESTION, [20, 20, 30, 30]);

    expect(noteOf(noteStore.snapshot(), QUESTION).strokes).toHaveLength(2);

    noteStore.undoStroke(QUESTION);

    expect(noteOf(loadNotes(), QUESTION).strokes).toEqual([[0, 0, 10, 10]]);
  });

  it("手書きを全部消しても文章は残る", () => {
    noteStore.setText(QUESTION, "残る");
    noteStore.addStroke(QUESTION, [0, 0, 10, 10]);

    noteStore.clearSketch(QUESTION);

    expect(noteOf(loadNotes(), QUESTION)).toEqual({ text: "残る", strokes: [] });
  });

  it("問題ごとに別のメモになる", () => {
    noteStore.setText(QUESTION, "1問目");
    noteStore.setText("ap-r07-aki-am-02", "2問目");

    expect(noteOf(noteStore.snapshot(), QUESTION).text).toBe("1問目");
    expect(noteOf(noteStore.snapshot(), "ap-r07-aki-am-02").text).toBe("2問目");
  });

  it("別タブの更新を取り込んで購読側に知らせる", () => {
    const listener = vi.fn();
    const unsubscribe = noteStore.subscribe(listener);

    window.localStorage.setItem(
      NOTES_KEY,
      JSON.stringify({
        version: NOTE_VERSION,
        notes: { [QUESTION]: { text: "別タブ", strokes: [] } },
      }),
    );
    window.dispatchEvent(new StorageEvent("storage", { key: NOTES_KEY }));

    expect(listener).toHaveBeenCalled();
    expect(noteOf(noteStore.snapshot(), QUESTION).text).toBe("別タブ");
    unsubscribe();
  });

  it("壊れた値が入っていたら、メモが無いものとして読む", () => {
    window.localStorage.setItem(NOTES_KEY, "{壊れている");

    expect(loadNotes()).toEqual(emptyNotes());
  });

  it("消すと保存先からも消える", () => {
    noteStore.setText(QUESTION, "メモ");

    noteStore.clear();

    expect(window.localStorage.getItem(NOTES_KEY)).toBeNull();
    expect(noteStore.snapshot()).toEqual(emptyNotes());
  });
});
