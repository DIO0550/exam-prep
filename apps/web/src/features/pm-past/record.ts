/**
 * 午後の過去問題を解いた記録。問題 ID（ap-r06-aki-pm-05 など）ごとに、解いた日と自己採点の点数を持つ。
 *
 * 午後は記述式で、解答例と見比べて自分で採点するしかない。点数は 0〜100 の任意入力にし、
 * 付けなくても「解いた」だけは残せるようにする。
 */

export type PmAttempt = {
  /** 解いた日（YYYY-MM-DD）。 */
  solvedOn: string;
  /** 自己採点の点数（0〜100）。付けていなければ undefined。 */
  score?: number;
};

export type PmRecord = {
  version: 1;
  attempts: Record<string, PmAttempt>;
};

export const PM_RECORD_VERSION = 1;

export const emptyPmRecord = (): PmRecord => ({ version: PM_RECORD_VERSION, attempts: {} });

/** SSR と hydration のあいだに返す値。毎回同じ参照にする。 */
export const EMPTY_PM_RECORD: PmRecord = emptyPmRecord();

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** 点数として受け付ける値か。0〜100 の整数だけ。 */
export const isScore = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100;

/**
 * 保存されていた値を読む。形の合わないものは捨てる（手で書き換えられた値や、古い形の値）。
 * 1 件が壊れていても、他の記録まで失わないよう、項目ごとに確かめる。
 */
export const parsePmRecord = (value: unknown): PmRecord => {
  if (typeof value !== "object" || value === null) return emptyPmRecord();
  const attempts = (value as { attempts?: unknown }).attempts;
  if (typeof attempts !== "object" || attempts === null) return emptyPmRecord();
  const result: Record<string, PmAttempt> = {};
  for (const [id, attempt] of Object.entries(attempts)) {
    if (typeof attempt !== "object" || attempt === null) continue;
    const { solvedOn, score } = attempt as { solvedOn?: unknown; score?: unknown };
    if (typeof solvedOn !== "string" || !DATE.test(solvedOn)) continue;
    result[id] = isScore(score) ? { solvedOn, score } : { solvedOn };
  }
  return { version: PM_RECORD_VERSION, attempts: result };
};

/** 解いた記録を付ける。すでにあれば日付を更新し、点数は渡されたときだけ書き換える。 */
export const withSolved = (record: PmRecord, id: string, solvedOn: string): PmRecord => ({
  ...record,
  attempts: { ...record.attempts, [id]: { ...record.attempts[id], solvedOn } },
});

/** 点数を付け直す。undefined を渡すと点数だけ外す。解いた記録が無ければ、今日解いたものとして付ける。 */
export const withScore = (
  record: PmRecord,
  id: string,
  score: number | undefined,
  today: string,
): PmRecord => {
  const solvedOn = record.attempts[id]?.solvedOn ?? today;
  const attempt: PmAttempt = score === undefined ? { solvedOn } : { solvedOn, score };
  return { ...record, attempts: { ...record.attempts, [id]: attempt } };
};

/** 記録を外す（解いていない状態に戻す）。 */
export const withoutAttempt = (record: PmRecord, id: string): PmRecord => {
  const { [id]: _removed, ...rest } = record.attempts;
  return { ...record, attempts: rest };
};

export type PmFieldSummary = {
  solved: number;
  /** 点数を付けたものの平均。1 つも無ければ undefined。 */
  average?: number;
};

/** いくつかの問題 ID について、解いた数と点数の平均をまとめる。 */
export const summarize = (record: PmRecord, ids: string[]): PmFieldSummary => {
  const attempts = ids
    .map((id) => record.attempts[id])
    .filter((attempt): attempt is PmAttempt => attempt !== undefined);
  const scores = attempts
    .map((attempt) => attempt.score)
    .filter((score): score is number => score !== undefined);
  return {
    solved: attempts.length,
    average:
      scores.length > 0
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : undefined,
  };
};
