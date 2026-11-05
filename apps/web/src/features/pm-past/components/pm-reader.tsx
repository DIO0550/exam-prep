"use client";

import { useState } from "react";

import { OriginalFigure } from "@/features/quiz/components/question-figure";

import { pmAnswerStore, usePmAnswers } from "../answers";
import type { PmExam, PmProblem } from "../data";
import { pmProblemId, pmSourceLabel } from "../data";
import { pmRecordStore, usePmRecord } from "../store";
import type { PmAnswerSlot, PmBlock, PmChoice, PmQuestionPart, PmTranscript } from "../types";
import { ScoreInput } from "./score-input";

/** 本文中の空欄（`{{a}}`）と下線（`[[…]]`）を見つける。 */
const MARKUP = /(\{\{[^}]+\}\}|\[\[[^\]]+\]\])/;

/** 本文の文字列を、空欄は枠、下線部は下線にして描く。 */
export const PmText = ({ text }: { text: string }) => {
  const pieces = text.split(MARKUP);
  return (
    <>
      {pieces.map((piece, i) => {
        const key = `${i}-${piece}`;
        if (piece.startsWith("{{") && piece.endsWith("}}")) {
          const name = piece.slice(2, -2);
          return (
            <span
              key={key}
              role="img"
              aria-label={`空欄${name}`}
              className="mx-0.5 inline-block min-w-[2.6em] border border-ink px-1.5 text-center font-bold leading-[1.5]"
            >
              {name}
            </span>
          );
        }
        if (piece.startsWith("[[") && piece.endsWith("]]")) {
          return (
            <span key={key} className="underline decoration-1 underline-offset-[5px]">
              {piece.slice(2, -2)}
            </span>
          );
        }
        return <span key={key}>{piece}</span>;
      })}
    </>
  );
};

const PARAGRAPH = "text-pretty text-read-md text-ink-soft leading-[1.95]";

const Block = ({ block }: { block: PmBlock }) => {
  switch (block.kind) {
    case "heading":
      return <h3 className="pt-3 font-bold text-read-md text-ink">〔{block.text}〕</h3>;
    case "p":
      return (
        <p className={`${PARAGRAPH} indent-[1em]`}>
          <PmText text={block.text} />
        </p>
      );
    case "items":
      return (
        <dl className="grid grid-cols-[auto_1fr] gap-x-1 gap-y-1.5">
          {block.items.map((item) => (
            <div key={`${item.label}${item.text}`} className="contents">
              <dt className={`${PARAGRAPH} whitespace-nowrap`}>{item.label}</dt>
              <dd className={PARAGRAPH}>
                <PmText text={item.text} />
                {item.sub && (
                  <span className="block">
                    <PmText text={item.sub} />
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      );
    case "image":
      return (
        <div className="flex justify-center py-2">
          <OriginalFigure image={block.image} />
        </div>
      );
  }
};

const ChoiceList = ({ choices }: { choices: PmChoice[] }) => (
  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg border border-line bg-panel px-4 py-3">
    {choices.map((choice) => (
      <div key={choice.key} className="contents">
        <dt className="font-bold text-read-sm text-ink">{choice.key}</dt>
        <dd className="text-pretty text-read-sm text-ink-soft leading-[1.75]">{choice.text}</dd>
      </div>
    ))}
  </dl>
);

const Part = ({ part }: { part: PmQuestionPart }) => (
  <section className="flex flex-col gap-3">
    <h3 className="font-bold text-read-md text-ink">{part.label}</h3>
    <p className={PARAGRAPH}>
      <PmText text={part.text} />
    </p>
    {part.choices && (
      <div className="flex flex-col gap-1.5">
        <div className="text-read-xs text-muted">解答群</div>
        <ChoiceList choices={part.choices} />
      </div>
    )}
    {part.items?.map((item) => (
      <div key={item.label} className="flex flex-col gap-2 pl-2">
        <div className="flex gap-1">
          <span className={PARAGRAPH}>{item.label}</span>
          <p className={PARAGRAPH}>
            <PmText text={item.text} />
          </p>
        </div>
        {item.choices && (
          <div className="flex flex-col gap-1.5 pl-6">
            <div className="text-read-xs text-muted">解答群</div>
            <ChoiceList choices={item.choices} />
          </div>
        )}
      </div>
    ))}
  </section>
);

type SlotProps = {
  id: string;
  slot: PmAnswerSlot;
  value: string;
  revealed: boolean;
};

/** 答える欄 1 つ。解答群があれば記号のボタン、無ければ文字を書く欄にする。 */
const Slot = ({ id, slot, value, revealed }: SlotProps) => {
  const correct = slot.choices ? value === slot.answer : undefined;
  return (
    <div className="flex flex-col gap-2 border-line-soft border-t py-3.5 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-bold text-[13px] text-ink">{slot.key}</span>
        <span className="text-[11px] text-muted-soft">
          {slot.hint}
          {!slot.choices && value !== "" && ` ・ ${[...value].length}字`}
        </span>
      </div>

      {slot.choices ? (
        <fieldset className="flex flex-wrap gap-1.5">
          <legend className="sr-only">{slot.key} の答え</legend>
          {slot.choices.map((choice) => {
            const selected = value === choice.key;
            return (
              <button
                key={choice.key}
                type="button"
                aria-pressed={selected}
                aria-label={`${slot.key} に ${choice.key}`}
                onClick={() => pmAnswerStore.set(id, slot.key, selected ? "" : choice.key)}
                className={`size-9 cursor-pointer rounded-lg border font-bold text-[13px] ${
                  selected
                    ? "border-accent bg-accent text-surface"
                    : "border-edge-strong bg-surface text-ink hover:bg-hover"
                }`}
              >
                {choice.key}
              </button>
            );
          })}
        </fieldset>
      ) : (
        <textarea
          aria-label={`${slot.key} の答え`}
          value={value}
          rows={2}
          onChange={(event) => pmAnswerStore.set(id, slot.key, event.target.value)}
          className="w-full resize-y rounded-lg border border-edge-strong bg-surface px-3 py-2 text-read-sm text-ink leading-[1.7]"
        />
      )}

      {revealed && (
        <div
          className={`flex flex-col gap-1.5 rounded-lg border px-3.5 py-2.5 ${
            correct === undefined
              ? "border-line bg-panel"
              : correct
                ? "border-ok-line bg-ok-bg"
                : "border-ng-line bg-ng-bg"
          }`}
        >
          <div className="flex flex-wrap items-baseline gap-x-2 text-read-sm">
            {correct !== undefined && (
              <span className={`font-bold ${correct ? "text-ok" : "text-ng"}`}>
                {correct ? "○ 正解" : "× 不正解"}
              </span>
            )}
            <span className="text-muted">解答例</span>
            <span className="font-bold text-ink">{slot.answer}</span>
          </div>
          <p className="text-pretty text-read-sm text-ink-soft leading-[1.8]">{slot.explain}</p>
        </div>
      )}
    </div>
  );
};

type PmReaderProps = {
  pmExam: PmExam;
  problem: PmProblem;
  transcript: PmTranscript;
  onBack: () => void;
};

/**
 * 書き起こした午後の問題を解く画面。左に問題文と設問、右に答える欄を置く。
 * 「解答例を見る」で欄ごとに IPA の解答例と本サイトの解説を出す。
 */
export const PmReader = ({ pmExam, problem, transcript, onBack }: PmReaderProps) => {
  const id = pmProblemId(pmExam, problem.no);
  const source = pmSourceLabel(pmExam, problem.no);
  const answers = usePmAnswers()[id] ?? {};
  const attempt = usePmRecord().attempts[id];
  const [revealed, setRevealed] = useState(false);

  const reveal = () => {
    setRevealed(true);
    if (!attempt) pmRecordStore.markSolved(id);
  };

  const slots = transcript.parts.flatMap((part) => part.slots);
  const choiceSlots = slots.filter((slot) => slot.choices);
  const choiceCorrect = choiceSlots.filter((slot) => answers[slot.key] === slot.answer).length;

  return (
    <>
      <div className="flex min-w-0 flex-col md:flex-[999_1_560px] md:overflow-y-auto md:overscroll-contain">
        <main className="flex justify-center px-7 pb-16">
          <article className="flex w-full max-w-[820px] flex-col gap-5">
            <header className="flex flex-col gap-2 border-line border-b pt-5 pb-3.5">
              <button
                type="button"
                onClick={onBack}
                className="self-start cursor-pointer rounded-[7px] px-2 py-1 text-[12px] text-accent hover:bg-hover"
              >
                ← 午後過去問の一覧へ
              </button>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-bold text-[12px] text-accent">問{problem.no}</span>
                <h1 className="font-bold text-[16px] leading-[1.5]">{problem.field}</h1>
              </div>
              <span className="text-[11.5px] text-muted-soft">出典：{source}</span>
            </header>

            <p className={PARAGRAPH}>{transcript.lead}</p>
            {transcript.body.map((block, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 本文は静的で並べ替えないため添字で足りる
              <Block key={i} block={block} />
            ))}

            <div className="mt-4 flex flex-col gap-6 border-line border-t pt-5">
              {transcript.parts.map((part) => (
                <Part key={part.label} part={part} />
              ))}
            </div>
          </article>
        </main>
      </div>

      <aside
        aria-label="解答欄"
        className="flex flex-col gap-4 border-line border-t bg-surface px-5 pt-5 pb-10 md:flex-[1_1_380px] md:overflow-y-auto md:overscroll-contain md:border-t-0 md:border-l"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-bold text-[14px]">解答欄</h2>
          <span className="text-[11px] text-muted-soft">書いた答えはこのブラウザに残ります</span>
        </div>

        {transcript.parts.map((part) => (
          <section key={part.label} className="rounded-xl border border-line px-4 py-3.5">
            {part.slots.map((slot) => (
              <Slot
                key={slot.key}
                id={id}
                slot={slot}
                value={answers[slot.key] ?? ""}
                revealed={revealed}
              />
            ))}
          </section>
        ))}

        {revealed ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-panel px-4 py-3">
              <span className="text-[12.5px] text-ink">
                記号の欄 {choiceCorrect}/{choiceSlots.length} 正解
              </span>
              <ScoreInput id={id} source={source} attempt={attempt} />
            </div>
            <section className="flex flex-col gap-1.5">
              <h3 className="font-bold text-[13px] text-ink">出題趣旨（IPA）</h3>
              <p className="text-pretty text-read-sm text-ink-soft leading-[1.85]">
                {transcript.intent}
              </p>
            </section>
            <section className="flex flex-col gap-1.5">
              <h3 className="font-bold text-[13px] text-ink">読みどころ</h3>
              <p className="text-pretty text-read-sm text-ink-soft leading-[1.85]">
                {transcript.overview}
              </p>
            </section>
            <p className="text-[11px] text-muted-soft leading-[1.7]">
              解答例は IPA
              が示した例で、唯一の正解ではありません。記述の欄は解答例と見比べて自己採点してください。
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRevealed(false)}
                className="cursor-pointer rounded-[7px] border border-edge-strong px-3 py-1.5 text-[12px] text-muted hover:bg-canvas"
              >
                解答例を隠す
              </button>
              <button
                type="button"
                onClick={() => {
                  pmAnswerStore.clearProblem(id);
                  setRevealed(false);
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
            onClick={reveal}
            className="cursor-pointer rounded-lg bg-accent px-4 py-2.5 font-bold text-[13px] text-surface hover:bg-accent-hover"
          >
            解答例を見る
          </button>
        )}
      </aside>
    </>
  );
};
