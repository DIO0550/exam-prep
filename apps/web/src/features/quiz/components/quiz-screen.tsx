import type { QuizItem } from "../stats";
import { isCorrect } from "../stats";
import { choiceKey } from "../types";
import { ChoiceList } from "./choice-list";
import { ChoiceNotes } from "./choice-notes";
import { FigureBlock } from "./figure-block";
import { KeyPointList } from "./key-point-list";
import { MarkButtons } from "./mark-buttons";
import { QuestionDots } from "./question-dots";

type QuizScreenProps = {
  /** 演習全体。下部の問番号ボタンに使う。 */
  items: QuizItem[];
  item: QuizItem;
  /** 通し番号（0 始まり）。ラベルの「問 03」に使う。 */
  index: number;
  isLast: boolean;
  /** 解説を同じ画面に出すか。別画面のときはここには出さない。 */
  showFeedback: boolean;
  onPick: (index: number) => void;
  onToggleExclude: (index: number) => void;
  onToggleFlag: () => void;
  onToggleWeak: () => void;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
};

export const QuizScreen = ({
  items,
  item,
  index,
  isLast,
  showFeedback,
  onPick,
  onToggleExclude,
  onToggleFlag,
  onToggleWeak,
  onPrev,
  onNext,
  onGoTo,
}: QuizScreenProps) => {
  const { question, attempt } = item;
  const correct = isCorrect(item);
  const tone = correct ? "ok" : "ng";

  return (
    <div className="flex animate-rise-in flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(22,24,29,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-line-soft border-b px-[26px] py-4">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h2 className="whitespace-nowrap font-bold text-[12px] text-accent tracking-[0.06em]">
              問 {String(index + 1).padStart(2, "0")}
            </h2>
            <span className="truncate rounded-[5px] bg-canvas px-2.5 py-[5px] text-[11px] text-muted-soft">
              {question.field}
            </span>
            <span className="whitespace-nowrap text-[11px] text-muted-soft">{question.year}</span>
          </div>
          <MarkButtons
            size="sm"
            flagged={attempt.flagged}
            weak={attempt.weak}
            onToggleFlag={onToggleFlag}
            onToggleWeak={onToggleWeak}
          />
        </div>

        <div className="px-[26px] pt-[30px] pb-1.5">
          <p className="max-w-[62ch] text-pretty font-medium text-[17px] leading-[1.9] tracking-[0.01em]">
            {question.text}
          </p>
        </div>

        <ChoiceList item={item} onPick={onPick} onToggleExclude={onToggleExclude} />

        {attempt.revealed && showFeedback && (
          <div
            className={`animate-rise-in border-line-soft border-t px-[26px] py-6 ${
              correct ? "bg-ok-bg" : "bg-ng-bg"
            }`}
          >
            <div className="mb-3.5 flex flex-wrap items-baseline gap-3">
              <span className={`font-bold text-[16px] ${correct ? "text-ok" : "text-ng"}`}>
                {correct ? "正解" : "不正解"}
              </span>
              <span className="text-[13px] text-muted-soft">
                正解：{choiceKey(question.answer)}
              </span>
              <span className="ml-auto text-[11.5px] text-muted-soft">
                全体正答率 {question.rate}
              </span>
            </div>

            <div className="mb-[22px]">
              <h3 className="mb-2.5 font-bold text-[11px] text-muted-soft tracking-[0.14em]">
                ポイント
              </h3>
              <p className="mb-3.5 max-w-[74ch] text-pretty text-[14px] text-ink-soft leading-[1.95]">
                {question.explain}
              </p>
              <KeyPointList points={question.points} tone={tone} />
            </div>

            <div className="mb-[22px] max-w-[820px] rounded-xl border border-line bg-surface px-5 pt-5 pb-[18px]">
              <FigureBlock figure={question.figure} variant="inline" />
            </div>

            <div className={`border-t pt-[18px] ${correct ? "border-ok-line" : "border-ng-line"}`}>
              <h3 className="mb-3.5 font-bold text-[11px] text-muted-soft tracking-[0.14em]">
                それぞれの選択肢の意味
              </h3>
              <ChoiceNotes question={question} picked={attempt.picked} variant="inline" />
              <div className="text-[11.5px] text-muted-soft">出典：{question.source}</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-line-soft border-t px-[26px] py-4">
          <button
            type="button"
            onClick={onPrev}
            className="cursor-pointer rounded-[9px] border border-edge-strong bg-surface px-[18px] py-3 font-medium text-[13px] text-muted-soft hover:bg-canvas"
          >
            前の問題
          </button>
          <button
            type="button"
            disabled={!attempt.revealed}
            onClick={onNext}
            className={`rounded-[9px] px-7 py-3.5 font-bold text-[14px] text-surface tracking-[0.02em] ${
              attempt.revealed
                ? "cursor-pointer bg-accent hover:bg-accent-hover"
                : "cursor-not-allowed bg-disabled"
            }`}
          >
            {isLast ? "結果を見る" : "次の問題へ"}
          </button>
        </div>
      </div>

      <QuestionDots items={items} index={index} onGoTo={onGoTo} />
    </div>
  );
};
