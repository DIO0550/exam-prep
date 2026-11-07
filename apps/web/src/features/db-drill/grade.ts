import type { DbBlank } from "./types";

/**
 * 書いた答えを比べるための形にそろえる。
 *
 * - 全角・半角の違い（「ＧＲＯＵＰ　ＢＹ」「，」）は NFKC でそろえる
 * - SQL のキーワードは大文字・小文字を区別しないので、大文字にそろえる
 * - 空白の数は問わない。記号（括弧・カンマ・ピリオド・比較演算子・*）の前後の空白は消す
 * - 末尾のセミコロンは問わない
 */
export const normalizeAnswer = (value: string): string =>
  value
    .normalize("NFKC")
    .toUpperCase()
    .replace(/;+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s*([(),.=<>*])\s*/g, "$1");

/** 欄に書いた（選んだ）答えが正解か。空の欄は不正解。 */
export const isCorrect = (blank: DbBlank, value: string): boolean => {
  if (value.trim() === "") return false;
  if (blank.choices) return value === blank.answer;
  const given = normalizeAnswer(value);
  return [blank.answer, ...(blank.accepts ?? [])].some(
    (accepted) => normalizeAnswer(accepted) === given,
  );
};

/** 1 問分の採点。正解した欄の数を返す。 */
export const countCorrect = (blanks: DbBlank[], answers: Record<string, string>): number =>
  blanks.filter((blank) => isCorrect(blank, answers[blank.key] ?? "")).length;
