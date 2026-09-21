import type { CardMode } from "../deck";
import { ASK_OF } from "../deck";
import type { Card } from "../types";
import { AcronymText } from "./acronym-text";

type FlashcardCardProps = {
  card: Card;
  mode: CardMode;
  /** 裏（答え）を出しているか。 */
  flipped: boolean;
  onFlip: () => void;
};

const Badge = ({ card }: { card: Card }) => (
  <span className="self-start rounded-full bg-chip px-2.5 py-1 font-bold text-[11px] text-muted">
    <span aria-hidden="true">{card.group.icon}</span> {card.group.title}
  </span>
);

/**
 * 1 枚の札。表（問い）と裏（答え）を重ねて置き、めくると裏返る。
 *
 * 表と裏を同じグリッドのマスに重ねているので、枠の高さは中身が多いほうに合う。
 * 動きを減らす設定では回さずに入れ替える。
 */
export const FlashcardCard = ({ card, mode, flipped, onFlip }: FlashcardCardProps) => {
  const { entry } = card;

  return (
    <button
      type="button"
      onClick={onFlip}
      aria-label={flipped ? "答え" : "問い（押すと答えを見る）"}
      className="group w-full cursor-pointer [perspective:1600px]"
    >
      <div
        className={`grid transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* 表（問い） */}
        <div className="col-start-1 row-start-1 flex min-h-[280px] flex-col gap-5 rounded-2xl border border-line bg-surface px-7 py-[30px] text-left [backface-visibility:hidden]">
          <Badge card={card} />
          <div className="flex flex-1 flex-col justify-center gap-2.5">
            {mode === "正式名称 → 略語" ? (
              <>
                <span className="text-pretty font-bold text-[22px] text-ink leading-[1.5]">
                  {entry.full}
                </span>
                <span className="text-pretty text-read-md text-muted">{entry.ja}</span>
              </>
            ) : (
              <span className="font-bold text-[40px] text-ink tracking-[0.02em]">{entry.abbr}</span>
            )}
          </div>
          <span className="text-read-sm text-muted-soft">{ASK_OF[mode]}</span>
        </div>

        {/* 裏（答え）。裏返した先で正しい向きになるよう、はじめから 180 度回しておく。 */}
        <div className="col-start-1 row-start-1 flex min-h-[280px] flex-col gap-3 rounded-2xl border border-accent bg-surface px-7 py-[30px] text-left [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Badge card={card} />
          <span className="font-bold text-[26px] text-ink tracking-[0.02em]">{entry.abbr}</span>
          <span className="text-pretty font-medium text-read-lg leading-[1.6]">
            <AcronymText full={entry.full} acronym={entry.acronym} />
          </span>
          <span className="text-pretty font-medium text-read-md text-muted">{entry.ja}</span>
          <span className="max-w-[100ch] text-pretty text-read-sm text-ink-soft leading-[1.85]">
            {entry.desc}
          </span>
          {entry.note && (
            <span className="flex flex-wrap items-baseline gap-2 rounded-lg bg-flag-soft px-3 py-2 text-read-sm text-ink-soft leading-[1.8]">
              <span className="font-bold text-[10.5px] text-flag-ink tracking-[0.12em]">
                {entry.note.label}
              </span>
              <span className="min-w-0 flex-1 text-pretty">{entry.note.text}</span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
