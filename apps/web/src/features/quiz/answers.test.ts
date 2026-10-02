import { describe, expect, it } from "vitest";

import { matchesAnswer, selectionLabel } from "./answers";
import { GAIP_MOCK_5 } from "./data/gaip-mock-5";
import {
  emptyRecord,
  FRESH_ATTEMPT,
  isAttempt,
  parseRecord,
  RECORD_VERSION,
} from "./progress/record";
import { isCorrect, summarize } from "./stats";

describe("複数選択の採点と保存", () => {
  it("順序は問わず過不足のない一致だけを正解にする", () => {
    expect(matchesAnswer([0, 2], [2, 0])).toBe(true);
    for (const picked of [null, [], [0], [0, 1, 2], [0, 0], [1, 3]]) {
      expect(matchesAnswer([0, 2], picked)).toBe(false);
    }
    expect(matchesAnswer(2, 2)).toBe(true);
    expect(matchesAnswer(2, 1)).toBe(false);
  });

  it("未確定は正解扱いせず、章別・全体の集計にも含めない", () => {
    const question = GAIP_MOCK_5[0];
    const draft = { question, attempt: { ...FRESH_ATTEMPT, picked: [0, 2] } };
    expect(isCorrect(draft)).toBe(false);
    const summary = summarize([
      draft,
      { question, attempt: { ...draft.attempt, picked: [2, 0], revealed: true } },
      { question, attempt: { ...draft.attempt, picked: [0], revealed: true } },
    ]);
    expect(summary).toMatchObject({ answered: 2, correct: 1, percent: 50 });
    expect(summary.fieldStats).toEqual([{ name: question.field, percent: 50, label: "1/2" }]);
  });

  it("シャッフル後の表示順で解答記号を表示する", () => {
    expect(selectionLabel([0, 2], [2, 1, 3, 0])).toBe("ア・エ");
    expect(selectionLabel([], [0, 1, 2, 3])).toBe("未解答");
  });

  it("旧版の単一解答も、新版の未確定・確定済み複数解答も復元する", () => {
    const record = {
      ...emptyRecord(),
      attempts: {
        single: { ...FRESH_ATTEMPT, picked: 1, revealed: true },
        draft: { ...FRESH_ATTEMPT, picked: [0] },
        multiple: { ...FRESH_ATTEMPT, picked: [2, 0], revealed: true },
      },
    };
    expect(parseRecord(JSON.parse(JSON.stringify(record)))).toEqual(record);
    const old = { ...emptyRecord(), version: 4, attempts: { single: record.attempts.single } };
    expect(parseRecord(old)).toEqual({ ...old, version: RECORD_VERSION });
  });

  it.each([
    [0, 0],
    [-1, 2],
    [0.5, 2],
    ["0", 2],
    [null, 2],
  ])("不正な複数解答 %j を保存記録として受け入れない", (...picked) => {
    expect(isAttempt({ ...FRESH_ATTEMPT, picked })).toBe(false);
  });
});
