/** 到達度・正誤の色分け。Tailwind はクラス名を静的に読むので、表引きで持つ。 */
export type Tone = "ok" | "accent" | "ng";

export const TONE_TEXT: Record<Tone, string> = {
  ok: "text-ok",
  accent: "text-accent",
  ng: "text-ng",
};

export const TONE_BG: Record<Tone, string> = {
  ok: "bg-ok",
  accent: "bg-accent",
  ng: "bg-ng",
};

/** 到達度バーの色。70% 以上で達成、50% 以上で途上、それ未満は要強化。 */
export const masteryTone = (percent: number): Tone =>
  percent >= 70 ? "ok" : percent >= 50 ? "accent" : "ng";

/** 演習結果の分野別バーの色。母数が少ないので、途上とみなす下限を 40% に下げている。 */
export const scoreTone = (percent: number): Tone =>
  percent >= 70 ? "ok" : percent >= 40 ? "accent" : "ng";
