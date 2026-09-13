import type { Question } from "./types";

/** 1 問ごとの解答状況。 */
export type Attempt = {
  /** 選んだ選択肢の添字。未解答なら null。 */
  picked: number | null;
  /** 正誤と解説を開いたか。解答するとその場で true になる。 */
  revealed: boolean;
  /** 「後で見直す」フラグ。 */
  flagged: boolean;
  /** 苦手登録。間違えた時点で自動的に付く。 */
  weak: boolean;
  /** 「–」で消し込んだ選択肢の添字。 */
  excluded: number[];
};

/** 問題とその解答状況の組。並行配列にすると添字がずれるので 1 つにまとめている。 */
export type QuizItem = {
  question: Question;
  attempt: Attempt;
};

export type FieldStat = {
  name: string;
  /** 0〜100。 */
  percent: number;
  /** "3/4" の形。 */
  label: string;
};

export type Summary = {
  answered: number;
  correct: number;
  /** 解答済みに対する正答率（0〜100）。未解答のみなら 0。 */
  percent: number;
  fieldStats: FieldStat[];
};

export const isCorrect = ({ question, attempt }: QuizItem): boolean =>
  attempt.picked === question.answer;

/** 解答済みの問題だけを母数に、全体と分野別の正答率を出す。 */
export const summarize = (items: QuizItem[]): Summary => {
  const answered = items.filter((item) => item.attempt.revealed);
  const correct = answered.filter(isCorrect);

  const byField = new Map<string, { total: number; correct: number }>();
  for (const item of answered) {
    const stat = byField.get(item.question.field) ?? { total: 0, correct: 0 };
    stat.total += 1;
    if (isCorrect(item)) stat.correct += 1;
    byField.set(item.question.field, stat);
  }

  return {
    answered: answered.length,
    correct: correct.length,
    percent: answered.length ? Math.round((correct.length / answered.length) * 100) : 0,
    fieldStats: [...byField].map(([name, stat]) => ({
      name,
      percent: Math.round((stat.correct / stat.total) * 100),
      label: `${stat.correct}/${stat.total}`,
    })),
  };
};

/** 経過ミリ秒を「3分05秒」の形にする。 */
export const formatElapsed = (ms: number): string => {
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}分${String(seconds % 60).padStart(2, "0")}秒`;
};
