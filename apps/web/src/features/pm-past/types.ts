import type { QuestionImage } from "@/features/quiz/types";

/**
 * 書き起こした午後の過去問題の形。
 *
 * 本文の文字列では、原本の空欄と下線を次の書き方で表す（描画側が枠と下線に直す）。
 * - `{{a}}` … 空欄 a（原本の四角い枠）
 * - `[[…]]` … 下線を引いた部分（「下線①」など、設問から指すところ）
 */

/** 本文の 1 かたまり。 */
export type PmBlock =
  /** 〔〕で囲んだ小見出し。〔〕は描画側が付ける。 */
  | { kind: "heading"; text: string }
  /** 段落。字下げは描画側で付ける。 */
  | { kind: "p"; text: string }
  /**
   * 見出し付きの項目の並び（「対策1：…」「B部長：…」「(1) …」など）。
   * 見出しを左に揃え、本文をその右に折り返す。
   */
  | { kind: "items"; items: { label: string; text: string; sub?: string }[] }
  /**
   * 原本のページから切り出した図。図の中に空欄があるときは、代替テキストにも `{{a}}` と書く
   * （描画側が「空欄a」に直す）。
   */
  | { kind: "image"; image: QuestionImage }
  /**
   * SQL 文などのコード。1 行ずつ持ち、等幅で行頭の空白も残して組む。図番号の見出しは下に付ける。
   * 行の中でも空欄・下線の書き方が使える。
   */
  | { kind: "code"; caption: string; lines: string[] }
  /**
   * 表。原本の表は HTML で組む（線画ではないので、切り出すより読みやすい）。
   * セルの中でも空欄・下線の書き方が使える。結合セルは同じ値を繰り返して持つ。
   */
  | { kind: "table"; caption: string; headers: string[]; rows: string[][] };

/** 解答群の 1 つ。 */
export type PmChoice = { key: string; text: string };

/**
 * 答える欄 1 つ分。設問の中の空欄 1 つ、または (1)(2) の 1 つに当たる。
 */
export type PmAnswerSlot = {
  /** 欄の名前。画面と保存のキーに使う。例: "設問1 a"、"設問3 (2)"。 */
  key: string;
  /** 答え方の補足（「記号」「5字以内」など）。入力欄の脇に出す。 */
  hint: string;
  /** 解答群から選ぶ欄なら、その解答群。 */
  choices?: PmChoice[];
  /** IPA の解答例（解答の要点）。解答例に下線があるときは `[[…]]` で書く。 */
  answer: string;
  /** 本サイトで書いた解説の要点（1〜2 文）。 */
  explain: string;
  /** 答えの根拠になる本文の箇所。本文からそのまま引く。 */
  clues: string[];
  /** 答えまでの考え方。手順の順に並べる。 */
  steps: string[];
  /** 解答群の選択肢ごとの判定（選ぶ欄で、紛らわしい選択肢があるとき）。 */
  choiceNotes?: { key: string; note: string }[];
  /** 記述で外せない要素（採点で見られると考えられるところ）。 */
  points?: string[];
  /** 間違えやすいところ。 */
  pitfalls?: string[];
  /** この欄に関わる、押さえておきたい知識。 */
  knowledge?: string[];
};

/** 設問 1 つ。設問の文と、それに属する欄を持つ。 */
export type PmQuestionPart = {
  /** 「設問1」など。 */
  label: string;
  /** 設問の文（原本のまま）。(1)(2) に分かれるものは items に持つ。 */
  text: string;
  /** (1)(2) … に分かれた小問。 */
  items?: { label: string; text: string; choices?: PmChoice[] }[];
  /** 設問の文の下に出す解答群。小問ごとの解答群は欄（slot）の choices に持つ。 */
  choices?: PmChoice[];
  /** 解答群の用語の説明。解答例を見たときに、その設問の欄の後ろに出す。 */
  glossary?: { key: string; note: string }[];
  slots: PmAnswerSlot[];
};

/** 書き起こした 1 問。 */
export type PmTranscript = {
  /** 問題 ID（ap-r07-aki-pm-01 など）。一覧の記録と同じキー。 */
  id: string;
  /** 問題文の 1 行目（「…に関する次の記述を読んで，設問に答えよ。」）。 */
  lead: string;
  body: PmBlock[];
  parts: PmQuestionPart[];
  /** IPA の解答例にある出題趣旨。 */
  intent: string;
  /** 本サイトで書いた、問題全体の解説（読みどころ）。 */
  overview: string;
  /** 問題全体の解き方（読む順・時間の使い方など）。 */
  approach: string[];
};
