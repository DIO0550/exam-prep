import type { ProgressSummary } from "../progress/summary";
import { statCards } from "../progress/summary";
import { masteryTone } from "../tone";
import { ClearRecordButton } from "./clear-record-button";
import { MeterRow } from "./meter-row";

/** 演習を始めるボタン。押してほしいものを塗り、それ以外は枠だけにする。 */
const PRIMARY_BUTTON =
  "cursor-pointer rounded-[10px] bg-accent px-8 py-[15px] font-bold text-[14.5px] text-surface tracking-[0.02em] hover:bg-accent-hover";
const SECONDARY_BUTTON =
  "cursor-pointer rounded-[10px] border border-edge-strong bg-surface px-6 py-[15px] font-medium text-[14px] text-ink hover:bg-canvas";

type HomeScreenProps = {
  /** 選んでいる回のラベル。どの回を解くのかを、案内文にも出す。 */
  setLabel: string;
  /** 出題数。案内文の「全◯問」に使う。 */
  questionCount: number;
  /** この回の解答済み数。0 なら「開始」、途中なら「再開」を出す。 */
  answered: number;
  summary: ProgressSummary;
  onStart: () => void;
  onRestart: () => void;
  onGoReview: () => void;
  onClearRecord: () => void;
};

export const HomeScreen = ({
  setLabel,
  questionCount,
  answered,
  summary,
  onStart,
  onRestart,
  onGoReview,
  onClearRecord,
}: HomeScreenProps) => {
  const done = answered >= questionCount;
  const inProgress = answered > 0 && !done;

  return (
    <div className="flex animate-rise-in flex-col gap-5">
      <section className="flex flex-col gap-7 rounded-2xl border border-line bg-surface px-8 py-[34px]">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-[11px] text-muted-soft tracking-[0.16em]">TODAY</span>
          <h2 className="font-bold text-[26px] leading-[1.4] tracking-[0.01em]">
            {done
              ? "この回は解き終わりました"
              : inProgress
                ? "続きから再開する"
                : "本日の演習を始める"}
          </h2>
          <p className="max-w-[100ch] text-pretty text-[13.5px] text-muted-soft leading-[1.9]">
            {setLabel}・全{questionCount}
            問・4択単一選択。1問あたりの目安は90秒です。解答すると即座に正誤と解説が表示されます。
            {answered > 0 && `（${questionCount}問中 ${answered}問 解答済み）`}
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3.5">
          {statCards(summary).map((stat) => (
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
          {!done && (
            <button type="button" onClick={onStart} className={PRIMARY_BUTTON}>
              {inProgress ? "演習を再開" : "演習を開始"}
            </button>
          )}
          {answered > 0 && (
            <button
              type="button"
              onClick={onRestart}
              className={done ? PRIMARY_BUTTON : SECONDARY_BUTTON}
            >
              {done ? "もう一度解く" : "最初からやり直す"}
            </button>
          )}
          <button type="button" onClick={onGoReview} className={SECONDARY_BUTTON}>
            問題一覧を見る
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        <h3 className="border-line-soft border-b px-6 py-[18px] font-bold text-[12.5px] tracking-[0.04em]">
          分野別の到達度
        </h3>
        {summary.fields.length === 0 ? (
          <p className="px-6 py-5 text-[12.5px] text-muted-soft leading-[1.9]">
            解答すると、分野ごとの到達度がここに出ます。集計は回をまたいで、
            このブラウザに保存した解答から作ります。
          </p>
        ) : (
          <div className="flex flex-col gap-4 px-6 py-5">
            {summary.fields.map((field) => (
              <MeterRow
                key={field.name}
                name={field.name}
                percent={field.percent}
                value={`${field.correct}/${field.answered}`}
                tone={masteryTone(field.percent)}
              />
            ))}
          </div>
        )}
      </section>

      {summary.hasRecord && (
        <div className="flex justify-end">
          <ClearRecordButton onClear={onClearRecord} />
        </div>
      )}
    </div>
  );
};
