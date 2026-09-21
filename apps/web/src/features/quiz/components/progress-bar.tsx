import type { ReactNode } from "react";

type ProgressBarProps = {
  /** 進んだ分。帯を塗る幅の分子になる（演習なら解答済み、単語帳ならめくり終えた枚数）。 */
  done: number;
  total: number;
  /** 今見ている位置（0 始まり）。 */
  index: number;
  /** 数に添える単位。「問」「枚」。 */
  unit: string;
  /** 右のチップに出す成績。中身は画面ごとに違うので受け取る。 */
  stat?: ReactNode;
};

/**
 * 進み具合と、いまの成績。
 *
 * 演習と単語帳で同じ形を出す。「今どこにいるか」は画面が変わるたびに探す情報なので、
 * 置き場所と見た目が違うと、そのつど読み直すことになるため。
 *
 * 成績の中身（演習は正答率、単語帳は覚えた／あやふや）だけは画面ごとに違うので、
 * チップの枠だけここが持ち、中身は呼ぶ側から渡す。
 */
export const ProgressBar = ({ done, total, index, unit, stat }: ProgressBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#e1e4ea]">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${total === 0 ? 0 : Math.round((done / total) * 100)}%` }}
        />
      </div>
      <span className="whitespace-nowrap text-[12px] text-muted-soft tabular-nums">
        {index + 1} / {total}
        {unit}
      </span>
      {stat !== undefined && (
        <span className="whitespace-nowrap rounded-md bg-chip px-2.5 py-1 text-[11.5px] text-muted tabular-nums">
          {stat}
        </span>
      )}
    </div>
  );
};
