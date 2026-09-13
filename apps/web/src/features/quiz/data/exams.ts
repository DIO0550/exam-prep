import type { Exam } from "../types";

/**
 * サイドバーに並べる試験。group の値で見出しにまとめる。1 件目が初期選択。
 *
 * 問題を収録したものだけを載せる。選んでも中身が無い区分を並べると、
 * 押せるのに何も起きない項目になるため。収録したらここへ足す。
 */
export const EXAMS: [Exam, ...Exam[]] = [
  {
    code: "AP",
    name: "応用情報技術者試験",
    sub: "午前 ・ 全80問形式",
    group: "IPA 情報処理技術者試験",
  },
];

/** 見出しの並び順。EXAMS の group と対応する。 */
export const EXAM_GROUPS = ["IPA 情報処理技術者試験"];
