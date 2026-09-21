"use client";

import type { CSSProperties } from "react";
import { useMemo, useRef } from "react";

import { VocabApp } from "@/features/vocab/components/vocab-app";

import { EXAM_GROUPS, EXAMS } from "../data/exams";
import { QUESTION_SETS, questionSetsOf } from "../data/questions";
import { useProgress } from "../hooks/use-progress";
import { useQuizSession } from "../hooks/use-quiz-session";
import { useScrollReset } from "../hooks/use-scroll-reset";
import { isEmptyNote } from "../notes/note";
import { noteStore } from "../notes/store";
import { progressStore } from "../progress/store";
import { streakLabel, summarizeProgress } from "../progress/summary";
import { TEXT_SCALE_RATIO } from "../text-scale";
import { ExamSidebar } from "./exam-sidebar";
import { ExplainScreen } from "./explain-screen";
import { HomeScreen } from "./home-screen";
import { NotePanel } from "./note-panel";
import { ProgressBar } from "./progress-bar";
import { QuizScreen } from "./quiz-screen";
import { ResultScreen } from "./result-screen";
import { ReviewScreen } from "./review-screen";
import { SelectMenu } from "./select-menu";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** 「学習記録を消す」で消すもの。メモも本人がこのブラウザに残したものなので一緒に消す。 */
const clearEverything = (): void => {
  progressStore.clear();
  noteStore.clear();
};

export const QuizApp = () => {
  // 選んでいる回も学習記録の一部として保存する（次に開いたとき同じ回から始められる）。
  const record = useProgress();
  const questionSet = QUESTION_SETS.find((set) => set.id === record.setId) ?? QUESTION_SETS[0];
  const session = useQuizSession(questionSet.questions);
  const progress = useMemo(() => summarizeProgress(record), [record]);

  // 左で選んでいる試験は、出題中の問題集から引く。別の state にすると、記録から読み直した
  // ときや「出題する回」を切り替えたときに、左の選択とずれた表示になってしまう。
  const examIndex = Math.max(
    0,
    EXAMS.findIndex((candidate) => candidate.code === questionSet.exam),
  );
  const exam = EXAMS[examIndex] ?? EXAMS[0];
  // 「出題する回」には、選んでいる試験の問題集だけを並べる。
  const setOptions = questionSetsOf(exam.code);
  /** 試験を選び直したら、その試験の先頭の問題集に移る。 */
  const selectExam = (index: number): void => {
    const first = questionSetsOf(EXAMS[index]?.code ?? "")[0];
    if (first) progressStore.selectSet(first.id);
  };
  // メモの枠は、問題が出ている画面でだけ開く（学習ホームや結果には書く相手がいない）。
  const notesVisible =
    session.notesOpen && session.current !== undefined && session.screen !== "review";

  // 問題や画面が替わったら、右側を上まで戻してから見せる。
  const contentRef = useRef<HTMLDivElement>(null);
  useScrollReset(contentRef, `${session.screen}:${session.index}`);

  return (
    // 幅があるときは画面の高さに収め、サイドバーと右側をそれぞれスクロールさせる。
    // 縦に積まれる狭い幅では、これまでどおりページごとスクロールする。
    //
    // 文字サイズの倍率はここで配る。globals.css の text-read-* が var(--text-scale) を
    // 掛けて出すので、この 1 か所を差し替えれば読む文字だけがまとめて変わる。
    <div
      style={{ "--text-scale": TEXT_SCALE_RATIO[session.textScale] } as CSSProperties}
      className="flex min-h-dvh flex-col text-ink md:h-dvh md:min-h-0 md:overflow-hidden"
    >
      <SiteHeader
        screen={session.screen}
        feedback={session.feedback}
        shuffle={session.shuffle}
        textScale={session.textScale}
        streakLabel={streakLabel(progress.streak)}
        onNavigate={session.setScreen}
        onFeedbackChange={session.setFeedback}
        onShuffleChange={session.setShuffle}
        onTextScaleChange={session.setTextScale}
      />

      <div className="flex flex-1 flex-col md:min-h-0 md:flex-row">
        {/* 単語帳は「どの回を解くか」と関係しないので、左右ともまるごと VocabApp に渡す。 */}
        {session.screen === "vocab" ? (
          <VocabApp />
        ) : (
          <>
            <ExamSidebar
              exams={EXAMS}
              groups={EXAM_GROUPS}
              examIndex={examIndex}
              closedGroups={session.closedGroups}
              onSelectExam={selectExam}
              onToggleGroup={session.toggleGroup}
            />

            <div
              ref={contentRef}
              className="flex min-w-0 flex-1 flex-col md:flex-[999_1_520px] md:overflow-y-auto md:overscroll-contain"
            >
              <main className="flex flex-1 justify-center px-7 pb-16">
                <div className="flex w-full max-w-[1180px] flex-col gap-6">
                  <header className="flex flex-wrap items-baseline gap-3 border-line border-b pt-6 pb-3.5">
                    <span className="font-bold text-[10.5px] text-muted tracking-[0.14em]">
                      {exam.code}
                    </span>
                    <h1 className="font-bold text-[17px] leading-[1.4] tracking-[0.01em]">
                      {exam.name}
                    </h1>
                    <span className="text-[11.5px] text-muted">{exam.sub}</span>
                    <div className="ml-auto self-center">
                      <SelectMenu
                        label="出題する回"
                        value={questionSet.id}
                        options={setOptions.map((option) => ({
                          value: option.id,
                          label: option.label,
                        }))}
                        onChange={progressStore.selectSet}
                      />
                    </div>
                  </header>

                  {(session.screen === "quiz" || session.screen === "explain") && (
                    <ProgressBar
                      answered={session.summary.answered}
                      correct={session.summary.correct}
                      percent={session.summary.percent}
                      total={questionSet.questions.length}
                      index={session.index}
                    />
                  )}

                  {session.screen === "home" && (
                    <HomeScreen
                      setLabel={questionSet.label}
                      questionCount={questionSet.questions.length}
                      answered={session.summary.answered}
                      summary={progress}
                      setSummary={session.summary}
                      hasNotes={session.hasNotes}
                      onStart={session.start}
                      onRestart={session.restart}
                      onGoReview={() => session.setScreen("review")}
                      onClearRecord={clearEverything}
                    />
                  )}

                  {session.screen === "quiz" && session.current && (
                    <QuizScreen
                      items={session.items}
                      item={session.current}
                      order={session.order}
                      index={session.index}
                      isLast={session.isLast}
                      showFeedback={session.feedback === "inline"}
                      onPick={session.pick}
                      onToggleExclude={session.toggleExclude}
                      onToggleFlag={session.toggleFlag}
                      onToggleWeak={session.toggleWeak}
                      notesOpen={notesVisible}
                      written={!isEmptyNote(session.note)}
                      onToggleNotes={session.toggleNotes}
                      onPrev={session.goPrev}
                      onNext={session.goNext}
                      onGoTo={session.goTo}
                    />
                  )}

                  {session.screen === "explain" && session.current && (
                    <ExplainScreen
                      item={session.current}
                      order={session.order}
                      index={session.index}
                      isLast={session.isLast}
                      onToggleFlag={session.toggleFlag}
                      onToggleWeak={session.toggleWeak}
                      notesOpen={notesVisible}
                      written={!isEmptyNote(session.note)}
                      onToggleNotes={session.toggleNotes}
                      onNext={session.goNext}
                    />
                  )}

                  {session.screen === "result" && (
                    <ResultScreen
                      summary={session.summary}
                      total={questionSet.questions.length}
                      elapsed={session.elapsed}
                      onRestart={session.restart}
                      onGoReview={() => session.setScreen("review")}
                    />
                  )}

                  {session.screen === "review" && (
                    <ReviewScreen
                      items={session.items}
                      filter={session.filter}
                      onChangeFilter={session.setFilter}
                      onGoTo={session.goTo}
                    />
                  )}
                </div>
              </main>

              <SiteFooter />
            </div>

            {notesVisible && session.current && (
              <NotePanel
                index={session.index}
                width={record.noteWidth}
                onResize={progressStore.setNoteWidth}
                note={session.note}
                onChangeText={session.setNoteText}
                onAddStroke={session.addStroke}
                onUndoStroke={session.undoStroke}
                onClearSketch={session.clearSketch}
                onClose={session.toggleNotes}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
