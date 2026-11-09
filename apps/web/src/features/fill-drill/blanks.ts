import type { TextBlock } from "./types";

const BLANK = /\{\{([^}]+)\}\}/g;

/** 文字列に出てくる空欄の名前を、出てくる順に集める。 */
export const blanksInText = (text: string): string[] =>
  [...text.matchAll(BLANK)].map((match) => match[1] ?? "");

/** 段落・表・等幅の行の中の文字列を、読む順に並べる（空欄の順を確かめるため）。 */
export const textsOf = (block: TextBlock): string[] => {
  switch (block.kind) {
    case "p":
      return [block.text];
    case "code":
      return block.lines;
    case "table":
      return block.rows.flat();
  }
};
