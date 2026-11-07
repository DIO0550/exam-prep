/**
 * 応用情報 午後 問6（データベース）向けの、SQL 文と表の穴埋めドリルの形。
 *
 * 本文の文字列では、空欄を `{{a}}` で書く（描画側が枠に直す）。空欄の名前は、その問の
 * 解答欄（DbBlank の key）と同じにする。
 */

/** 関係スキーマの列 1 つ。主キーは実線の下線、外部キーは破線の下線で描く。 */
export type DbColumn = {
  /** 列名。空欄にする列は `{{a}}` と書く。 */
  name: string;
  /**
   * pk … 主キー（を構成する列）。fk … 外部キー。
   * 本試験の約束どおり、主キーの一部でもある外部キーは pk にして破線は付けない。
   */
  key?: "pk" | "fk";
};

/** 関係スキーマ 1 つ（「社員（社員番号，氏名，…）」の 1 行）。 */
export type DbSchema = { name: string; columns: DbColumn[] };

/**
 * E-R 図のエンティティ 1 つ。格子（列・行）の位置に置き、名前の下に属性を縦に並べる。
 * 名前や属性を空欄にするときは、文字列全体を `{{a}}` にする（文字と空欄を混ぜては書けない）。
 */
export type DbEntity = {
  /** 関連から指すための名前。 */
  id: string;
  name: string;
  /** 格子の列と行（0 から）。 */
  col: number;
  row: number;
  attrs: DbColumn[];
};

/**
 * E-R 図の関連 1 つ（本試験の書き方）。
 * - "1:1" … 線
 * - "1:N" … from が 1、to が多。to の側に矢印
 * - "N:M" … 両端に矢印
 * blank を付けると線を引かず、2 つのエンティティの間に空欄の枠を置く（線を書き込ませる設問）。
 */
export type DbRelation =
  | { from: string; to: string; kind: "1:1" | "1:N" | "N:M" }
  | { from: string; to: string; blank: string };

/** 本文の 1 かたまり。 */
export type DbBlock =
  /** E-R 図。下に関連の線と下線の凡例を付ける。 */
  | { kind: "er"; caption: string; entities: DbEntity[]; relations: DbRelation[] }
  /** 段落。 */
  | { kind: "p"; text: string }
  /** 関係スキーマの並び（図の「関係スキーマ」）。下に主キー・外部キーの凡例を付ける。 */
  | { kind: "schema"; caption: string; schemas: DbSchema[] }
  /** 表のデータ（行の例や、SQL の実行結果）。セルの中でも空欄が使える。 */
  | { kind: "table"; caption: string; headers: string[]; rows: string[][] }
  /** SQL 文。1 行ずつ持ち、等幅で行頭の空白も残して組む。 */
  | { kind: "code"; caption: string; lines: string[] };

/** 選ぶ欄の選択肢 1 つ。 */
export type DbChoice = { key: string; text: string };

/** 空欄 1 つ。選択肢があれば選ぶ欄、無ければ書く欄にする。 */
export type DbBlank = {
  /** 空欄の名前（本文の `{{a}}` の a）。 */
  key: string;
  /** 答え方の補足（「SQL のキーワード」「列名」など）。 */
  hint: string;
  choices?: DbChoice[];
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

/** ドリルの分野。一覧の絞り込みに使う。 */
export type DbTopic =
  | "E-R 図"
  | "表の設計"
  | "SELECT と結合"
  | "集約と副問合せ"
  | "更新と制約"
  | "実行結果"
  | "関係代数"
  | "トランザクションと障害回復"
  | "DB の方式と応用";

/** ドリル 1 問。 */
export type DbDrill = {
  /** 問題 ID（db-drill-01 など）。書いた答えと記録のキーに使う。 */
  id: string;
  topic: DbTopic;
  title: string;
  body: DbBlock[];
  /** 空欄。本文に出てくる順に並べる。 */
  blanks: DbBlank[];
  /** 答え合わせの後に出す、この問で押さえたいこと。 */
  points: string[];
};
