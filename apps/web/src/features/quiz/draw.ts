import type { QuestionSet } from "./data/questions";
import type { Question } from "./types";

/**
 * ランダム出題。選んだ回・分野に入る問題から、決めた数だけ無作為に引く。
 *
 * 回をまたいで出すので、並びは回の順ではなく引いた順のまま出す。
 */

/** 1 回に引く問題数。「すべて」は選んだ範囲を全部、順番だけ混ぜて出す。 */
export const DRAW_COUNTS = [10, 20, 40, 80, "すべて"] as const;
export type DrawCount = (typeof DRAW_COUNTS)[number];

export type DrawSettings = {
  /** 引く対象の回（QuestionSet の id）。 */
  setIds: string[];
  /** 引く対象の分野。 */
  fields: string[];
  count: DrawCount;
};

/** 回に出てくる分野を、最初に出てきた順に並べる（原本の出題順＝テクノロジ→マネジメント→ストラテジに沿う）。 */
export const fieldsOf = (sets: QuestionSet[]): string[] => [
  ...new Set(sets.flatMap((set) => set.questions.map((question) => question.field))),
];

/** 最初はすべての回・すべての分野から 20 問。 */
export const defaultDrawSettings = (sets: QuestionSet[]): DrawSettings => ({
  setIds: sets.map((set) => set.id),
  fields: fieldsOf(sets),
  count: 20,
});

/** 選んだ回・分野に入る問題。 */
export const drawPool = (sets: QuestionSet[], settings: DrawSettings): Question[] =>
  sets
    .filter((set) => settings.setIds.includes(set.id))
    .flatMap((set) => set.questions)
    .filter((question) => settings.fields.includes(question.field));

/** 今の設定で実際に出る問題数。範囲が引く数より少なければ、範囲の全部。 */
export const drawSize = (poolSize: number, count: DrawCount): number =>
  count === "すべて" ? poolSize : Math.min(poolSize, count);

/** Fisher-Yates を引く数のところで止める。並びは毎回変わってよいので、種は持たない。 */
export const drawQuestions = (
  pool: Question[],
  count: DrawCount,
  random: () => number = Math.random,
): Question[] => {
  const rest = [...pool];
  const size = drawSize(rest.length, count);
  for (let index = 0; index < size; index += 1) {
    const pick = index + Math.floor(random() * (rest.length - index));
    const here = rest[index];
    const there = rest[pick];
    if (here === undefined || there === undefined) continue;
    rest[index] = there;
    rest[pick] = here;
  }
  return rest.slice(0, size);
};
