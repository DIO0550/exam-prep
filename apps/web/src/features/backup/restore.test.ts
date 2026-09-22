import { beforeEach, describe, expect, it } from "vitest";

import { noteStore } from "../quiz/notes/store";
import { progressStore } from "../quiz/progress/store";
import { weakStore } from "../vocab/weak/store";
import { buildAllBackup, buildSetBackup } from "./backup";
import { currentRecords, exportAll, exportSet, importBackup } from "./restore";

const QUESTION = "ap-r07-aki-am-01";
const OTHER = "gcp-cdl-scenario-1-01";

describe("restore", () => {
  beforeEach(() => {
    progressStore.clear();
    noteStore.clear();
    weakStore.clear();
  });

  it("書き出したものを取り込むと、保存先まで戻る", () => {
    progressStore.answer(QUESTION, 2, true);
    noteStore.setText(QUESTION, "桁あふれ");
    weakStore.mark("net-CPU", true);
    const backup = exportAll();

    progressStore.clear();
    noteStore.clear();
    weakStore.clear();
    importBackup(backup);

    expect(progressStore.snapshot().attempts[QUESTION]?.picked).toBe(2);
    expect(progressStore.snapshot().recent).toEqual([true]);
    expect(noteStore.snapshot().notes[QUESTION]?.text).toBe("桁あふれ");
    expect(weakStore.snapshot().ids).toEqual(["net-CPU"]);
  });

  it("個別の取り込みは、その回以外の記録を残す", () => {
    progressStore.answer(QUESTION, 2, true);
    const backup = exportSet({
      id: "ap-r07-aki-am",
      label: "令和7年 秋期",
      questionIds: [QUESTION],
    });

    progressStore.clear();
    weakStore.mark("net-CPU", true);
    progressStore.answer(OTHER, 1, false);
    importBackup(backup);

    expect(progressStore.snapshot().attempts[QUESTION]?.picked).toBe(2);
    expect(progressStore.snapshot().attempts[OTHER]?.picked).toBe(1);
    // 累計と単語帳は、個別の取り込みでは動かさない。
    expect(progressStore.snapshot().recent).toEqual([false]);
    expect(weakStore.snapshot().ids).toEqual(["net-CPU"]);
  });

  it("今の記録をそのまま書き出せる", () => {
    progressStore.answer(QUESTION, 2, true);

    // exportAll() は呼ぶたびに exportedAt を今の時刻で作る。2 回呼んで突き合わせると、
    // その間にミリ秒が進んだときだけ落ちる（実際に CI で落ちた）。1 回だけ呼び、
    // その exportedAt を渡して比べる。
    const exported = exportAll();

    expect(exported).toEqual(buildAllBackup(currentRecords(), new Date(exported.exportedAt)));
    expect(
      exportSet({ id: "ap-r07-aki-am", label: "令和7年 秋期", questionIds: [QUESTION] }).attempts,
    ).toEqual(
      buildSetBackup(currentRecords(), {
        id: "ap-r07-aki-am",
        label: "令和7年 秋期",
        questionIds: [QUESTION],
      }).attempts,
    );
  });
});
