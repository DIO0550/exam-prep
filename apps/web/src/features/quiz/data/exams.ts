import type { Exam } from "../types";

/**
 * 画面の見出しに出す試験。
 *
 * 収録しているのが応用情報だけなので 1 件しか持たない。他区分を収録して
 * 選ばせるようになったら、ここを配列に戻して切り替えの UI を足す。
 */
export const EXAM: Exam = {
  code: "AP",
  name: "応用情報技術者試験",
  sub: "午前 ・ 全80問形式",
};
