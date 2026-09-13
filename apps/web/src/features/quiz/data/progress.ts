import type { Mastery } from "../types";

/**
 * 学習記録のサンプル値。保存先（localStorage か外部か）を決めるまでの置き石で、
 * 実データに差し替えるときはこのファイルごと入れ替える。
 */

/** ヘッダー右端に出す連続学習日数。 */
export const STREAK_LABEL = "12日連続";

/** 学習ホームに並べる 3 枚のカード。 */
export const HOME_STATS = [
  { label: "累計正答率", value: "68", unit: "%", note: "直近200問" },
  { label: "連続学習", value: "12", unit: "日", note: "最長記録 21日" },
  { label: "苦手登録", value: "23", unit: "問", note: "うち未再挑戦 9問" },
];

/** 学習ホームの「分野別の到達度」。 */
export const MASTERY: Mastery[] = [
  { name: "セキュリティ", percent: 82 },
  { name: "ネットワーク", percent: 64 },
  { name: "データベース", percent: 71 },
  { name: "アルゴリズム", percent: 48 },
  { name: "マネジメント", percent: 55 },
];
