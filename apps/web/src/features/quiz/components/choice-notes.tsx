import { isShuffled } from "../choice-order";
import { choiceKey, type Question } from "../types";
import { OriginalFigure } from "./question-figure";

type Variant = "inline" | "page";

/** inline は問題カードの中、page は解説画面。記号の大きさと間隔だけ変わる（本文は共通）。 */
const SIZES = {
  inline: { key: "size-6 text-[11.5px]", gap: "gap-3" },
  page: { key: "size-[26px] text-[12px]", gap: "gap-[13px]" },
} as const;

type ChoiceNotesProps = {
  question: Question;
  /** 利用者が選んだ選択肢。未解答なら null。 */
  picked: number | null;
  /** 選択肢を出す順。値は原本での添字。 */
  order: number[];
  variant: Variant;
};

/**
 * 解説の「それぞれの選択肢の意味」。正解・自分の解答が一目で分かるよう色を振る。
 *
 * シャッフル中は原本での記号も併記する。解説の本文や計算式には「選択肢 ウ」のように
 * 原本の記号で書いたものがあり、併記が無いと本文と画面のラベルが食い違って読めなくなるため。
 */
export const ChoiceNotes = ({ question, picked, order, variant }: ChoiceNotesProps) => {
  const size = SIZES[variant];
  const shuffled = isShuffled(order);

  return (
    <div className="mb-[18px] flex max-w-[118ch] flex-col gap-3.5">
      {order.map((index, position) => {
        const choice = question.choices[index];
        if (!choice) return null;
        const isAnswer = index === question.answer;
        const isPicked = index === picked;

        return (
          <div key={index} className={`flex items-start ${size.gap}`}>
            <span className="flex flex-none flex-col items-center gap-1">
              <span
                className={`flex items-center justify-center rounded-full font-bold ${size.key} ${
                  isAnswer
                    ? "bg-ok text-surface"
                    : isPicked
                      ? "bg-ng text-surface"
                      : "bg-chip text-muted-soft"
                }`}
              >
                {choiceKey(position)}
              </span>
              {shuffled && (
                <span className="whitespace-nowrap text-read-xs text-muted-soft">
                  原本 {choiceKey(index)}
                </span>
              )}
            </span>
            <div className="flex flex-1 flex-col gap-1">
              <span
                className={`text-pretty text-read-md leading-[1.7] ${
                  isAnswer ? "font-bold text-ok" : "text-ink"
                }`}
              >
                {choice.text}
                {(isAnswer || isPicked) && (
                  <span
                    className={`font-bold text-[11px] ${choice.text ? "ml-2" : ""} ${
                      isAnswer ? "text-ok" : "text-ng"
                    }`}
                  >
                    {isAnswer ? "正解" : "あなたの解答"}
                  </span>
                )}
              </span>
              {choice.image && <OriginalFigure image={choice.image} />}
              {choice.note && (
                <span className="text-pretty text-read-sm text-muted-soft leading-[1.85]">
                  {choice.note}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
