import type { PmExam } from "../pm-past/data";
import { PM_EXAMS, PM_PROBLEMS, pmProblemId } from "../pm-past/data";
import { questionSetsOf } from "../quiz/data/questions";
import { sourceId } from "../quiz/types";
import type { BackupSetDef } from "./backup";

/**
 * 個別に書き出す範囲のうち、演習の 1 回分（画面で選んでいる回）ではないもの。
 *
 * どれも「問題 ID の並び」として渡すので、書き出し・取り込みの扱いは演習の 1 回分と同じになる
 * （backup.ts の buildSetBackup・applyBackup）。
 */

/** 午後の過去問題の 1 回分（問1〜11）。答え・○△×・点数・マーカー・メモが入る。 */
export const pmExamBackupSet = (pmExam: PmExam): BackupSetDef => ({
  id: pmExam.id,
  label: `応用情報 午後 ${pmExam.label}`,
  questionIds: PM_PROBLEMS.map((problem) => pmProblemId(pmExam, problem.no)),
});

/**
 * 応用情報の過去問題すべて。午前の各回（exam: "AP"）と、午後の過去問題の各回。
 *
 * 午後の書き下ろしの問題集（exam: "APPM"）と穴埋めドリルは過去問題ではないので入れない。
 */
export const AP_PAST_BACKUP_SET: BackupSetDef = {
  id: "ap-past",
  label: "応用情報の過去問 午前・午後",
  questionIds: [
    ...questionSetsOf("AP").flatMap((set) =>
      set.questions.map((question) => sourceId(question.source)),
    ),
    ...PM_EXAMS.flatMap((pmExam) => pmExamBackupSet(pmExam).questionIds),
  ],
};
