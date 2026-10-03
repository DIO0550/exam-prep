import type { RetryKind } from "../hooks/use-quiz-session";
import { RETRY_LABELS } from "../hooks/use-quiz-session";

type RetryBannerProps = {
  kind: RetryKind;
  /** 解き直している問題の数。 */
  count: number;
  /** 解き直しをやめて、回の全問に戻る。 */
  onExit: () => void;
};

/** 解き直しの最中であることを示す帯。全問を解いていると思い込ませないために出す。 */
export const RetryBanner = ({ kind, count, onExit }: RetryBannerProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/25 bg-accent-soft px-5 py-3">
    <span className="text-[13px] text-accent-deep">
      <span className="font-bold">{RETRY_LABELS[kind]}の解き直し</span>・{count}問
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
