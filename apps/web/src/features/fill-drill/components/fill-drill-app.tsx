"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { SiteFooter } from "@/features/quiz/components/site-footer";

import type { FillDrillStore, FillResult } from "../store";
import { useFillDrillRecord } from "../store";
import type { FillDrill, Marks } from "../types";
import { FillDrillReader } from "./fill-drill-reader";

type FillDrillAppProps<Topic extends string, Block> = {
  /** 左に出す試験の一覧。問題を解いている間は、問題文と解答欄に幅を使うため出さない。 */
  sidebar?: ReactNode;
  /** 一覧の分野の順に並べた全問。画面の「No.」と「次の問題へ」はこの順に従う。 */
  drills: FillDrill<Topic, Block>[];
  topics: Topic[];
  store: FillDrillStore;
  /** 見出しの上に小さく出す、どの問の対策か（「午後 問6 対策」など）。 */
  eyebrow: string;
  title: string;
  /** 一覧の上に出す、このドリルで何を練習するかの説明。 */
  intro: ReactNode;
  renderBlock: (block: Block, marks: Marks) => ReactNode;
};

/**
 * 穴埋めドリルの一覧。分野ごとに問を並べ、1 問を開くと、左に問題文・右に解答欄の画面で解ける。
 */
export const FillDrillApp = <Topic extends string, Block>({
  sidebar,
  drills,
  topics,
  store,
  eyebrow,
  title,
  intro,
  renderBlock,
}: FillDrillAppProps<Topic, Block>) => {
  const record = useFillDrillRecord(store);
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);

  const opened = openedIndex === null ? undefined : drills[openedIndex];
  if (openedIndex !== null && opened) {
    const next = drills[openedIndex + 1] ? openedIndex + 1 : undefined;
    return (
      // 次の問題へ移ったら、答え合わせの表示を戻すため問題ごとに作り直す
      <FillDrillReader
        key={opened.id}
        drill={opened}
        no={openedIndex + 1}
        store={store}
        renderBlock={renderBlock}
        onBack={() => setOpenedIndex(null)}
        onNext={next === undefined ? undefined : () => setOpenedIndex(next)}
      />
    );
  }

  const results = drills.map((drill) => record.results[drill.id]);
  const done = results.filter((result) => result !== undefined).length;
  const perfect = results.filter((result) => result && result.correct === result.total).length;

  return (
    <>
      {sidebar}

      <div className="flex min-w-0 flex-1 flex-col md:flex-[999_1_520px] md:overflow-y-auto md:overscroll-contain">
        <main className="flex flex-1 justify-center px-7 pb-16">
          <div className="flex w-full max-w-[1000px] flex-col gap-6">
            <header className="flex flex-wrap items-baseline gap-3 border-line border-b pt-6 pb-3.5">
              <span className="font-bold text-[10.5px] text-muted tracking-[0.14em]">
                {eyebrow}
              </span>
              <h1 className="font-bold text-[17px] leading-[1.4] tracking-[0.01em]">{title}</h1>
              <span className="text-[11.5px] text-muted">
                {drills.length}問 ・ 答え合わせ済み {done}/{drills.length} ・ 全問正解 {perfect}
              </span>
            </header>

            <section className="rounded-xl border border-line bg-panel px-5 py-4 text-read-sm text-ink-soft leading-[1.85]">
              <p>
                {intro}
                「答え合わせ」で空欄ごとに正誤と解説を出します。
              </p>
              <p className="mt-1.5 text-muted-soft">
                問題は本サイトで書き下ろしたもので、IPA
                の過去問題ではありません。書いた答えと結果はこのブラウザにだけ残ります。
              </p>
            </section>

            {topics.map((topic) => (
              <section
                key={topic}
                aria-label={topic}
                className="overflow-hidden rounded-2xl border border-line bg-surface"
              >
                <h2 className="flex items-baseline gap-2 border-line-soft border-b px-5 py-3 font-bold text-[14px]">
                  {topic}
                  <span className="font-normal text-[11.5px] text-muted-soft">
                    {drills.filter((drill) => drill.topic === topic).length}問
                  </span>
                </h2>
                <ul className="flex flex-col">
                  {drills.map((drill, index) =>
                    drill.topic === topic ? (
                      <DrillRow
                        key={drill.id}
                        title={drill.title}
                        blankCount={drill.blanks.length}
                        no={index + 1}
                        result={record.results[drill.id]}
                        onOpen={() => setOpenedIndex(index)}
                      />
                    ) : null,
                  )}
                </ul>
              </section>
            ))}
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
};

type DrillRowProps = {
  title: string;
  blankCount: number;
  no: number;
  result: FillResult | undefined;
  onOpen: () => void;
};

const DrillRow = ({ title, blankCount, no, result, onOpen }: DrillRowProps) => {
  const perfect = result !== undefined && result.correct === result.total;
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 border-line-soft border-t px-5 py-2.5 first:border-t-0">
      <span className="w-[44px] font-bold text-[12px] text-accent">No.{no}</span>
      <span className="min-w-[200px] flex-1 text-[13px]">{title}</span>
      <span className="text-[11.5px] text-muted-soft">空欄 {blankCount}</span>
      <span
        className={`w-[140px] text-[11.5px] tabular-nums ${
          perfect ? "font-bold text-ok" : "text-muted-soft"
        }`}
      >
        {result ? `${result.correct}/${result.total} 正解（${result.on}）` : "未挑戦"}
      </span>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`No.${no} ${title} を解く`}
        className="cursor-pointer rounded-[7px] bg-accent px-3 py-1 font-bold text-[11.5px] text-surface hover:bg-accent-hover"
      >
        解く
      </button>
    </li>
  );
};
