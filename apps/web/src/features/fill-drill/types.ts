/**
 * 空欄補充（穴埋め）ドリルの共通の形。応用情報 午後の SQL・表（db-drill/）と
 * ネットワーク（nw-drill/）のドリルが、この形の上にそれぞれの図（E-R 図・構成図）を足して使う。
 *
 * 本文の文字列では、空欄を `{{a}}` で書く（描画側が枠に直す）。空欄の名前は、その問の
 * 解答欄（FillBlank の key）と同じにする。
 */

/** 選ぶ欄の選択肢 1 つ。 */
export type FillChoice = { key: string; text: string };

/** 空欄 1 つ。選択肢があれば選ぶ欄、無ければ書く欄にする。 */
export type FillBlank = {
  /** 空欄の名前（本文の `{{a}}` の a）。 */
  key: string;
  /** 答え方の補足（「SQL のキーワード」「IP アドレス」など）。 */
  hint: string;
  choices?: FillChoice[];
  /** 正解。選ぶ欄は選択肢の記号、書く欄は答えの書き方の代表。 */
  answer: string;
  /**
   * 書く欄で、answer のほかに正解にする書き方（「LEFT JOIN」と「LEFT OUTER JOIN」など）。
   * 大文字・小文字、全角・半角、空白の違いは採点側で吸収するので、ここには書かない。
   */
  accepts?: string[];
  /** 解説（なぜその答えになるか）。 */
  explain: string;
};

/** どのドリルでも使う本文のかたまり。 */
export type TextBlock =
  /** 段落。 */
  | { kind: "p"; text: string }
  /** 表（行の例・経路表・設定・実行結果など）。セルの中でも空欄が使える。 */
  | { kind: "table"; caption: string; headers: string[]; rows: string[][] }
  /** SQL 文・設定・コマンドの出力。1 行ずつ持ち、等幅で行頭の空白も残して組む。 */
  | { kind: "code"; caption: string; lines: string[] };

/** ドリル 1 問。Block はドリルごとの本文のかたまり（TextBlock に図を足したもの）。 */
export type FillDrill<Topic extends string, Block> = {
  /** 問題 ID（db-drill-01 など）。書いた答えと記録のキーに使う。 */
  id: string;
  topic: Topic;
  title: string;
  body: Block[];
  /** 空欄。本文に出てくる順に並べる。 */
  blanks: FillBlank[];
  /** 答え合わせの後に出す、この問で押さえたいこと。 */
  points: string[];
};

/** 答え合わせの後、空欄ごとの正誤。答え合わせ前は undefined。 */
export type Marks = Record<string, boolean> | undefined;
