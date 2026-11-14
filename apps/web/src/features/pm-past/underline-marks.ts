/**
 * 本文の下線部（「①…」）と、設問・解説からそれを指す「下線①」を結ぶための読み取り。
 *
 * 設問や解説の「下線①」を押すと、本文のその下線部まで送る（components/pm-reader.tsx）。
 * 描画から切り離してここに置くのは、書き起こし全体に対して「指している下線部が本文にあるか」を
 * テストで確かめるため。
 */

import { parseUnderline } from "./key-line";
import type { PmBlock } from "./types";

/** 下線部の印。原本は丸数字（①〜）で、まれに（ア）のような片仮名。 */
const MARK = "(?:[①-⑳]|（[ア-ン]）)";

/** 下線部の先頭の印。 */
const LEADING_MARK = new RegExp(`^(${MARK})`);

/**
 * 設問・解説の中で下線部を指す言葉（「下線①」「下線部②」「下線（ア）」）。
 * 文字列を split して、指す言葉とそれ以外を交互に並べるのに使うので、全体を 1 つの組にしてある。
 */
export const UNDERLINE_REF = new RegExp(`(下線部?${MARK})`);

/** 代替テキストの中で、図の中の下線部を言葉で書いたところ（「（この一文に下線②）」）。 */
const REF_IN_TEXT = new RegExp(`下線部?(${MARK})`, "g");

const UNDERLINE_MARKUP = /\[\[([^\]]+)\]\]/g;

/** 下線部の文字列の先頭にある印。印で始まらない下線（「適切でないもの」など）は undefined。 */
export const underlineMark = (text: string): string | undefined => text.match(LEADING_MARK)?.[1];

/** 「下線①」「下線部①」から印（①）を取り出す。 */
export const markOfRef = (ref: string): string => ref.replace(/^下線部?/, "");

/** 文字列の中の `[[…]]` のうち、印で始まる下線部の印。主キー・外部キーの下線は数えない。 */
const marksInText = (text: string): string[] =>
  [...text.matchAll(UNDERLINE_MARKUP)].flatMap(([, inner]) => {
    const underline = parseUnderline(inner ?? "");
    const mark = underline.key ? undefined : underlineMark(underline.text);
    return mark ? [mark] : [];
  });

/**
 * 切り出した図の中にある下線部の印。代替テキストに `[[②…]]` と書いたものと、
 * 「（この一文に下線②）」のように言葉で書いたものの両方を読む。
 */
export const imageUnderlineMarks = (alt: string): string[] => [
  ...new Set([
    ...marksInText(alt),
    ...[...alt.matchAll(REF_IN_TEXT)].flatMap(([, mark]) => (mark ? [mark] : [])),
  ]),
];

/** 本文の 1 かたまりのうち、PmText で描く（下線部が下線として出る）文字列。 */
const renderedTexts = (block: PmBlock): string[] => {
  switch (block.kind) {
    case "p":
      return [block.text];
    case "items":
      return block.items.flatMap((item) => (item.sub ? [item.text, item.sub] : [item.text]));
    case "table":
      return [...block.headers, ...block.rows.flat(2)];
    case "code":
      return block.lines;
    case "heading":
    case "image":
      return [];
  }
};

/** 本文にある下線部の印（飛べる先）。図の中の下線部は、その図に飛ぶ。 */
export const underlineMarksOf = (body: PmBlock[]): Set<string> =>
  new Set(
    body.flatMap((block) =>
      block.kind === "image"
        ? imageUnderlineMarks(block.image.alt)
        : renderedTexts(block).flatMap(marksInText),
    ),
  );
