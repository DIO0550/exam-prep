import type { Verdict } from "../hooks/use-flashcards";
import type { Card } from "../types";

type CardDotsProps = {
  drawn: Card[];
  /** 札ごとの手ごたえ。付いていない札はまだめくっていない。 */
  verdicts: Record<string, Verdict>;
  index: number;
  onGoTo: (index: number) => void;
};

/**
 * 札番号のボタン列。演習の問番号ボタン（QuestionDots）と同じ役割。
 *
 * 「何枚目を見ているか」と「どこを覚えてどこがあやふやか」を、
 * めくり直さずに一目で分かるようにする。押せばその札へ直接移れる。
 */
export const CardDots = ({ drawn, verdicts, index, onGoTo }: CardDotsProps) => {
  const ngCount = drawn.filter((card) => verdicts[card.id] === "ng").length;

  return (
    <div className="flex flex-wrap items-center gap-[7px]">
      {drawn.map((card, i) => {
        const current = i === index;
        const verdict = verdicts[card.id];
        const done =
          verdict === "ok"
            ? "border-ok bg-ok-soft text-ok"
            : verdict === "ng"
              ? "border-ng bg-ng-soft text-ng"
              : "border-edge bg-surface text-muted";

        return (
          <button
            key={card.id}
            type="button"
            aria-current={current ? "true" : undefined}
            aria-label={`${i + 1}枚目 ${card.entry.abbr}`}
            onClick={() => onGoTo(i)}
            className={`size-8 cursor-pointer rounded-lg border-[1.5px] font-bold text-[12px] tabular-nums ${
              current ? "border-accent bg-accent text-surface" : done
            }`}
          >
            {i + 1}
          </button>
        );
      })}
      <span className="ml-auto text-[11px] text-muted-soft">
        {ngCount ? `あやふや ${ngCount}枚` : "番号を押すとその札へ移ります"}
      </span>
    </div>
  );
};
