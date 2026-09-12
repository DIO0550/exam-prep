import type { QuizItem } from "../stats";
import { isCorrect } from "../stats";
import { sourceId } from "../types";

type QuestionDotsProps = {
  items: QuizItem[];
  index: number;
  onGoTo: (index: number) => void;
};

/** 問番号のボタン列。解答済みは正誤で、フラグ付きは枠の色で分かる。 */
export const QuestionDots = ({ items, index, onGoTo }: QuestionDotsProps) => {
  const flagCount = items.filter((item) => item.attempt.flagged).length;

  return (
    <div className="flex flex-wrap items-center gap-[7px]">
      {items.map((item, i) => {
        const current = i === index;
        const done = item.attempt.revealed
          ? isCorrect(item)
            ? "border-ok bg-ok-soft text-ok"
            : "border-ng bg-ng-soft text-ng"
          : "border-edge bg-surface text-muted";

        return (
          <button
            key={sourceId(item.question.source)}
            type="button"
            aria-current={current ? "true" : undefined}
            onClick={() => onGoTo(i)}
            className={`size-8 cursor-pointer rounded-lg border-[1.5px] font-bold text-[12px] tabular-nums ${
              current
                ? "border-accent bg-accent text-surface"
                : `${done} ${item.attempt.flagged ? "border-flag" : ""}`
            }`}
          >
            {i + 1}
          </button>
        );
      })}
      <span className="ml-auto text-[11px] text-muted-soft">
        {flagCount ? `フラグ ${flagCount}問` : "選択肢の「–」で除外できます"}
      </span>
    </div>
  );
};
