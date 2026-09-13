import type { Tone } from "../tone";
import { TONE_BG } from "../tone";

type MeterRowProps = {
  name: string;
  /** 0〜100。 */
  percent: number;
  /** 右端に出す値。省略すると percent をそのまま % で出す。 */
  value?: string;
  tone: Tone;
};

export const MeterRow = ({ name, percent, value, tone }: MeterRowProps) => {
  return (
    <div className="flex items-center gap-3.5">
      <span className="flex-[0_0_130px] truncate text-[12.5px] text-ink">{name}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-track">
        <div className={`h-full rounded-full ${TONE_BG[tone]}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="flex-[0_0_46px] text-right text-[12px] text-muted-soft tabular-nums">
        {value ?? `${percent}%`}
      </span>
    </div>
  );
};
