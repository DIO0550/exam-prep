import type { BarTone } from "../types";

/**
 * 図の中で塗り分けに使う色。意味は持たず、隣と見分けるためだけのもの。
 * タイムチャートの帯と、層構造図の段で共有する。
 */
export const BAR_TONE: Record<BarTone, string> = {
  1: "border-bar-1-line bg-bar-1 text-bar-1-ink",
  2: "border-bar-2-line bg-bar-2 text-bar-2-ink",
  3: "border-bar-3-line bg-bar-3 text-bar-3-ink",
  4: "border-bar-4-line bg-bar-4 text-bar-4-ink",
  5: "border-bar-5-line bg-bar-5 text-bar-5-ink",
};

/** 色を指定しなかったものに順番に振る色。 */
export const toneOf = (tone: BarTone | undefined, index: number): BarTone =>
  tone ?? (((index % 5) + 1) as BarTone);
