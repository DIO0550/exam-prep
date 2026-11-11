"use client";

import type { ReactNode } from "react";
import { Fragment, useState } from "react";

import { AnswerPane } from "@/features/quiz/components/answer-pane";
import { useAnswerWidth } from "@/features/quiz/hooks/use-answer-width";

import { countCorrect, isCorrect } from "../grade";
import type { FillDrillStore } from "../store";
import { useFillDrillRecord } from "../store";
import type { FillBlank, FillDrill, Marks } from "../types";

/** 「イ　1 対多」のように、記号に中身を添える。 */
const answerLabel = (blank: FillBlank): string => {
  const choice = blank.choices?.find((c) => c.key === blank.answer);
  return choice ? `${choice.key}　${choice.text}` : blank.answer;
};

/** 解答欄の幅を覚える先。SQL・表とネットワークのドリルで同じ幅を使う。 */
const ANSWER_WIDTH_KEY = "exam-prep:fill-drill-answer-width:v1";

type BlankFieldProps = {
  blank: FillBlank;
  value: string;
  correct: boolean | undefined;
  onChange: (value: string) => void;
};

/** 空欄 1 つの答える欄。答え合わせの後は、正誤・正解・解説を下に出す。 */
const BlankField = ({ blank, value, correct, onChange }: BlankFieldProps) => {
  const label = `空欄${blank.key} の答え`;
  const chosen = blank.choices?.find((choice) => choice.key === value);
  return (
    <div className="flex flex-col gap-2 border-line-soft border-t py-3.5 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-bold text-[13px] text-ink">空欄 {blank.key}</span>
        <span className="text-[11px] text-muted-soft">{blank.hint}</span>
      </div>
      {blank.choices ? (
        <>
          <select
            aria-label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={`w-full cursor-pointer truncate rounded-lg border bg-surface px-3 py-2 text-read-sm ${
              value === "" ? "border-edge-strong text-muted-soft" : "border-accent/60 text-ink"
            }`}
          >
            <option value="">選んでください</option>
            {blank.choices.map((choice) => (
              <option key={choice.key} value={choice.key}>
                {choice.key}　{choice.text}
              </option>
            ))}
          </select>
          {chosen && chosen.text.length > 16 && (
            <p className="text-pretty text-read-xs text-ink-soft leading-[1.7]">
              {chosen.key}　{chosen.text}
            </p>
          )}
        </>
      ) : (
        <input
          type="text"
          aria-label={label}
          value={value}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-edge-strong bg-surface px-3 py-2 font-mono text-read-sm text-ink"
        />
      )}
      {correct !== undefined && (
        <div
          className={`flex flex-col gap-1.5 rounded-lg border px-3.5 py-2.5 text-read-sm ${
            correct ? "border-ok-line bg-ok-bg" : "border-ng-line bg-ng-bg"
          }`}
        >
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className={`font-bold ${correct ? "text-ok" : "text-ng"}`}>
              {correct ? "○ 正解" : "× 不正解"}
            </span>
            <span className="text-muted">正解</span>
            <span className="font-bold text-ink">{answerLabel(blank)}</span>
          </div>
          {blank.accepts && (
            <span className="text-[11.5px] text-muted">{blank.accepts.join("、")} でも正解</span>
          )}
          <p className="text-pretty text-ink-soft leading-[1.8]">{blank.explain}</p>
        </div>
      )}
    </div>
  );
};

type FillDrillReaderProps<Block> = {
  drill: FillDrill<string, Block>;
  /** 一覧の中での番号（1 から）。 */
  no: number;
  store: FillDrillStore;
  /** 本文のかたまり 1 つを描く（ドリルごとの図はここで描き分ける）。 */
  renderBlock: (block: Block, marks: Marks) => ReactNode;
  onBack: () => void;
  /** 次の問題へ。最後の問題では undefined。 */
  onNext?: () => void;
};

/**
 * 穴埋めドリル 1 問を解く画面。左に問題文（図・表・SQL 文など）、右に空欄ごとの答える欄。
 * 境目をつまむと解答欄の幅を変えられる（午後の過去問題と同じ部品）。
 * 「答え合わせ」で空欄ごとに正誤を出し、本文の空欄にも正誤の色を付ける。
 */
export const FillDrillReader = <Block,>({
  drill,
  no,
  store,
  renderBlock,
  onBack,
  onNext,
}: FillDrillReaderProps<Block>) => {
  const record = useFillDrillRecord(store);
  const answers = record.answers[drill.id] ?? {};
  const [checked, setChecked] = useState(false);
  const answerWidth = useAnswerWidth(ANSWER_WIDTH_KEY);

  const marks: Marks = checked
    ? Object.fromEntries(
        drill.blanks.map((blank) => [blank.key, isCorrect(blank, answers[blank.key] ?? "")]),
      )
    : undefined;
  const correctCount = countCorrect(drill.blanks, answers);

  const check = () => {
    setChecked(true);
    store.saveResult(drill.id, correctCount, drill.blanks.length);
  };

  return (
    <>
      <div
        className={`flex min-w-0 flex-col md:flex-1 md:overflow-y-auto md:overscroll-contain ${
          answerWidth.dragging ? "select-none" : ""
        }`}
      >
        <main className="flex justify-center px-7 pb-16">
          <article className="flex w-full max-w-[820px] flex-col gap-5">
            <header className="flex flex-col gap-2 border-line border-b pt-5 pb-3.5">
              <button
                type="button"
                onClick={onBack}
                className="self-start cursor-pointer rounded-[7px] px-2 py-1 text-[12px] text-accent hover:bg-hover"
              >
                ← 穴埋めドリルの一覧へ
              </button>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-bold text-[12px] text-accent">No.{no}</span>
                <h1 className="font-bold text-[16px] leading-[1.5]">{drill.title}</h1>
              </div>
              <span className="text-[11.5px] text-muted-soft">
                {drill.topic} ・ 空欄 {drill.blanks.length} 個 ・ 本サイト作成（IPA
                の過去問題ではありません）
              </span>
            </header>

            {drill.body.map((block, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 本文は静的で並べ替えないため添字で足りる
              <Fragment key={i}>{renderBlock(block, marks)}</Fragment>
            ))}

            {checked && (
              <section
                aria-label="この問のまとめ"
                className="mt-2 flex flex-col gap-2 rounded-xl border border-line bg-panel px-5 py-4"
              >
                <h2 className="font-bold text-[13px] text-accent-deep">この問のまとめ</h2>
                <ul className="flex list-disc flex-col gap-1 pl-5">
                  {drill.points.map((point) => (
                    <li
                      key={point}
                      className="text-pretty text-read-sm text-ink-soft leading-[1.8]"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        </main>
      </div>

      <AnswerPane answerWidth={answerWidth}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-bold text-[14px]">解答欄</h2>
          <span className="text-[11px] text-muted-soft">
            大文字・小文字、全角・半角は問いません
          </span>
        </div>

        <section className="rounded-xl border border-line px-4 py-3.5">
          {drill.blanks.map((blank) => (
            <BlankField
              key={blank.key}
              blank={blank}
              value={answers[blank.key] ?? ""}
              correct={marks?.[blank.key]}
              onChange={(value) => store.setAnswer(drill.id, blank.key, value)}
            />
          ))}
        </section>

        {checked ? (
          <div className="flex flex-col gap-3">
            <div
              className={`rounded-xl border px-4 py-3 font-bold text-[13px] ${
                correctCount === drill.blanks.length
                  ? "border-ok-line bg-ok-bg text-ok"
                  : "border-line bg-panel text-ink"
              }`}
            >
              {correctCount}/{drill.blanks.length} 正解
            </div>
            <div className="flex flex-wrap gap-2">
              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="cursor-pointer rounded-[7px] bg-accent px-3 py-1.5 font-bold text-[12px] text-surface hover:bg-accent-hover"
                >
                  次の問題へ
                </button>
              )}
              <button
                type="button"
                onClick={() => setChecked(false)}
                className="cursor-pointer rounded-[7px] border border-edge-strong px-3 py-1.5 text-[12px] text-muted hover:bg-canvas"
              >
                答えを直す
              </button>
              <button
                type="button"
                onClick={() => {
                  store.clearAnswers(drill.id);
                  setChecked(false);
                }}
                className="cursor-pointer rounded-[7px] px-3 py-1.5 text-[12px] text-muted-soft hover:bg-canvas"
              >
                答えを消して解き直す
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={check}
            className="cursor-pointer rounded-lg bg-accent px-4 py-2.5 font-bold text-[13px] text-surface hover:bg-accent-hover"
          >
            答え合わせ
          </button>
        )}
      </AnswerPane>
    </>
  );
};
