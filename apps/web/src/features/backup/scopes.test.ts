import { describe, expect, it } from "vitest";

import { PM_EXAMS, PM_PROBLEMS } from "../pm-past/data";
import { questionSetsOf } from "../quiz/data/questions";
import { AP_PAST_BACKUP_SET, pmExamBackupSet } from "./scopes";

describe("書き出す範囲", () => {
  it("午後の 1 回分は、その回の問1〜11", () => {
    const [r07Aki] = PM_EXAMS;
    if (!r07Aki) throw new Error("午後の回が無い");
    const set = pmExamBackupSet(r07Aki);

    expect(set.id).toBe("ap-r07-aki-pm");
    expect(set.label).toBe("応用情報 午後 令和7年度 秋期");
    expect(set.questionIds).toHaveLength(PM_PROBLEMS.length);
    expect(set.questionIds[0]).toBe("ap-r07-aki-pm-01");
    expect(set.questionIds.at(-1)).toBe("ap-r07-aki-pm-11");
  });

  it("応用情報の過去問まとめては、午前の全部の回と午後の全部の回だけ", () => {
    const ids = AP_PAST_BACKUP_SET.questionIds;
    const amCount = questionSetsOf("AP").reduce((sum, set) => sum + set.questions.length, 0);

    expect(ids).toHaveLength(amCount + PM_EXAMS.length * PM_PROBLEMS.length);
    expect(new Set(ids).size).toBe(ids.length);
    // 午前（-am-）と午後（-pm-）の過去問題だけ。書き下ろしの午後（ap-pm-…）やほかの試験は入れない。
    expect(ids.every((id) => /^ap-[rh]\d{2}-(haru|aki|oct)-(am|pm)-\d{2}$/.test(id))).toBe(true);
  });
});
