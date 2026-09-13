import type { ReviewFilter } from "../hooks/use-quiz-session";
import { REVIEW_FILTERS } from "../hooks/use-quiz-session";
import type { QuizItem } from "../stats";
import { isCorrect } from "../stats";
import { sourceId } from "../types";

type ReviewScreenProps = {
  items: QuizItem[];
  filter: ReviewFilter;
  onChangeFilter: (filter: ReviewFilter) => void;
  onGoTo: (index: number) => void;
};

/** 一覧に出す問題文の長さ。これを超えたら末尾を省略する。 */
const TEXT_LIMIT = 78;

export const ReviewScreen = ({ items, filter, onChangeFilter, onGoTo }: ReviewScreenProps) => {
  const rows = items
    .map((item, index) => {
      const { question, attempt } = item;
      const good = attempt.revealed && isCorrect(item);
      const tags = [attempt.flagged && "フラグ", attempt.weak && "苦手登録"].filter(Boolean);

      return { question, attempt, index, good, tags: tags.join("・") };
    })
    .filter(({ attempt, good }) => {
      if (filter === "不正解のみ") return attempt.revealed && !good;
      if (filter === "フラグ") return attempt.flagged;
      if (filter === "苦手登録") return attempt.weak;
      return true;
    });

  return (
    <div className="flex animate-rise-in flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-[18px] tracking-[0.01em]">問題一覧・見直し</h2>
        <div className="flex rounded-lg bg-track p-[3px]">
          {REVIEW_FILTERS.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={filter === name}
              onClick={() => onChangeFilter(name)}
              className={`cursor-pointer whitespace-nowrap rounded-md px-[13px] py-[7px] font-bold text-[11.5px] ${
                filter === name
                  ? "bg-surface text-accent shadow-[0_1px_2px_rgba(22,24,29,0.12)]"
                  : "text-muted"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {rows.map(({ question, attempt, index, good, tags }) => (
          <button
            key={sourceId(question.source)}
            type="button"
            onClick={() => onGoTo(index)}
            className="flex w-full cursor-pointer items-start gap-4 border-line-softer border-b px-6 py-[18px] text-left hover:bg-[#fafbfc]"
          >
            <span className="flex-[0_0_22px] pt-0.5 font-bold text-[12px] text-muted-soft tabular-nums">
              {index + 1}
            </span>
            <span
              className={`flex-[0_0_52px] pt-[3px] font-bold text-[11px] ${
                !attempt.revealed ? "text-muted-soft" : good ? "text-ok" : "text-ng"
              }`}
            >
              {!attempt.revealed ? "未解答" : good ? "正解" : "不正解"}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
              <span className="text-pretty text-[13.5px] text-ink-soft leading-[1.7]">
                {question.text.length > TEXT_LIMIT
                  ? `${question.text.slice(0, TEXT_LIMIT)}…`
                  : question.text}
              </span>
              <span className="flex flex-wrap gap-2.5 text-[11px] text-muted-soft">
                <span>{question.field}</span>
                <span>{tags}</span>
              </span>
            </span>
          </button>
        ))}
        {rows.length === 0 && (
          <div className="px-6 py-10 text-center text-[13px] text-muted-soft">
            該当する問題はありません。
          </div>
        )}
      </div>
    </div>
  );
};
