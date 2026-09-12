import { choiceKey, type Question } from "../types";

type Variant = "inline" | "page";

const SIZES = {
  inline: { key: "size-6 text-[11.5px]", text: "text-[13.5px]", gap: "gap-3" },
  page: { key: "size-[26px] text-[12px]", text: "text-[14px]", gap: "gap-[13px]" },
} as const;

type ChoiceNotesProps = {
  question: Question;
  /** 利用者が選んだ選択肢。未解答なら null。 */
  picked: number | null;
  variant: Variant;
};

/** 解説の「それぞれの選択肢の意味」。正解・自分の解答が一目で分かるよう色を振る。 */
export const ChoiceNotes = ({ question, picked, variant }: ChoiceNotesProps) => {
  const size = SIZES[variant];

  return (
    <div className="mb-[18px] flex max-w-[82ch] flex-col gap-3.5">
      {question.choices.map((choice, index) => {
        const isAnswer = index === question.answer;
        const isPicked = index === picked;

        return (
          <div key={choice.text} className={`flex items-start ${size.gap}`}>
            <span
              className={`flex flex-none items-center justify-center rounded-full font-bold ${size.key} ${
                isAnswer
                  ? "bg-ok text-surface"
                  : isPicked
                    ? "bg-ng text-surface"
                    : "bg-chip text-muted-soft"
              }`}
            >
              {choiceKey(index)}
            </span>
            <div className="flex flex-1 flex-col gap-1">
              <span
                className={`text-pretty leading-[1.7] ${size.text} ${
                  isAnswer ? "font-bold text-ok" : "text-ink"
                }`}
              >
                {choice.text}
                {(isAnswer || isPicked) && (
                  <span
                    className={`ml-2 font-bold text-[11px] ${isAnswer ? "text-ok" : "text-ng"}`}
                  >
                    {isAnswer ? "正解" : "あなたの解答"}
                  </span>
                )}
              </span>
              <span className="text-pretty text-[12.5px] text-muted-soft leading-[1.85]">
                {choice.note}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
