"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { SiteFooter } from "@/features/quiz/components/site-footer";

import { DB_DRILLS, DB_TOPICS } from "../drills";
import type { DbResult } from "../store";
import { useDbDrillRecord } from "../store";
import type { DbDrill } from "../types";
import { DbDrillReader } from "./db-drill-reader";

/**
 * 応用情報 午後 問6（データベース）向けの、SQL 文と表の穴埋めドリル。
 * 一覧から 1 問を開くと、左に問題文・右に解答欄の画面で解ける。
 *
 * 左には演習と同じ試験の一覧（sidebar）を出す。問題を解いている間は、
 * 問題文と解答欄に幅を使うため出さない。
 */
export const DbDrillApp = ({ sidebar }: { sidebar?: ReactNode }) => {
  const record = useDbDrillRecord();
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);

  const opened = openedIndex === null ? undefined : DB_DRILLS[openedIndex];
  if (openedIndex !== null && opened) {
    const next = DB_DRILLS[openedIndex + 1] ? openedIndex + 1 : undefined;
    return (
      // 次の問題へ移ったら、答え合わせの表示を戻すため問題ごとに作り直す
      <DbDrillReader
        key={opened.id}
        drill={opened}
        no={openedIndex + 1}
        onBack={() => setOpenedIndex(null)}
        onNext={next === undefined ? undefined : () => setOpenedIndex(next)}
      />
    );
  }

  const results = DB_DRILLS.map((drill) => record.results[drill.id]);
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
                午後 問6 対策
              </span>
              <h1 className="font-bold text-[17px] leading-[1.4] tracking-[0.01em]">
                SQL・表の穴埋めドリル
              </h1>
              <span className="text-[11.5px] text-muted">
                {DB_DRILLS.length}問 ・ 答え合わせ済み {done}/{DB_DRILLS.length} ・ 全問正解{" "}
                {perfect}
              </span>
            </header>

            <section className="rounded-xl border border-line bg-panel px-5 py-4 text-read-sm text-ink-soft leading-[1.85]">
              <p>
                応用情報 午後のデータベースの問で出る、関係スキーマ（主キー・外部キー）・SQL
                文・表の空欄を埋める練習です。SQL
                のキーワードや列名は自分で書き、用語や結果は選んで答えます。
                「答え合わせ」で空欄ごとに正誤と解説を出します。
              </p>
              <p className="mt-1.5 text-muted-soft">
                問題は本サイトで書き下ろしたもので、IPA
                の過去問題ではありません。書いた答えと結果はこのブラウザにだけ残ります。
              </p>
            </section>

            {DB_TOPICS.map((topic) => (
              <section
                key={topic}
                aria-label={topic}
                className="overflow-hidden rounded-2xl border border-line bg-surface"
              >
                <h2 className="border-line-soft border-b px-5 py-3 font-bold text-[14px]">
                  {topic}
                </h2>
                <ul className="flex flex-col">
                  {DB_DRILLS.map((drill, index) =>
                    drill.topic === topic ? (
                      <DrillRow
                        key={drill.id}
                        drill={drill}
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
  drill: DbDrill;
  no: number;
  result: DbResult | undefined;
  onOpen: () => void;
};

const DrillRow = ({ drill, no, result, onOpen }: DrillRowProps) => {
  const perfect = result !== undefined && result.correct === result.total;
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 border-line-soft border-t px-5 py-2.5 first:border-t-0">
      <span className="w-[44px] font-bold text-[12px] text-accent">No.{no}</span>
      <span className="min-w-[200px] flex-1 text-[13px]">{drill.title}</span>
      <span className="text-[11.5px] text-muted-soft">空欄 {drill.blanks.length}</span>
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
        aria-label={`No.${no} ${drill.title} を解く`}
        className="cursor-pointer rounded-[7px] bg-accent px-3 py-1 font-bold text-[11.5px] text-surface hover:bg-accent-hover"
      >
        解く
      </button>
    </li>
  );
};
