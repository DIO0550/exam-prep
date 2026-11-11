"use client";

import { FigureBlock } from "@/features/quiz/components/figure-block";

import type { FillBlank } from "../types";

/** 「イ　1 対多」のように、記号に中身を添える。 */
export const choiceLabel = (blank: FillBlank, key: string): string => {
  const choice = blank.choices?.find((c) => c.key === key);
  return choice ? `${choice.key}　${choice.text}` : key;
};

/** 解説の 1 欄を指す要素 ID。右の解答欄の「解説を見る」から飛ぶ先。 */
export const explainId = (drillId: string, key: string): string => `${drillId}-explain-${key}`;

type BlankExplainProps = {
  drillId: string;
  blank: FillBlank;
  /** 書いた（選んだ）答え。 */
  value: string;
  correct: boolean;
};

/**
 * 空欄 1 つの解説。問題文の下の広い欄に、正誤・正解・解説・答えまでの考え方・図を並べる。
 * 右の解答欄は幅が狭く、図や手順を置くと読みにくいので、詳しい解説はこちらにまとめる。
 */
export const BlankExplain = ({ drillId, blank, value, correct }: BlankExplainProps) => (
  <article
    id={explainId(drillId, blank.key)}
    aria-label={`空欄${blank.key} の解説`}
    className="flex scroll-mt-4 flex-col gap-3.5 rounded-xl border border-line bg-surface px-5 py-4"
  >
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h3 className="font-bold text-[14px] text-ink">空欄 {blank.key}</h3>
      <span className={`font-bold text-[13px] ${correct ? "text-ok" : "text-ng"}`}>
        {correct ? "○ 正解" : "× 不正解"}
      </span>
      <span className="text-read-sm text-muted">正解</span>
      <span className="font-bold text-read-md text-ink">{choiceLabel(blank, blank.answer)}</span>
      {blank.accepts && (
        <span className="text-read-xs text-muted">（{blank.accepts.join("、")} でも正解）</span>
      )}
    </div>
    {!correct && (
      <p className="text-read-sm text-muted">
        あなたの答え：
        <span className="text-ink">{value === "" ? "（未記入）" : choiceLabel(blank, value)}</span>
      </p>
    )}

    <p className="text-pretty text-read-md text-ink leading-[1.95]">{blank.explain}</p>

    {blank.steps && blank.steps.length > 0 && (
      <section className="flex flex-col gap-2 rounded-lg bg-panel px-4 py-3">
        <h4 className="font-bold text-[12.5px] text-accent-deep">答えまでの考え方</h4>
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 marker:font-bold marker:text-accent">
          {blank.steps.map((step) => (
            <li key={step} className="text-pretty text-read-md text-ink-soft leading-[1.9]">
              {step}
            </li>
          ))}
        </ol>
      </section>
    )}

    {blank.figure && (
      // 図は横に長いものがあるので、はみ出した分は枠の中で横にスクロールさせる。
      <div className="overflow-x-auto rounded-xl border border-line px-4 pt-4 pb-4">
        <FigureBlock figure={blank.figure} variant="page" />
      </div>
    )}
  </article>
);
