import type { Summary } from "../stats";
import { scoreTone } from "../tone";
import { MeterRow } from "./meter-row";

type ResultScreenProps = {
  summary: Summary;
  total: number;
  /** 「3分05秒」の形。未計測なら "—"。 */
  elapsed: string;
  onRestart: () => void;
  onGoReview: () => void;
};

/** 合格ライン。IPA の午前は 60% で揃っている。 */
const PASS_LINE = 60;

export const ResultScreen = ({
  summary,
  total,
  elapsed,
  onRestart,
  onGoReview,
}: ResultScreenProps) => {
  const passed = summary.percent >= PASS_LINE;

  return (
    <div className="flex animate-rise-in flex-col gap-[18px]">
      <div className="flex flex-wrap items-center gap-[34px] rounded-2xl border border-line bg-surface px-[30px] py-[34px]">
        <div className="flex flex-col gap-[3px]">
          <span className="font-bold text-[10.5px] text-muted-soft tracking-[0.16em]">SCORE</span>
          <div className={`flex items-baseline gap-[3px] ${passed ? "text-ok" : "text-ng"}`}>
            <span className="font-bold text-[54px] leading-none tracking-[-0.02em] tabular-nums">
              {summary.percent}
            </span>
            <span className="font-bold text-[20px]">%</span>
          </div>
          <span className="text-[13px] text-muted-soft">
            {total}問中 {summary.correct}問正解（合格ラインは{PASS_LINE}%）
          </span>
          <span className="text-[12px] text-muted-soft">所要時間 {elapsed}</span>
        </div>

        <div className="flex min-w-[240px] flex-1 flex-col gap-3.5">
          {summary.fieldStats.map((stat) => (
            <MeterRow
              key={stat.name}
              name={stat.name}
              percent={stat.percent}
              value={stat.label}
              tone={scoreTone(stat.percent)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={onRestart}
          className="cursor-pointer rounded-[9px] bg-accent px-7 py-3.5 font-bold text-[14px] text-surface hover:bg-accent-hover"
        >
          もう一度解く
        </button>
        <button
          type="button"
          onClick={onGoReview}
          className="cursor-pointer rounded-[9px] border border-edge-strong bg-surface px-[22px] py-3.5 font-medium text-[14px] text-ink hover:bg-canvas"
        >
          問題一覧で見直す
        </button>
      </div>
    </div>
  );
};
