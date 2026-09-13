import { beforeEach, describe, expect, it, vi } from "vitest";

import { emptyRecord, RECORD_VERSION } from "./record";
import { loadRecord, STORAGE_KEY } from "./storage";
import { progressStore } from "./store";

const QUESTION = "ap-r07-aki-am-01";

/** 別タブが書いたことにして、保存されている記録を差し替える。 */
const writeFromAnotherTab = (record: unknown) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
};

describe("progressStore", () => {
  beforeEach(() => {
    progressStore.clear();
  });

  it("解答は localStorage に残る", () => {
    progressStore.answer(QUESTION, 2, true);

    expect(loadRecord().attempts[QUESTION]).toEqual({
      picked: 2,
      revealed: true,
      flagged: false,
      weak: false,
      excluded: [],
    });
    expect(loadRecord().recent).toEqual([true]);
    expect(loadRecord().days).toHaveLength(1);
  });

  it("間違えると苦手登録に入り、そのあと正解しても外れない", () => {
    progressStore.answer(QUESTION, 1, false);
    expect(progressStore.snapshot().attempts[QUESTION]?.weak).toBe(true);

    progressStore.restart([QUESTION]);
    progressStore.answer(QUESTION, 2, true);

    expect(progressStore.snapshot().attempts[QUESTION]?.weak).toBe(true);
  });

  it("解答を消してもフラグは残る", () => {
    progressStore.patchAttempt(QUESTION, { flagged: true });
    progressStore.answer(QUESTION, 2, true);

    progressStore.restart([QUESTION]);

    expect(progressStore.snapshot().attempts[QUESTION]).toMatchObject({
      picked: null,
      revealed: false,
      flagged: true,
    });
  });

  it("選んでいる回を覚える", () => {
    progressStore.selectSet("ap-r06-haru-am");

    expect(loadRecord().setId).toBe("ap-r06-haru-am");
  });

  it("選択肢をシャッフルするかを覚える", () => {
    progressStore.setShuffle(true);

    expect(loadRecord().shuffle).toBe(true);
  });

  it("解き直すと並びの種が進む", () => {
    progressStore.answer(QUESTION, 2, true);

    progressStore.restart([QUESTION]);

    expect(loadRecord().shuffleSeed).toBe(1);
  });

  it("別タブの更新を取り込んで購読側に知らせる", () => {
    const listener = vi.fn();
    const unsubscribe = progressStore.subscribe(listener);

    writeFromAnotherTab({ ...emptyRecord(), version: RECORD_VERSION, setId: "ap-r03-haru-am" });

    expect(listener).toHaveBeenCalled();
    expect(progressStore.snapshot().setId).toBe("ap-r03-haru-am");
    unsubscribe();
  });

  it("壊れた記録が入っていたら、空の記録として読む", () => {
    window.localStorage.setItem(STORAGE_KEY, "{壊れている");

    expect(loadRecord()).toEqual(emptyRecord());
  });

  it("消すと保存先からも消える", () => {
    progressStore.answer(QUESTION, 2, true);

    progressStore.clear();

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(progressStore.snapshot()).toEqual(emptyRecord());
  });
});
