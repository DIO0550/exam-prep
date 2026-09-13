import { isCorrect } from "../stats";
import type { Question } from "../types";
import type { ProgressRecord, Streak } from "./record";
import { dayKey, streakOf } from "./record";

/** 分野ごとの到達度。解答済みの問題だけを母数にする。 */
export type FieldMastery = {
  name: string;
  correct: number;
  answered: number;
  /** 0〜100。 */
  percent: number;
};

export type ProgressSummary = {
  /** 累計正答率。count は母数（直近 RECENT_LIMIT 件まで）。 */
  accuracy: { percent: number; count: number };
  streak: Streak;
  /** 苦手登録。untried は登録したあとまだ解き直していない数。 */
  weak: { total: number; untried: number };
  /** 到達度の低い分野から並べる。まだ解いていない分野は載せない。 */
  fields: FieldMastery[];
  /** 記録が 1 つでもあるか。数字の代わりに案内を出すかの判断に使う。 */
  hasRecord: boolean;
};

/** 保存した記録から、学習ホームに出す数字を作る。 */
export const summarizeProgress = (
  record: ProgressRecord,
  questionOf: (questionId: string) => Question | undefined,
  now: Date = new Date(),
): ProgressSummary => {
  const correctCount = record.recent.filter(Boolean).length;

  let weakTotal = 0;
  let weakUntried = 0;
  const byField = new Map<string, { correct: number; answered: number }>();

  for (const [id, attempt] of Object.entries(record.attempts)) {
    if (attempt.weak) {
      weakTotal += 1;
      // 解答を消した（＝やり直しに回した）まま手を付けていないものを未再挑戦とする。
      if (!attempt.revealed) weakUntried += 1;
    }

    const question = questionOf(id);
    if (!question || !attempt.revealed) continue;
    const stat = byField.get(question.field) ?? { correct: 0, answered: 0 };
    stat.answered += 1;
    if (isCorrect({ question, attempt })) stat.correct += 1;
    byField.set(question.field, stat);
  }

  const fields = [...byField]
    .map(([name, stat]) => ({
      name,
      correct: stat.correct,
      answered: stat.answered,
      percent: Math.round((stat.correct / stat.answered) * 100),
    }))
    .sort((a, b) => a.percent - b.percent || b.answered - a.answered);

  return {
    accuracy: {
      percent: record.recent.length ? Math.round((correctCount / record.recent.length) * 100) : 0,
      count: record.recent.length,
    },
    streak: streakOf(record.days, dayKey(now)),
    weak: { total: weakTotal, untried: weakUntried },
    fields,
    hasRecord: record.days.length > 0 || Object.keys(record.attempts).length > 0,
  };
};

/** ヘッダー右端に出す連続学習日数。 */
export const streakLabel = (streak: Streak): string =>
  streak.current ? `${streak.current}日連続` : "記録なし";

/** 学習ホームに並べる 3 枚のカード。記録が無いうちは数字の代わりに何が入るかを書く。 */
export type StatCard = {
  label: string;
  value: string;
  unit: string;
  note: string;
};

export const statCards = (summary: ProgressSummary): StatCard[] => [
  {
    label: "累計正答率",
    value: summary.accuracy.count ? String(summary.accuracy.percent) : "—",
    unit: summary.accuracy.count ? "%" : "",
    note: summary.accuracy.count ? `直近${summary.accuracy.count}問` : "解答すると出ます",
  },
  {
    label: "連続学習",
    value: String(summary.streak.current),
    unit: "日",
    note: summary.streak.longest ? `最長記録 ${summary.streak.longest}日` : "解答した日を数えます",
  },
  {
    label: "苦手登録",
    value: String(summary.weak.total),
    unit: "問",
    note: summary.weak.total ? `うち未再挑戦 ${summary.weak.untried}問` : "間違えた問題が入ります",
  },
];
