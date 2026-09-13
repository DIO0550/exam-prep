"use client";

import { useState } from "react";

import { EXAM } from "../data/exams";
import { STREAK_LABEL } from "../data/progress";
import { QUESTION_SETS } from "../data/questions";
import { useQuizSession } from "../hooks/use-quiz-session";
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
  const [setId, setSetId] = useState(QUESTION_SETS[0].id);
  const questionSet = QUESTION_SETS.find((s) => s.id === setId) ?? QUESTION_SETS[0];
  const session = useQuizSession(questionSet.questions);

  return (
    <div className="flex min-h-dvh flex-col text-ink">
      <SiteHeader
        screen={session.screen}
        feedback={session.feedback}
        streakLabel={STREAK_LABEL}
        onNavigate={session.setScreen}
        onFeedbackChange={session.setFeedback}
      />

      <main className="flex flex-1 justify-center px-7 pb-16">
        <div className="flex w-full max-w-[1180px] flex-col gap-6">
          <header className="flex flex-wrap items-baseline gap-3 border-line border-b pt-6 pb-3.5">
            <span className="font-bold text-[10.5px] text-muted tracking-[0.14em]">
              {EXAM.code}
            </span>
            <h1 className="font-bold text-[17px] leading-[1.4] tracking-[0.01em]">{EXAM.name}</h1>
            <span className="text-[11.5px] text-muted">{EXAM.sub}</span>
            <div className="ml-auto self-center">
              <SelectMenu
                label="出題する回"
                value={setId}
                options={QUESTION_SETS.map((option) => ({
                  value: option.id,
                  label: option.label,
                }))}
                onChange={setSetId}
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
              questionCount={questionSet.questions.length}
              onStart={session.start}
              onGoReview={() => session.setScreen("review")}
            />
          )}

          {session.screen === "quiz" && session.current && (
            <QuizScreen
              items={session.items}
              item={session.current}
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
              onRestart={session.start}
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
  );
};
