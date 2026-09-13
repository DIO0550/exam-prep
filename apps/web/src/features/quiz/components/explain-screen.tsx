import { isShuffled, positionOf, SHUFFLED_NOTE } from "../choice-order";
import type { QuizItem } from "../stats";
import { isCorrect } from "../stats";
import { choiceKey, formatSource } from "../types";
import { ChoiceNotes } from "./choice-notes";
import { FigureBlock } from "./figure-block";
import { KeyPointList } from "./key-point-list";
import { MarkButtons } from "./mark-buttons";
import { StemBlock } from "./question-figure";

type ExplainScreenProps = {
  item: QuizItem;
  /** 選択肢を出す順。値は原本での添字。 */
  order: number[];
  index: number;
  isLast: boolean;
  onToggleFlag: () => void;
  onToggleWeak: () => void;
  onNext: () => void;
};

/** 解説表示を「別画面」にしているときに、解答後へ挟まる画面。 */
export const ExplainScreen = ({
  item,
  order,
  index,
  isLast,
  onToggleFlag,
  onToggleWeak,
  onNext,
}: ExplainScreenProps) => {
  const { question, attempt } = item;
  const correct = isCorrect(item);
  const shuffled = isShuffled(order);
  const pickedLabel =
    attempt.picked === null ? "未解答" : choiceKey(positionOf(order, attempt.picked));

  return (
    <div className="flex animate-rise-in flex-col gap-4">
      <div
        className={`flex flex-col gap-1.5 rounded-2xl border-[1.5px] px-[26px] py-7 ${
          correct ? "border-ok bg-ok-bg" : "border-ng bg-ng-bg"
        }`}
      >
        <h2
          className={`font-bold text-[22px] tracking-[0.02em] ${correct ? "text-ok" : "text-ng"}`}
        >
          {correct ? "正解" : "不正解"}
        </h2>
        <span className="text-[13.5px] text-ink-soft">
          あなたの解答：{pickedLabel} ／ 正解：{choiceKey(positionOf(order, question.answer))}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="border-line-soft border-b px-[26px] py-[22px]">
          <div className="mb-2.5 font-bold text-[11px] text-muted-soft tracking-[0.14em]">
            問 {String(index + 1).padStart(2, "0")}　{question.field}
          </div>
          <p className="max-w-[104ch] text-pretty font-medium text-[15px] leading-[1.9]">
            {question.text}
          </p>
          {question.stem && (
            <div className="mt-5">
              <StemBlock stem={question.stem} />
            </div>
          )}
        </div>

        {(question.explain || question.points) && (
          <div className="border-line-soft border-b px-[26px] py-6">
            <h3 className="mb-2.5 font-bold text-[11px] text-muted-soft tracking-[0.14em]">
              ポイント
            </h3>
            {question.explain && (
              <p className="mb-4 max-w-[110ch] text-pretty text-[14.5px] text-ink-soft leading-[1.95]">
                {question.explain}
              </p>
            )}
            {question.points && <KeyPointList points={question.points} tone="accent" />}
          </div>
        )}

        {question.figure && (
          <div className="border-line-soft border-b bg-panel px-[26px] py-6">
            <FigureBlock figure={question.figure} variant="page" />
          </div>
        )}

        <div className="px-[26px] py-6">
          <h3 className="mb-4 font-bold text-[11px] text-muted-soft tracking-[0.14em]">
            それぞれの選択肢の意味
          </h3>
          <ChoiceNotes question={question} picked={attempt.picked} order={order} variant="page" />
          <div className="text-[11.5px] text-muted-soft">
            出典：{formatSource(question.source, shuffled ? SHUFFLED_NOTE : undefined)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <MarkButtons
          size="md"
          flagged={attempt.flagged}
          weak={attempt.weak}
          onToggleFlag={onToggleFlag}
          onToggleWeak={onToggleWeak}
        />
        <button
          type="button"
          onClick={onNext}
          className="cursor-pointer rounded-[9px] bg-accent px-[30px] py-3.5 font-bold text-[14px] text-surface tracking-[0.02em] hover:bg-accent-hover"
        >
          {isLast ? "結果を見る" : "次の問題へ"}
        </button>
      </div>
    </div>
  );
};
