import { answerKeyLine, keyLineSlotKey, parseKeyLine } from "./key-line";
import type { PmMark } from "./marks";
import type { PmAnswerSlot, PmQuestionPart, PmTranscript } from "./types";

/**
 * 書き起こした午後の 1 問を、欄ごとに採点する。
 *
 * 記号の欄は、選んだ記号を解答例と突き合わせて自動で ○× を決める。属性名の下線も答える欄
 * （keyUnderline）は、選んだ下線が解答例と違えば、属性名を見るまでもなく × にする。
 * それ以外の記述の欄と、何も書いていない・選んでいない（紙で解いた）欄は、本人が付けた印
 * （○・△・×）を使う。
 *
 * 点数は目安。IPA が公表している配点は問ごと（問1 も問2〜11 も 1 問 20 点、試験要綱の
 * 「問題別配点割合」）までで、設問・解答欄ごとの配点や部分点の付け方は公表されていない
 * （解答例にも配点の欄は無い）。そのため、どの欄も同じ重さと見て、○ を 1 欄、△ を半欄として
 * 1 問の点数を按分する。
 */

/** IPA の試験要綱にある、午後の 1 問の配点（問1 も、問2〜11 から選ぶ 4 問も各 20 点）。 */
export const PM_POINTS_PER_PROBLEM = 20;

/** △（部分点）の欄を、○ の何欄分と数えるか。部分点の付け方は非公表なので、半分と置く。 */
export const PARTIAL_CREDIT = 0.5;

/** 欄 1 つの採点。auto は、選んだ記号・下線から自動で決めたもの（本人は付け直せない）。 */
export type PmSlotGrade = { mark: PmMark | undefined; auto: boolean };

/** 自動で突き合わせられるもの（記号の欄・下線）の、正解の数と全体の数。 */
export type PmAutoCount = { ok: number; total: number };

export type PmGrading = {
  /** 欄の名前 → 採点。 */
  slots: Record<string, PmSlotGrade>;
  total: number;
  ok: number;
  /** △（部分点）の欄の数。 */
  partial: number;
  ng: number;
  /** まだ ○△× の付いていない欄の数。 */
  ungraded: number;
  /** 全部の欄に印が付いたときの、1 問 100 点に換算した点数（○ を 1、△ を半分と数えた割合）。 */
  score?: number;
  /** 同じく、本番の配点（1 問 20 点）に換算した点数。小数第 1 位まで。 */
  points?: number;
  /** 記号の欄の正解数（選んでいない欄も、全体の数には入れる）。 */
  choices: PmAutoCount;
  /** 属性名の下線の正解数（下線を答える欄の全部が母数）。 */
  lines: PmAutoCount;
};

/** 「a と b は順不同」のような補足がある欄か。 */
const isUnordered = (hint: string): boolean => hint.includes("順不同");

/**
 * 設問の中の記号の欄を、選んだ記号で採点する。選んでいない欄は入れない（本人が付ける）。
 *
 * 「a と b は順不同」の欄は、同じ設問の中で補足（hint）が同じ記号の欄を 1 組と見て、
 * 組の解答例のどれかを選んでいれば正解にする。同じ記号を組の二つの欄で選んだときは、
 * 先の欄だけを正解にする（一つの答えを二つ分には数えない）。
 */
export const judgeChoiceSlots = (
  part: PmQuestionPart,
  answers: Record<string, string>,
): Record<string, boolean> => {
  const judged: Record<string, boolean> = {};
  for (const slot of part.slots) {
    const value = answers[slot.key] ?? "";
    if (!slot.choices || value === "") continue;
    if (!isUnordered(slot.hint)) {
      judged[slot.key] = value === slot.answer;
      continue;
    }
    const group = part.slots.filter((other) => other.choices && other.hint === slot.hint);
    const earlier = group.slice(0, group.indexOf(slot));
    judged[slot.key] =
      group.some((other) => other.answer === value) &&
      !earlier.some((other) => answers[other.key] === value);
  }
  return judged;
};

/** 下線も答える欄で、選んだ下線が解答例の下線と合っているか。 */
export const isLineCorrect = (slot: PmAnswerSlot, answers: Record<string, string>): boolean =>
  parseKeyLine(answers[keyLineSlotKey(slot.key)]) === answerKeyLine(slot.answer);

/** 1 問を採点する。answers は書いた答え、marks は本人が付けた印（どちらもその問の分）。 */
export const gradeTranscript = (
  transcript: PmTranscript,
  answers: Record<string, string>,
  marks: Record<string, PmMark>,
): PmGrading => {
  const slots: Record<string, PmSlotGrade> = {};
  const choices: PmAutoCount = { ok: 0, total: 0 };
  const lines: PmAutoCount = { ok: 0, total: 0 };
  for (const part of transcript.parts) {
    const judged = judgeChoiceSlots(part, answers);
    for (const slot of part.slots) {
      const manual: PmSlotGrade = { mark: marks[slot.key], auto: false };
      if (slot.choices) {
        const auto = judged[slot.key];
        choices.total += 1;
        if (auto) choices.ok += 1;
        slots[slot.key] = auto === undefined ? manual : { mark: auto ? "ok" : "ng", auto: true };
        continue;
      }
      if (slot.keyUnderline) {
        const lineOk = isLineCorrect(slot, answers);
        lines.total += 1;
        if (lineOk) lines.ok += 1;
        // 属性名を書いていれば、下線の違いだけで × と決まる。合っていれば属性名は本人が見る。
        const written = (answers[slot.key] ?? "") !== "";
        slots[slot.key] = written && !lineOk ? { mark: "ng", auto: true } : manual;
        continue;
      }
      slots[slot.key] = manual;
    }
  }
  const grades = Object.values(slots);
  const total = grades.length;
  const count = (mark: PmMark) => grades.filter((grade) => grade.mark === mark).length;
  const ok = count("ok");
  const partial = count("partial");
  const ng = count("ng");
  const ungraded = total - ok - partial - ng;
  const base = { slots, total, ok, partial, ng, ungraded, choices, lines };
  if (total === 0 || ungraded > 0) return base;
  const earned = ok + PARTIAL_CREDIT * partial;
  return {
    ...base,
    score: Math.round((100 * earned) / total),
    points: Math.round((10 * PM_POINTS_PER_PROBLEM * earned) / total) / 10,
  };
};

/** × か △ の付いた欄の名前。「× と △ の欄を解き直す」で消す欄。 */
export const retrySlotKeys = (grading: PmGrading): string[] =>
  Object.entries(grading.slots)
    .filter(([, grade]) => grade.mark === "ng" || grade.mark === "partial")
    .map(([key]) => key);
