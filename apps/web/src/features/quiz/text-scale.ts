/**
 * 読む文字（問題文・選択肢・解説）の大きさ。
 *
 * ここが持つのは倍率だけで、実際の px は globals.css の `text-read-*` が
 * `calc(基準 × var(--text-scale))` で出す。基準の px をコンポーネント側に散らすと、
 * 設定で大きくしたときに一部だけ取り残されるため、段階は CSS に 1 か所で置いている。
 */

export const TEXT_SCALES = ["standard", "large", "xlarge"] as const;
export type TextScale = (typeof TEXT_SCALES)[number];

export const DEFAULT_TEXT_SCALE: TextScale = "standard";

/** ヘッダーの切り替えに出す名前。 */
export const TEXT_SCALE_LABELS: Record<TextScale, string> = {
  standard: "標準",
  large: "大",
  xlarge: "特大",
};

/**
 * `--text-scale` に渡す倍率。
 *
 * 1.15 / 1.3 と粗めに刻んでいるのは、切り替えたときに変わったと分かる差が要るため
 * （数 % だと押しても効いていないように見える）。上限は、解説画面の 1 行の文字数が
 * 読みにくいほど減らない範囲で決めている。
 */
export const TEXT_SCALE_RATIO: Record<TextScale, number> = {
  standard: 1,
  large: 1.15,
  xlarge: 1.3,
};

export const isTextScale = (value: unknown): value is TextScale =>
  typeof value === "string" && (TEXT_SCALES as readonly string[]).includes(value);
