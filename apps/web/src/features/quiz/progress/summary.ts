import type { Summary } from "../stats";
import type { ProgressRecord, Streak } from "./record";
import { dayKey, streakOf } from "./record";

/**
 * 学習ホームに出す、回をまたぐ数字。
 *
 * 正答率はここに置かない。「令和5年春がどれだけ取れたか」を知りたいのに、
 * 回をまたいだ平均を出すと、どの回の力なのか読めなくなるため。
 * 正答率と分野別は、選んでいる回の解答（stats.ts の summarize）から出す。
 */
export type ProgressSummary = {
  streak: Streak;
  /** 苦手登録。untried は登録したあとまだ解き直していない数。 */
  weak: { total: number; untried: number };
  /** 記録が 1 つでもあるか。数字の代わりに案内を出すかの判断に使う。 */
  hasRecord: boolean;
};

/** 保存した記録から、学習ホームに出す数字を作る。 */
export const summarizeProgress = (
  record: ProgressRecord,
  now: Date = new Date(),
): ProgressSummary => {
  let weakTotal = 0;
  let weakUntried = 0;

  for (const attempt of Object.values(record.attempts)) {
    if (!attempt.weak) continue;
    weakTotal += 1;
    // 解答を消した（＝やり直しに回した）まま手を付けていないものを未再挑戦とする。
    if (!attempt.revealed) weakUntried += 1;
  }

  return {
    streak: streakOf(record.days, dayKey(now)),
    weak: { total: weakTotal, untried: weakUntried },
    hasRecord: record.days.length > 0 || Object.keys(record.attempts).length > 0,
  };
};

/** ヘッダー右端に出す連続学習日数。 */
export const streakLabel = (streak: Streak): string =>
  streak.current ? `${streak.current}日連続` : "記録なし";

/**
 * 学習ホームに並べる 3 枚のカード。記録が無いうちは数字の代わりに何が入るかを書く。
 * 正答率だけは選んでいる回のもの（set）から作る。
 */
export type StatCard = {
  label: string;
  value: string;
  unit: string;
  note: string;
};

export const statCards = (summary: ProgressSummary, set: Summary): StatCard[] => [
  {
    label: "この回の正答率",
    value: set.answered ? String(set.percent) : "—",
    unit: set.answered ? "%" : "",
    note: set.answered ? `${set.correct}/${set.answered}問 正解` : "解答すると出ます",
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
