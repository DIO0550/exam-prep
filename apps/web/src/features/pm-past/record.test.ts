import { describe, expect, it } from "vitest";

import { PM_EXAMS, PM_PROBLEMS, pmProblemId, pmSourceLabel } from "./data";
import {
  emptyPmRecord,
  parsePmRecord,
  summarize,
  withoutAttempt,
  withScore,
  withSolved,
} from "./record";

describe("午後の過去問題の一覧", () => {
  it("平成31年度春期〜令和7年度秋期の 13 回を、ID が重ならないように持つ", () => {
    expect(PM_EXAMS).toHaveLength(13);
    expect(new Set(PM_EXAMS.map((pmExam) => pmExam.id)).size).toBe(13);
    // 令和2年度は春期が取りやめになり、10月の回だけがある
    expect(PM_EXAMS.filter((pmExam) => pmExam.year === 2).map((pmExam) => pmExam.term)).toEqual([
      "oct",
    ]);
  });

  it("PDF の URL は IPA の過去問題のページにある、その回の午後の問題・解答例・採点講評を指す", () => {
    for (const pmExam of PM_EXAMS) {
      for (const [url, kind] of [
        [pmExam.questionPdf, "qs"],
        [pmExam.answerPdf, "ans"],
        [pmExam.commentPdf, "cmnt"],
      ] as const) {
        expect(url, pmExam.label).toMatch(
          new RegExp(
            `^https://www\\.ipa\\.go\\.jp/shiken/mondai-kaiotu/[\\w-]+-att/\\d{4}[rh]\\d{2}[aho]_ap_pm_${kind}\\.pdf$`,
          ),
        );
      }
    }
  });

  it("問題 ID と出典表記は、午前と同じ形で作る", () => {
    const r06aki = PM_EXAMS.find((pmExam) => pmExam.id === "ap-r06-aki-pm");
    expect(r06aki).toBeDefined();
    if (!r06aki) return;
    expect(pmProblemId(r06aki, 5)).toBe("ap-r06-aki-pm-05");
    expect(pmSourceLabel(r06aki, 5)).toBe("令和6年度 秋期 応用情報技術者試験 午後 問5");
    const h31 = PM_EXAMS.find((pmExam) => pmExam.era === "平成");
    expect(h31 && pmSourceLabel(h31, 1)).toBe("平成31年度 春期 応用情報技術者試験 午後 問1");
  });

  it("問は 11 問で、必須は問1 だけ", () => {
    expect(PM_PROBLEMS.map((problem) => problem.no)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(PM_PROBLEMS.filter((problem) => problem.required).map((problem) => problem.no)).toEqual([
      1,
    ]);
  });
});

describe("午後の過去問題の記録", () => {
  it("解いた印と点数を付け、外せる", () => {
    let record = withSolved(emptyPmRecord(), "a", "2026-11-01");
    expect(record.attempts.a).toEqual({ solvedOn: "2026-11-01" });
    record = withScore(record, "a", 72, "2026-11-05");
    // 点数を付けても、解いた日は最初の日のまま
    expect(record.attempts.a).toEqual({ solvedOn: "2026-11-01", score: 72 });
    record = withScore(record, "a", undefined, "2026-11-05");
    expect(record.attempts.a).toEqual({ solvedOn: "2026-11-01" });
    record = withoutAttempt(record, "a");
    expect(record.attempts.a).toBeUndefined();
  });

  it("解いた印が無いまま点数を付けると、今日解いたものとして残す", () => {
    const record = withScore(emptyPmRecord(), "b", 60, "2026-11-05");
    expect(record.attempts.b).toEqual({ solvedOn: "2026-11-05", score: 60 });
  });

  it("保存されていた値のうち、形の合わない項目だけを捨てる", () => {
    const record = parsePmRecord({
      version: 1,
      attempts: {
        ok: { solvedOn: "2026-11-01", score: 80 },
        badScore: { solvedOn: "2026-11-01", score: 120 },
        badDate: { solvedOn: "yesterday", score: 50 },
        notObject: 3,
      },
    });
    expect(record.attempts).toEqual({
      ok: { solvedOn: "2026-11-01", score: 80 },
      badScore: { solvedOn: "2026-11-01" },
    });
    expect(parsePmRecord("broken").attempts).toEqual({});
  });

  it("解いた数と、点数を付けたものだけの平均をまとめる", () => {
    let record = withScore(emptyPmRecord(), "a", 60, "2026-11-01");
    record = withScore(record, "b", 81, "2026-11-01");
    record = withSolved(record, "c", "2026-11-01");
    expect(summarize(record, ["a", "b", "c", "d"])).toEqual({ solved: 3, average: 71 });
    expect(summarize(record, ["d"])).toEqual({ solved: 0, average: undefined });
  });
});
