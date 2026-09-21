/** 語に添える一言（「注意」「混同」など）。原本の note を持ってきたもの。 */
export type AbbrNote = {
  label: string;
  text: string;
};

export type AbbrEntry = {
  /** 略語そのもの。"CPU" など。 */
  abbr: string;
  /** 正式名称のスペルアウト。"Central Processing Unit" など。 */
  full: string;
  /** full のうち、略語の 1 文字になっている位置。画面ではここだけ色を変える。 */
  acronym: number[];
  /** 日本語での呼び名。 */
  ja: string;
  desc: string;
  note?: AbbrNote;
};

/** 分類ひとまとまり。原本の section に当たる。 */
export type AbbrGroup = {
  id: string;
  icon: string;
  title: string;
  /** テクノロジ系 / マネジメント系 / ストラテジ系 / 共通。 */
  field: string;
  entries: AbbrEntry[];
};

/** 1 枚の札。どの分類の語かを持ったまま配るので、札から分類の名前を出せる。 */
export type Card = {
  /** 札を見分ける ID。分類の中で略語は重複しないので、この 2 つで足りる。 */
  id: string;
  entry: AbbrEntry;
  group: AbbrGroup;
};

/** 左のパネルに並べる単語帳。 */
export type VocabDeck = {
  id: string;
  name: string;
  /** 一覧に添える短い説明。 */
  sub: string;
  groups: AbbrGroup[];
};
