import type { FlashcardSession } from "../hooks/use-flashcards";
import { AcronymText } from "./acronym-text";

type FlashcardResultProps = {
  session: FlashcardSession;
};

/** 出来に添える一言。元の単語帳と同じ区切りにしてある。 */
const messageOf = (answered: number, percent: number): string => {
  if (answered === 0) return "まずは1枚めくってみよう。";
  if (percent >= 90) return "ほぼ完璧。この分野は仕上がっている。";
  if (percent >= 70) return "あと少し。あやふやな語だけ回し直そう。";
  if (percent >= 40) return "伸びしろが大きい。正式名称を声に出して読むと定着しやすい。";
  return "はじめは誰でもこんなもの。まず10語に絞って繰り返そう。";
};

const ACTION = "cursor-pointer rounded-[10px] px-6 py-[13px] font-bold text-[13.5px]";

export const FlashcardResult = ({ session }: FlashcardResultProps) => {
  const { drawn, answered, okCount, missed } = session;
  const percent = answered === 0 ? 0 : Math.round((okCount / answered) * 100);

  return (
    <div className="flex animate-rise-in flex-col gap-3.5">
      <section className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-8 py-[34px]">
        <span className="font-bold text-[44px] tracking-[-0.01em] tabular-nums">{percent}%</span>
        <span className="text-[12.5px] text-muted tabular-nums">
          回答 {answered} 語 / 出題 {drawn.length} 語
        </span>
        <span className="text-pretty text-[13.5px] text-muted-soft">
          {messageOf(answered, percent)}
        </span>

        <div className="mt-3 grid grid-cols-2 gap-3.5 self-stretch">
          <div className="flex flex-col gap-1 rounded-xl border border-ok-line bg-ok-bg p-[18px] text-center">
            <span className="font-bold text-[10.5px] text-muted-soft tracking-[0.12em]">
              覚えた
            </span>
            <span className="font-bold text-[28px] text-ok tabular-nums">{okCount}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-ng-line bg-ng-bg p-[18px] text-center">
            <span className="font-bold text-[10.5px] text-muted-soft tracking-[0.12em]">
              あやふや
            </span>
            <span className="font-bold text-[28px] text-ng tabular-nums">{missed.length}</span>
          </div>
        </div>
      </section>

      {missed.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-line bg-surface">
          <header className="border-line border-b bg-panel px-6 py-3.5">
            <h3 className="font-bold text-[14px] tracking-[0.01em]">あやふやだった語</h3>
          </header>
          {missed.map((card) => (
            <div
              key={card.id}
              className="flex flex-col gap-1 border-line-softer border-b px-6 py-3.5 last:border-b-0 sm:flex-row sm:gap-5"
            >
              <span className="font-bold text-[13px] text-ink sm:flex-[0_0_120px]">
                {card.entry.abbr}
              </span>
              <span className="text-pretty text-read-sm text-ink-soft leading-[1.7]">
                <AcronymText full={card.entry.full} acronym={card.entry.acronym} />
              </span>
            </div>
          ))}
        </section>
      )}

      <div className="flex flex-wrap gap-2.5">
        {missed.length > 0 && (
          <button
            type="button"
            onClick={session.againMissed}
            className={`${ACTION} bg-accent text-surface hover:bg-accent-hover`}
          >
            あやふやだけもう一周
          </button>
        )}
        <button
          type="button"
          onClick={session.again}
          className={`${ACTION} border border-edge-strong bg-surface font-medium text-ink hover:bg-canvas`}
        >
          同じ札をもう一度
        </button>
        <button
          type="button"
          onClick={session.toSetup}
          className={`${ACTION} border border-edge-strong bg-surface font-medium text-ink hover:bg-canvas`}
        >
          設定に戻る
        </button>
      </div>
    </div>
  );
};
