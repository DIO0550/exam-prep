import { noteStore } from "../quiz/notes/store";
import { progressStore } from "../quiz/progress/store";
import { weakStore } from "../vocab/weak/store";
import type { Backup, RecordSet } from "./backup";
import { applyBackup, buildAllBackup, buildSetBackup } from "./backup";

/**
 * 保存先（localStorage）と、書き出し・取り込みのつなぎ。
 *
 * 3 つの入れ物（解答・メモ・単語帳）をまたぐので、画面から直に触らずここに集める。
 */

/** 今このブラウザに入っている記録。 */
export const currentRecords = (): RecordSet => ({
  record: progressStore.snapshot(),
  notes: noteStore.snapshot(),
  weak: weakStore.snapshot(),
});

/** 全体を書き出す形にする。 */
export const exportAll = (now?: Date): Backup => buildAllBackup(currentRecords(), now);

/** 選んでいる回だけを書き出す形にする。 */
export const exportSet = (
  set: { id: string; label: string; questionIds: readonly string[] },
  now?: Date,
): Backup => buildSetBackup(currentRecords(), set, now);

/** 取り込んだ内容を保存先に反映する。購読している画面はその場で描き直る。 */
export const importBackup = (backup: Backup): void => {
  const current = currentRecords();
  const next = applyBackup(backup, current);

  progressStore.replace(next.record);
  noteStore.replace(next.notes);
  // 個別の取り込みでは単語帳に触らない（applyBackup が同じ値をそのまま返す）。
  if (next.weak !== current.weak) weakStore.replace(next.weak);
};
