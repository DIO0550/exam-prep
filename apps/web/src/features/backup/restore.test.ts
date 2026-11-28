import { beforeEach, describe, expect, it } from "vitest";

import { pmAnswerStore } from "../pm-past/answers";
import { PM_EXAMS } from "../pm-past/data";
import { pmMarkerStore } from "../pm-past/markers";
import { pmMarkStore } from "../pm-past/marks";
import { pmRecordStore } from "../pm-past/store";
import { noteStore } from "../quiz/notes/store";
import { progressStore } from "../quiz/progress/store";
import { weakStore } from "../vocab/weak/store";
import { buildAllBackup, buildSetBackup } from "./backup";
import { currentRecords, exportAll, exportSet, importBackup } from "./restore";
import { AP_PAST_BACKUP_SET, pmExamBackupSet } from "./scopes";

const QUESTION = "ap-r07-aki-am-01";
const OTHER = "gcp-cdl-scenario-1-01";
const PM = "ap-r07-aki-pm-05";
const PM_OTHER_EXAM = "ap-r07-haru-pm-01";

/** 午後の過去問題を 1 問解いて、答え・印・点数・マーカーを付ける。 */
const solvePm = (id: string, answer: string): void => {
  pmRecordStore.setScore(id, 60);
  pmAnswerStore.set(id, "設問1", answer);
  pmMarkStore.set(id, "設問1", "partial");
  pmMarkerStore.set(id, [{ start: 0, end: 2, text: answer.slice(0, 2), color: "green" }]);
};

describe("restore", () => {
  beforeEach(() => {
    progressStore.clear();
    noteStore.clear();
    weakStore.clear();
    pmRecordStore.clear();
    pmAnswerStore.clear();
    pmMarkStore.clear();
    pmMarkerStore.clear();
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

  it("全体の書き出しと取り込みで、午後の過去問題の記録も戻る", () => {
    solvePm(PM, "VLAN を分ける");
    noteStore.setText(PM, "問5 のメモ");
    const backup = exportAll();

    pmRecordStore.clear();
    pmAnswerStore.clear();
    pmMarkStore.clear();
    pmMarkerStore.clear();
    noteStore.clear();
    importBackup(backup);

    expect(pmRecordStore.snapshot().attempts[PM]?.score).toBe(60);
    expect(pmAnswerStore.snapshot()[PM]).toEqual({ 設問1: "VLAN を分ける" });
    expect(pmMarkStore.snapshot()[PM]).toEqual({ 設問1: "partial" });
    expect(pmMarkerStore.snapshot()[PM]?.[0]?.text).toBe("VL");
    expect(noteStore.snapshot().notes[PM]?.text).toBe("問5 のメモ");
  });

  it("午後の 1 回分の取り込みは、ほかの回の午後の記録と演習の記録を残す", () => {
    const [r07Aki] = PM_EXAMS;
    if (!r07Aki) throw new Error("午後の回が無い");
    solvePm(PM, "VLAN を分ける");
    const backup = exportSet(pmExamBackupSet(r07Aki));

    pmRecordStore.clear();
    pmAnswerStore.clear();
    solvePm(PM_OTHER_EXAM, "別の回");
    progressStore.answer(QUESTION, 2, true);
    importBackup(backup);

    expect(pmAnswerStore.snapshot()[PM]).toEqual({ 設問1: "VLAN を分ける" });
    expect(pmAnswerStore.snapshot()[PM_OTHER_EXAM]).toEqual({ 設問1: "別の回" });
    expect(pmRecordStore.snapshot().attempts[PM_OTHER_EXAM]?.score).toBe(60);
    expect(progressStore.snapshot().attempts[QUESTION]?.picked).toBe(2);
  });

  it("応用情報の過去問まとめては、午前と午後を入れ、ほかの試験は入れない", () => {
    progressStore.answer(QUESTION, 2, true);
    progressStore.answer(OTHER, 1, false);
    solvePm(PM, "VLAN を分ける");
    const backup = exportSet(AP_PAST_BACKUP_SET);

    expect(Object.keys(backup.attempts)).toEqual([QUESTION]);
    expect(Object.keys(backup.pmPast?.answers ?? {})).toEqual([PM]);
    expect(backup.scope).toEqual({
      type: "set",
      setId: "ap-past",
      label: "応用情報の過去問 午前・午後",
    });
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
