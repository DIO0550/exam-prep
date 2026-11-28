import { pmAnswerStore } from "../pm-past/answers";
import { pmMarkerStore } from "../pm-past/markers";
import { pmMarkStore } from "../pm-past/marks";
import { PM_RECORD_VERSION } from "../pm-past/record";
import { pmRecordStore } from "../pm-past/store";
import { noteStore } from "../quiz/notes/store";
import { progressStore } from "../quiz/progress/store";
import { weakStore } from "../vocab/weak/store";
import type { Backup, BackupSetDef, RecordSet } from "./backup";
import { applyBackup, buildAllBackup, buildSetBackup } from "./backup";

/**
 * 保存先（localStorage）と、書き出し・取り込みのつなぎ。
 *
 * 入れ物（解答・メモ・単語帳・午後の過去問題の 4 つ）をまたぐので、画面から直に触らずここに集める。
 */

/** 今このブラウザに入っている記録。 */
export const currentRecords = (): RecordSet => ({
  record: progressStore.snapshot(),
  notes: noteStore.snapshot(),
  weak: weakStore.snapshot(),
  pm: {
    attempts: pmRecordStore.snapshot().attempts,
    answers: pmAnswerStore.snapshot(),
    marks: pmMarkStore.snapshot(),
    markers: pmMarkerStore.snapshot(),
  },
});

/** 全体を書き出す形にする。 */
export const exportAll = (now?: Date): Backup => buildAllBackup(currentRecords(), now);

/** 渡した範囲（演習の 1 回・午後の 1 回・応用情報の過去問すべて）だけを書き出す形にする。 */
export const exportSet = (set: BackupSetDef, now?: Date): Backup =>
  buildSetBackup(currentRecords(), set, now);

/** 取り込んだ内容を保存先に反映する。購読している画面はその場で描き直る。 */
export const importBackup = (backup: Backup): void => {
  const current = currentRecords();
  const next = applyBackup(backup, current);

  progressStore.replace(next.record);
  noteStore.replace(next.notes);
  // 個別の取り込みでは単語帳に触らない（applyBackup が同じ値をそのまま返す）。
  if (next.weak !== current.weak) weakStore.replace(next.weak);
  // 午後の記録も、変わったものだけ書く（午前の回の取り込みや、版 1 のファイルでは触らない）。
  if (next.pm.attempts !== current.pm.attempts) {
    pmRecordStore.replace({ version: PM_RECORD_VERSION, attempts: next.pm.attempts });
  }
  if (next.pm.answers !== current.pm.answers) pmAnswerStore.replace(next.pm.answers);
  if (next.pm.marks !== current.pm.marks) pmMarkStore.replace(next.pm.marks);
  if (next.pm.markers !== current.pm.markers) pmMarkerStore.replace(next.pm.markers);
};
