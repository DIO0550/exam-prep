import type { PmChoice } from "./types";

/**
 * 解答群から「全て選べ」の欄（multiple）の答えの書き方。
 *
 * 選んだ記号は、IPA の解答例（「ア，ウ」）と同じく全角の読点「，」でつないだ 1 つの文字列として残す。
 * 他の欄と同じ保存の形（欄の名前 → 文字列）のまま扱えるようにするため。
 */

const SEPARATOR = "，";

/** 「ア，ウ」を記号に分ける。空なら空の配列。 */
export const splitChoiceKeys = (value: string): string[] =>
  value
    .split(SEPARATOR)
    .map((key) => key.trim())
    .filter((key) => key !== "");

/** 選んだ記号を、解答群の順に「，」でつなぐ。解答群に無い記号は落とす。 */
export const joinChoiceKeys = (choices: PmChoice[], keys: Iterable<string>): string => {
  const picked = new Set(keys);
  return choices
    .filter((choice) => picked.has(choice.key))
    .map((choice) => choice.key)
    .join(SEPARATOR);
};

/** 選んだ記号の組が、解答例の組とちょうど同じか（並び順は問わない）。 */
export const sameChoiceKeys = (value: string, answer: string): boolean => {
  const picked = new Set(splitChoiceKeys(value));
  const expected = new Set(splitChoiceKeys(answer));
  return picked.size === expected.size && [...expected].every((key) => picked.has(key));
};
