import { HOME_STATS, MASTERY } from "../data/progress";
import { masteryTone } from "../tone";
import { MeterRow } from "./meter-row";

type HomeScreenProps = {
  /** 出題数。案内文の「全◯問」に使う。 */
  questionCount: number;
  onStart: () => void;
  onGoReview: () => void;
};

export const HomeScreen = ({ questionCount, onStart, onGoReview }: HomeScreenProps) => {
  return (
    <div className="flex animate-rise-in flex-col gap-5">
      <section className="flex flex-col gap-7 rounded-2xl border border-line bg-surface px-8 py-[34px]">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-[11px] text-muted-soft tracking-[0.16em]">TODAY</span>
          <h2 className="font-bold text-[26px] leading-[1.4] tracking-[0.01em]">
            本日の演習を始める
          </h2>
          <p className="max-w-[46ch] text-pretty text-[13.5px] text-muted-soft leading-[1.9]">
            全{questionCount}
            問・4択単一選択。1問あたりの目安は90秒です。解答すると即座に正誤と解説が表示されます。
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3.5">
          {HOME_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-[5px] rounded-xl border border-line p-[18px]"
            >
              <span className="font-bold text-[10.5px] text-muted-soft tracking-[0.12em]">
                {stat.label}
              </span>
              <span className="font-bold text-[28px] tracking-[-0.01em] tabular-nums">
                {stat.value}
                <span className="text-[15px]">{stat.unit}</span>
              </span>
              <span className="text-[11px] text-muted-soft">{stat.note}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onStart}
            className="cursor-pointer rounded-[10px] bg-accent px-8 py-[15px] font-bold text-[14.5px] text-surface tracking-[0.02em] hover:bg-accent-hover"
          >
            演習を開始
          </button>
          <button
            type="button"
            onClick={onGoReview}
            className="cursor-pointer rounded-[10px] border border-edge-strong bg-surface px-6 py-[15px] font-medium text-[14px] text-ink hover:bg-canvas"
          >
            問題一覧を見る
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        <h3 className="border-line-soft border-b px-6 py-[18px] font-bold text-[12.5px] tracking-[0.04em]">
          分野別の到達度
        </h3>
        <div className="flex flex-col gap-4 px-6 py-5">
          {MASTERY.map((item) => (
            <MeterRow
              key={item.name}
              name={item.name}
              percent={item.percent}
              tone={masteryTone(item.percent)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
