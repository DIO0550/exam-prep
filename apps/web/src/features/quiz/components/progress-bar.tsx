type ProgressBarProps = {
  /** 解答済みの問題数。 */
  answered: number;
  /** そのうち正解した数。 */
  correct: number;
  /** 解答済みに対する正答率（0〜100）。 */
  percent: number;
  total: number;
  /** 今見ている問題（0 始まり）。 */
  index: number;
};

/**
 * 進み具合と、いまの正答率。
 *
 * 正答率は解いている回のものだけを出す（母数は今この回で解答済みの数）。
 * 解き終わる前でも手ごたえが分かるように、解くたびに更新する。
 */
export const ProgressBar = ({ answered, correct, percent, total, index }: ProgressBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#e1e4ea]">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${Math.round((answered / total) * 100)}%` }}
        />
      </div>
      <span className="whitespace-nowrap text-[12px] text-muted-soft tabular-nums">
        {index + 1} / {total}問
      </span>
      <span className="whitespace-nowrap rounded-md bg-chip px-2.5 py-1 text-[11.5px] text-muted tabular-nums">
        {answered === 0 ? (
          "正答率 —"
        ) : (
          <>
            正答率 <span className="font-bold text-ink">{percent}%</span>
            <span className="pl-1.5 text-muted-soft">
              （{correct}/{answered}問）
            </span>
          </>
        )}
      </span>
    </div>
  );
};
