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

/** 同じ略語で意味が分かれるもの。 */
export type AmbiguousAbbr = {
  abbr: string;
  meanings: { en: string; ja: string; desc: string }[];
  /** 文脈での見分け方。 */
  hint: string;
};
