import type { FocusKind } from "../hooks/use-quiz-session";
import { FOCUS_LABELS } from "../hooks/use-quiz-session";

type RetryBannerProps = {
  kind: FocusKind;
  /** 出している問題の数。 */
  count: number;
  /** 解き直し・ランダム出題をやめて、回の全問に戻る。 */
  onExit: () => void;
};

/** 解き直し・ランダム出題の最中であることを示す帯。全問を解いていると思い込ませないために出す。 */
export const RetryBanner = ({ kind, count, onExit }: RetryBannerProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/25 bg-accent-soft px-5 py-3">
    <span className="text-[13px] text-accent-deep">
      <span className="font-bold">{FOCUS_LABELS[kind]}</span>・{count}問
    </span>
    <button
      type="button"
      onClick={onExit}
      className="cursor-pointer font-bold text-[12.5px] text-accent hover:text-accent-hover"
    >
      回の全問に戻る
    </button>
  </div>
);
