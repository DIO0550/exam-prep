import { choiceKey } from "../types";

type KeyHintProps = {
  /** 選択肢の数。0 なら選択のキーは出さない（解説画面）。 */
  choiceCount: number;
  /** Enter で何をするか。 */
  enterLabel: string;
};

/**
 * 演習中に使えるキーの一覧。キーボードの無い端末では使えないので、指で触る端末では出さない。
 */
export const KeyHint = ({ choiceCount, enterLabel }: KeyHintProps) => {
  const parts = [
    choiceCount > 0 &&
      `1〜${Math.min(choiceCount, 9)} ${choiceKey(0)}〜${choiceKey(Math.min(choiceCount, 9) - 1)}を選ぶ`,
    `Enter ${enterLabel}`,
    "← → 前後の問題",
  ].filter(Boolean);

  return (
    <p className="text-[11px] text-muted-soft leading-[1.8] pointer-coarse:hidden">
      キー操作：{parts.join("・")}
    </p>
  );
};
