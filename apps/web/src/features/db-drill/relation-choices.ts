import type { DbChoice } from "./types";

/**
 * E-R 図の関連の空欄に当てはめる線の選択肢。本試験では線を書き込ませるので、
 * 「どちらからどちらへ、どの線を引くか」を 4 つから選ぶ形にする。
 * 左右（a・b）は、図の上での並びに合わせて渡す。
 */
export const relationChoices = (a: string, b: string): DbChoice[] => [
  { key: "ア", text: `${a} ― ${b}（線：1 対 1）` },
  { key: "イ", text: `${a} → ${b}（矢印：1 対多、${b} が多）` },
  { key: "ウ", text: `${a} ← ${b}（矢印：多対 1、${a} が多）` },
  { key: "エ", text: `${a} ↔ ${b}（両矢印：多対多）` },
];
