"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { SiteFooter } from "@/features/quiz/components/site-footer";

import type { PmAnswers } from "../answers";
import { usePmAnswers } from "../answers";
import type { PmExam, PmProblem } from "../data";
import { PM_EXAMS, PM_PROBLEMS, pmProblemId, pmSourceLabel } from "../data";
import { gradeTranscript } from "../grading";
import type { PmMarks } from "../marks";
import { usePmMarks } from "../marks";
import type { PmRecord } from "../record";
import { summarize } from "../record";
import { pmRecordStore, usePmRecord } from "../store";
import { PM_TRANSCRIPTS } from "../transcripts";
import { PmReader } from "./pm-reader";
import { ScoreInput } from "./score-input";

/** 左の一覧で「すべての問」を選んでいるときの値。 */
const ALL = 0;

/**
 * 応用情報 午後の過去問題。IPA の公開 PDF へのリンクと、解いた記録・自己採点の点数を並べる。
 *
 * 問（分野）を選ぶと、その問だけを回をまたいで並べる。選択問題を決めるときに、
 * 分野ごとに何回解いて平均何点だったかを見比べられるようにするため。
 *
 * 左には演習と同じ試験の一覧（sidebar）を出す。書き起こした問を解いている間は、
 * 問題文と解答欄に幅を使うため出さない。
 */
export const PmPastApp = ({ sidebar }: { sidebar?: ReactNode }) => {
  const record = usePmRecord();
  const answers = usePmAnswers();
  const marks = usePmMarks();
  const [problemNo, setProblemNo] = useState(ALL);
  // 書き起こした問題を開いているとき、その回と問。
  const [opened, setOpened] = useState<{ pmExam: PmExam; problem: PmProblem } | null>(null);
  const problems = problemNo === ALL ? PM_PROBLEMS : PM_PROBLEMS.filter((p) => p.no === problemNo);
  const total = PM_EXAMS.length * PM_PROBLEMS.length;
  const overall = summarize(
    record,
    PM_EXAMS.flatMap((pmExam) => PM_PROBLEMS.map((problem) => pmProblemId(pmExam, problem.no))),
  );

  const openedTranscript = opened && PM_TRANSCRIPTS[pmProblemId(opened.pmExam, opened.problem.no)];
  if (opened && openedTranscript) {
    return (
      <PmReader
        pmExam={opened.pmExam}
        problem={opened.problem}
        transcript={openedTranscript}
        onBack={() => setOpened(null)}
      />
    );
  }

  return (
    <>
      {sidebar}

      <div className="flex min-w-0 flex-1 flex-col md:flex-[999_1_520px] md:overflow-y-auto md:overscroll-contain">
        <main className="flex flex-1 justify-center px-7 pb-16">
          <div className="flex w-full max-w-[1000px] flex-col gap-6">
            <header className="flex flex-wrap items-baseline gap-3 border-line border-b pt-6 pb-3.5">
              <span className="font-bold text-[10.5px] text-muted tracking-[0.14em]">
                午後 過去問
              </span>
              <h1 className="font-bold text-[17px] leading-[1.4] tracking-[0.01em]">
                応用情報技術者試験 午後
              </h1>
              <span className="text-[11.5px] text-muted">
                {PM_EXAMS.length}回分 ・ 解いた {overall.solved}/{total}問
                {overall.average !== undefined && ` ・ 平均 ${overall.average}点`}
              </span>
            </header>

            <section className="rounded-xl border border-line bg-panel px-5 py-4 text-read-sm text-ink-soft leading-[1.85]">
              <p>
                問題冊子と解答例は IPA が公開している PDF
                を開いて使います。「このサイトで解く」がある問は、問題文を書き起こしてあり、左に問題文・右に解答欄を並べて解けます。
                解き終えたら解答例と見比べて自己採点し、点数を記録してください。このサイトで解いた問は、解答欄ごとに
                ○・△・× を付けると、正解の欄の割合（△
                は半分）から点数の目安が入ります。記録はこのブラウザにだけ残ります。
              </p>
              <p className="mt-1.5 text-muted-soft">
                問1（情報セキュリティ）は必須、問2〜11 から 4 問を選んで解答します。 午後の解答例は
                IPA
                が示した例で、唯一の正解ではありません。採点講評には出題の意図と、受験者のよくある誤りが書かれています。
              </p>
            </section>

            <PmFilter record={record} selected={problemNo} onSelect={setProblemNo} />

            <div className="flex flex-col gap-4">
              {PM_EXAMS.map((pmExam) => (
                <PmExamCard
                  key={pmExam.id}
                  pmExam={pmExam}
                  problems={problems}
                  record={record}
                  answers={answers}
                  marks={marks}
                  onOpen={(problem) => setOpened({ pmExam, problem })}
                />
              ))}
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
};

type PmFilterProps = {
  record: PmRecord;
  selected: number;
  onSelect: (no: number) => void;
};

/** 問（分野）で絞り込むボタン。各ボタンに、回をまたいだ解いた数と平均点を出す。 */
const PmFilter = ({ record, selected, onSelect }: PmFilterProps) => {
  const items = [
    { no: ALL, label: "すべての問", badge: "全" },
    ...PM_PROBLEMS.map((problem) => ({
      no: problem.no,
      label: problem.field,
      badge: `問${problem.no}`,
    })),
  ];
  return (
    <nav aria-label="問の一覧" className="flex flex-col gap-2">
      <h2 className="font-bold text-[10.5px] text-muted tracking-[0.12em]">問（分野）で絞り込む</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-1.5">
        {items.map((item) => {
          const active = item.no === selected;
          const nos = item.no === ALL ? PM_PROBLEMS.map((p) => p.no) : [item.no];
          const summary = summarize(
            record,
            PM_EXAMS.flatMap((pmExam) => nos.map((no) => pmProblemId(pmExam, no))),
          );
          return (
            <button
              key={item.no}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(item.no)}
              className={`flex cursor-pointer items-center gap-2 rounded-[9px] border px-2.5 py-[7px] text-left hover:bg-hover ${
                active ? "border-accent bg-accent-soft" : "border-line bg-surface"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex size-7 flex-none items-center justify-center rounded-lg font-bold text-[9px] ${
                  active ? "bg-accent text-surface" : "bg-chip text-muted-soft"
                }`}
              >
                {item.badge}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span
                  className={`truncate text-[12px] leading-[1.4] ${
                    active ? "font-bold text-accent-deep" : "font-medium text-ink"
                  }`}
                >
                  {item.label}
                </span>
                <span className="text-[10.5px] text-muted-soft tabular-nums">
                  解いた {summary.solved}/{PM_EXAMS.length * nos.length}
                  {summary.average !== undefined && ` ・ 平均 ${summary.average}点`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

type PmExamCardProps = {
  pmExam: PmExam;
  problems: PmProblem[];
  record: PmRecord;
  answers: PmAnswers;
  marks: PmMarks;
  onOpen: (problem: PmProblem) => void;
};

/**
 * 書き起こした問で、× と △ の付いた欄の数。解き直す問を一覧で見つけられるようにする。
 * 解いた記録（解答例を見ると付く）がある問だけ数える。解答例を見る前に、選んだ記号の正誤を
 * 一覧で漏らさないため。
 */
const retryCounts = (
  id: string,
  record: PmRecord,
  answers: PmAnswers,
  marks: PmMarks,
): RetryCounts => {
  const transcript = PM_TRANSCRIPTS[id];
  if (!transcript || !record.attempts[id]) return { ng: 0, partial: 0 };
  const { ng, partial } = gradeTranscript(transcript, answers[id] ?? {}, marks[id] ?? {});
  return { ng, partial };
};

type RetryCounts = { ng: number; partial: number };

/** 一覧に出す「× 2 ・ △ 1欄」。どちらも無ければ空。 */
const retryLabel = ({ ng, partial }: RetryCounts): string => {
  const parts = [ng > 0 && `× ${ng}`, partial > 0 && `△ ${partial}`].filter(Boolean);
  return parts.length > 0 ? `${parts.join(" ・ ")}欄` : "";
};

const PDF_LINK =
  "rounded-[7px] border border-edge-strong bg-surface px-3 py-1.5 font-medium text-[12px] text-accent hover:bg-canvas";

/** 1 回分。IPA の PDF へのリンクと、問ごとの記録の行を並べる。 */
const PmExamCard = ({ pmExam, problems, record, answers, marks, onOpen }: PmExamCardProps) => (
  <section
    aria-label={pmExam.label}
    className="overflow-hidden rounded-2xl border border-line bg-surface"
  >
    <div className="flex flex-wrap items-center justify-between gap-3 border-line-soft border-b px-5 py-3.5">
      <h2 className="font-bold text-[14px]">{pmExam.label}</h2>
      <div className="flex flex-wrap gap-2">
        <a className={PDF_LINK} href={pmExam.questionPdf} target="_blank" rel="noopener noreferrer">
          問題冊子（PDF）
        </a>
        <a className={PDF_LINK} href={pmExam.answerPdf} target="_blank" rel="noopener noreferrer">
          解答例（PDF）
        </a>
        <a className={PDF_LINK} href={pmExam.commentPdf} target="_blank" rel="noopener noreferrer">
          採点講評（PDF）
        </a>
      </div>
    </div>
    <ul className="flex flex-col">
      {problems.map((problem) => (
        <PmProblemRow
          key={problem.no}
          pmExam={pmExam}
          problem={problem}
          attempt={record.attempts[pmProblemId(pmExam, problem.no)]}
          retry={retryLabel(retryCounts(pmProblemId(pmExam, problem.no), record, answers, marks))}
          onOpen={() => onOpen(problem)}
        />
      ))}
    </ul>
  </section>
);

type PmProblemRowProps = {
  pmExam: PmExam;
  problem: PmProblem;
  attempt: PmRecord["attempts"][string] | undefined;
  /** × と △ を付けた欄の数の表記（「× 2 ・ △ 1欄」）。書き起こした問だけ。無ければ空。 */
  retry: string;
  onOpen: () => void;
};

/** 1 問分の行。解いた印と自己採点の点数を付けられる。書き起こしがある問は、このサイトで解ける。 */
const PmProblemRow = ({ pmExam, problem, attempt, retry, onOpen }: PmProblemRowProps) => {
  const id = pmProblemId(pmExam, problem.no);
  const source = pmSourceLabel(pmExam, problem.no);

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 border-line-soft border-t px-5 py-2.5 first:border-t-0">
      <span className="w-[52px] font-bold text-[12px] text-accent">問{problem.no}</span>
      <span className="flex min-w-[160px] flex-1 items-center gap-2 text-[13px]">
        {problem.field}
        {problem.required && (
          <span className="rounded bg-chip px-1.5 py-0.5 font-bold text-[10px] text-muted">
            必須
          </span>
        )}
        {retry !== "" && (
          <span className="rounded bg-ng-soft px-1.5 py-0.5 font-bold text-[10px] text-ng">
            {retry}
          </span>
        )}
      </span>
      {PM_TRANSCRIPTS[id] && (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${source} をこのサイトで解く`}
          className="cursor-pointer rounded-[7px] bg-accent px-3 py-1 font-bold text-[11.5px] text-surface hover:bg-accent-hover"
        >
          このサイトで解く
        </button>
      )}
      <span className="w-[92px] text-[11.5px] text-muted-soft tabular-nums">
        {attempt ? `${attempt.solvedOn} 解答` : "未解答"}
      </span>
      <ScoreInput id={id} source={source} attempt={attempt} />
      {attempt ? (
        <button
          type="button"
          onClick={() => pmRecordStore.unmark(id)}
          aria-label={`${source} の記録を消す`}
          className="cursor-pointer rounded-[7px] px-2.5 py-1 text-[11.5px] text-muted-soft hover:bg-canvas"
        >
          記録を消す
        </button>
      ) : (
        <button
          type="button"
          onClick={() => pmRecordStore.markSolved(id)}
          aria-label={`${source} を解いた`}
          className="cursor-pointer rounded-[7px] border border-edge-strong px-2.5 py-1 font-bold text-[11.5px] text-accent hover:bg-canvas"
        >
          解いた
        </button>
      )}
    </li>
  );
};
