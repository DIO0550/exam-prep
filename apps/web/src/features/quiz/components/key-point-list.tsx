import type { Tone } from "../tone";
import { TONE_TEXT } from "../tone";

type KeyPointListProps = {
  points: string[];
  /** 行頭 ▸ の色。 */
  tone: Tone;
};

export const KeyPointList = ({ points, tone }: KeyPointListProps) => {
  return (
    <div className="flex max-w-[116ch] flex-col gap-2">
      {points.map((point) => (
        <div key={point} className="flex items-start gap-2.5">
          <span
            aria-hidden="true"
            className={`flex-none pt-px font-bold text-[13px] ${TONE_TEXT[tone]}`}
          >
            ▸
          </span>
          <span className="flex-1 text-pretty text-read-md text-ink-soft leading-[1.85]">
            {point}
          </span>
        </div>
      ))}
    </div>
  );
};
