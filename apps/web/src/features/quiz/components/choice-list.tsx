import type { QuizItem } from "../stats";
import { choiceKey } from "../types";
import { OriginalFigure } from "./question-figure";

type ChoiceListProps = {
  item: QuizItem;
  onPick: (index: number) => void;
  onToggleExclude: (index: number) => void;
};

/** 選択肢の色。解答前は「選択中」、解答後は「正解」「あなたの解答」を塗り分ける。 */
const choiceStyle = ({ question, attempt }: QuizItem, index: number) => {
  const picked = attempt.picked === index;
  const answer = index === question.answer;

  if (attempt.revealed && answer) {
    return {
      box: "border-ok bg-ok-soft",
      key: "bg-ok text-surface",
      mark: "正解",
      markColor: "text-ok",
    };
  }
  if (attempt.revealed && picked) {
    return {
      box: "border-ng bg-ng-soft",
      key: "bg-ng text-surface",
      mark: "あなたの解答",
      markColor: "text-ng",
    };
  }
  if (picked) {
    return {
      box: "border-accent bg-accent-soft",
      key: "bg-accent text-surface",
      mark: "",
      markColor: "",
    };
  }
  return { box: "border-edge bg-surface", key: "bg-chip text-muted-soft", mark: "", markColor: "" };
};

export const ChoiceList = ({ item, onPick, onToggleExclude }: ChoiceListProps) => {
  const { question, attempt } = item;

  return (
    <div className="flex max-w-[860px] flex-col gap-[11px] px-[26px] pt-[22px] pb-[26px]">
      {question.choices.map((choice, index) => {
        const style = choiceStyle(item, index);
        const crossedOut = attempt.excluded.includes(index);
        const dimmed = crossedOut && !attempt.revealed;
        const key = choiceKey(index);

        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: 選択肢は問題ごとに固定長で並べ替えもしない
          <div key={index} className="flex items-stretch gap-2">
            <button
              type="button"
              disabled={attempt.revealed}
              onClick={() => onPick(index)}
              className={`flex min-h-14 flex-1 items-start gap-3.5 rounded-[11px] border-[1.5px] px-[18px] py-4 text-left transition-colors ${
                style.box
              } ${attempt.revealed ? "cursor-default" : "cursor-pointer hover:brightness-[0.98]"} ${
                dimmed ? "opacity-50" : ""
              }`}
            >
              <span
                className={`flex size-[26px] flex-none items-center justify-center rounded-full font-bold text-[12px] ${style.key}`}
              >
                {key}
              </span>
              <span className="flex flex-1 flex-col gap-2">
                {choice.text && (
                  <span
                    className={`text-pretty pt-[3px] text-[14.5px] leading-[1.75] ${
                      dimmed ? "text-muted-soft line-through" : "text-ink"
                    }`}
                  >
                    {choice.text}
                  </span>
                )}
                {choice.image && <OriginalFigure image={choice.image} />}
              </span>
              {style.mark && (
                <span className={`flex-none pt-[5px] font-bold text-[12px] ${style.markColor}`}>
                  {style.mark}
                </span>
              )}
            </button>
            <button
              type="button"
              aria-pressed={crossedOut}
              aria-label={`選択肢${key}を除外`}
              title="この選択肢を除外"
              onClick={() => onToggleExclude(index)}
              className={`flex-[0_0_36px] cursor-pointer rounded-[9px] border border-edge bg-[#fbfcfd] font-bold text-[16px] hover:bg-[#f0f2f6] ${
                crossedOut ? "text-accent" : "text-muted-soft"
              }`}
            >
              –
            </button>
          </div>
        );
      })}
    </div>
  );
};
