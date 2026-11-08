/**
 * 主キー・外部キーの下線の書き方と、解答欄で選ぶ下線。
 *
 * 描画（components/pm-reader.tsx）と採点（grading.ts）の両方が使うので、画面から切り離してここに置く。
 */

/** 主キー・外部キーの書き方（`[[主:…]]`・`[[外:…]]`）の印と、その読み方・下線の線種。 */
export const KEY_MARKS = {
  主: { label: "主キー", line: "実線" },
  外: { label: "外部キー", line: "破線" },
} as const;

export type KeyMark = keyof typeof KEY_MARKS;

/** `[[…]]` の中身を、主キー・外部キーの印と属性名に分ける。印が無ければ普通の下線。 */
export const parseUnderline = (inner: string): { key?: KeyMark; text: string } => {
  const match = inner.match(/^(主|外):(.+)$/);
  return match ? { key: match[1] as KeyMark, text: match[2] ?? "" } : { text: inner };
};

/** 解答欄で選ぶ属性名の下線。"" は下線なし。 */
export type KeyLine = "" | KeyMark;

/** 選んだ下線を残すときの欄の名前（「設問1 b（下線）」）。書いた属性名とは別に持つ。 */
export const keyLineSlotKey = (slotKey: string): string => `${slotKey}（下線）`;

/** 残した値を下線として読む。下線なしと読めない値は下線なし。 */
export const parseKeyLine = (value: string | undefined): KeyLine =>
  value === "主" || value === "外" ? value : "";

/** 解答例の下線。解答例全体が `[[主:…]]`・`[[外:…]]` ならその印、印が無ければ下線なし。 */
export const answerKeyLine = (answer: string): KeyLine => {
  const match = answer.match(/^\[\[([^\]]+)\]\]$/);
  return match ? (parseUnderline(match[1] ?? "").key ?? "") : "";
};
