"use client";

import { useState } from "react";

import { BackupPanel } from "@/features/backup/components/backup-panel";
import { exportAll, exportSet, importBackup } from "@/features/backup/restore";
import { AP_PAST_BACKUP_SET, pmExamBackupSet } from "@/features/backup/scopes";
import { downloadBackup, readBackupFile } from "@/features/backup/transfer";
import { SelectMenu } from "@/features/quiz/components/select-menu";

import { PM_EXAMS } from "../data";

/**
 * 午後の過去問題の一覧に置く、記録の書き出し・読み込み。
 *
 * 演習の学習ホームと同じ枠を使う。この画面には「出題する回」が無いので、「この回だけ」で
 * 書き出す回は枠の中で選ぶ。読み込みはどの範囲のファイルでも受ける（演習の回のファイルも読める）。
 */
export const PmPastBackup = () => {
  const [examId, setExamId] = useState(PM_EXAMS[0]?.id ?? "");
  const pmExam = PM_EXAMS.find((candidate) => candidate.id === examId) ?? PM_EXAMS[0];
  if (!pmExam) return null;

  return (
    <BackupPanel
      setLabel={pmExam.label}
      setPicker={
        <SelectMenu
          label="書き出す回"
          value={pmExam.id}
          options={PM_EXAMS.map((option) => ({ value: option.id, label: option.label }))}
          onChange={setExamId}
        />
      }
      onExportAll={() => downloadBackup(exportAll())}
      onExportSet={() => downloadBackup(exportSet(pmExamBackupSet(pmExam)))}
      onExportApPast={() => downloadBackup(exportSet(AP_PAST_BACKUP_SET))}
      onRead={readBackupFile}
      onImport={importBackup}
    />
  );
};
