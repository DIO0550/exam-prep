type ProgressBarProps = {
  /** 解答済みの問題数。 */
  answered: number;
  total: number;
  /** 今見ている問題（0 始まり）。 */
  index: number;
};

export const ProgressBar = ({ answered, total, index }: ProgressBarProps) => {
  return (
    <div className="flex items-center gap-3.5">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#e1e4ea]">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${Math.round((answered / total) * 100)}%` }}
        />
      </div>
      <span className="whitespace-nowrap text-[12px] text-muted-soft tabular-nums">
        {index + 1} / {total}問
      </span>
    </div>
  );
};
