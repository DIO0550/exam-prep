"use client";

import { useMemo, useRef } from "react";

import { EXAM_GROUPS, EXAMS } from "../data/exams";
import { QUESTION_BY_ID, QUESTION_SETS } from "../data/questions";
import { useProgress } from "../hooks/use-progress";
import { useQuizSession } from "../hooks/use-quiz-session";
import { useScrollReset } from "../hooks/use-scroll-reset";
import { progressStore } from "../progress/store";
import { streakLabel, summarizeProgress } from "../progress/summary";
import { ExamSidebar } from "./exam-sidebar";
import { ExplainScreen } from "./explain-screen";
import { HomeScreen } from "./home-screen";
import { ProgressBar } from "./progress-bar";
import { QuizScreen } from "./quiz-screen";
import { ResultScreen } from "./result-screen";
import { ReviewScreen } from "./review-screen";
import { SelectMenu } from "./select-menu";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export const QuizApp = () => {
  // 選んでいる回も学習記録の一部として保存する（次に開いたとき同じ回から始められる）。
  const record = useProgress();
  const questionSet = QUESTION_SETS.find((set) => set.id === record.setId) ?? QUESTION_SETS[0];
  const session = useQuizSession(questionSet.questions);
  const progress = useMemo(
    () => summarizeProgress(record, (id) => QUESTION_BY_ID.get(id)),
    [record],
  );
  const exam = EXAMS[session.examIndex] ?? EXAMS[0];

  // 問題や画面が替わったら、右側を上まで戻してから見せる。
  const contentRef = useRef<HTMLDivElement>(null);
  useScrollReset(contentRef, `${session.screen}:${session.index}`);

  return (
    // 幅があるときは画面の高さに収め、サイドバーと右側をそれぞれスクロールさせる。
    // 縦に積まれる狭い幅では、これまでどおりページごとスクロールする。
    <div className="flex min-h-dvh flex-col text-ink md:h-dvh md:min-h-0 md:overflow-hidden">
      <SiteHeader
        screen={session.screen}
        feedback={session.feedback}
        shuffle={session.shuffle}
        streakLabel={streakLabel(progress.streak)}
        onNavigate={session.setScreen}
        onFeedbackChange={session.setFeedback}
        onShuffleChange={session.setShuffle}
      />

      <div className="flex flex-1 flex-col md:min-h-0 md:flex-row">
        <ExamSidebar
          exams={EXAMS}
          groups={EXAM_GROUPS}
          examIndex={session.examIndex}
          closedGroups={session.closedGroups}
          onSelectExam={session.setExamIndex}
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
                    options={QUESTION_SETS.map((option) => ({
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
                  onStart={session.start}
                  onRestart={session.restart}
                  onGoReview={() => session.setScreen("review")}
                  onClearRecord={progressStore.clear}
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
      </div>
    </div>
  );
};
