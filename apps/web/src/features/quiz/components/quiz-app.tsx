"use client";

import type { CSSProperties } from "react";
import { useMemo, useRef } from "react";

import { BackupPanel } from "@/features/backup/components/backup-panel";
import { exportAll, exportSet, importBackup } from "@/features/backup/restore";
import { downloadBackup, readBackupFile } from "@/features/backup/transfer";
import { DbDrillApp } from "@/features/db-drill/components/db-drill-app";
import { dbDrillStore } from "@/features/db-drill/store";
import { pmAnswerStore } from "@/features/pm-past/answers";
import { PmPastApp } from "@/features/pm-past/components/pm-past-app";
import { pmRecordStore } from "@/features/pm-past/store";
import { VocabApp } from "@/features/vocab/components/vocab-app";

import { EXAM_GROUPS, EXAMS } from "../data/exams";
import { QUESTION_SETS, questionSetsOf } from "../data/questions";
import { drawPool, drawQuestions } from "../draw";
import { useDrawSettings } from "../hooks/use-draw-settings";
import { useProgress } from "../hooks/use-progress";
import { useQuizKeys } from "../hooks/use-quiz-keys";
import { useQuizSession } from "../hooks/use-quiz-session";
import { useScrollReset } from "../hooks/use-scroll-reset";
import { isEmptyNote } from "../notes/note";
import { noteStore } from "../notes/store";
import { progressStore } from "../progress/store";
import { streakLabel, summarizeProgress } from "../progress/summary";
import { TEXT_SCALE_RATIO } from "../text-scale";
import { sourceId } from "../types";
import { DrawSetup } from "./draw-setup";
import { ExamSidebar } from "./exam-sidebar";
import { ExplainScreen } from "./explain-screen";
import { HomeScreen } from "./home-screen";
import { NotePanel } from "./note-panel";
import { ProgressBar } from "./progress-bar";
import { QuizScreen } from "./quiz-screen";
import { ResultScreen } from "./result-screen";
import { RetryBanner } from "./retry-banner";
import { ReviewScreen } from "./review-screen";
import { SelectMenu } from "./select-menu";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { WeakPicker } from "./weak-picker";

/**
 * 学習ホームに出す 1 問あたりの目安（秒）。載せていない試験は 90 秒。
 * 応用情報の午後は 150 分で 5 問（1 問 30 分）、1 問に設問が 8〜10 個ほどなので、1 設問 3 分と見る。
 */
const SECONDS_PER_QUESTION: Record<string, number> = { GAIP: 60, APPM: 180 };

/**
 * 「学習記録を消す」で消すもの。メモも本人がこのブラウザに残したものなので一緒に消す。
 * 午後の過去問題を解いた記録と、穴埋めドリルの記録も学習記録の一つなので、ここに含める。
 */
const clearEverything = (): void => {
  progressStore.clear();
  noteStore.clear();
  pmRecordStore.clear();
  pmAnswerStore.clear();
  dbDrillStore.clear();
};

export const QuizApp = () => {
  // 選んでいる回も学習記録の一部として保存する（次に開いたとき同じ回から始められる）。
  const record = useProgress();
  const questionSet = QUESTION_SETS.find((set) => set.id === record.setId) ?? QUESTION_SETS[0];
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
  // 全回をまたいだ解き直しに使う、選んでいる試験のすべての問題。
  const examQuestions = useMemo(
    () => questionSetsOf(exam.code).flatMap((set) => set.questions),
    [exam.code],
  );
  const session = useQuizSession(questionSet.questions, examQuestions);
  // 演習中は、選択肢の選択・解答・前後の移動をキーだけでもできるようにする。
  useQuizKeys(session);
  // ランダム出題は、選んでいる試験の問題集をまたいで引く。
  const draw = useDrawSettings(exam.code, setOptions);
  const startDraw = (): void =>
    session.startDraw(drawQuestions(drawPool(setOptions, draw.settings), draw.settings.count));
  /** 試験を選び直したら、その試験の先頭の問題集に移る。 */
  const selectExam = (index: number): void => {
    const first = questionSetsOf(EXAMS[index]?.code ?? "")[0];
    if (first) progressStore.selectSet(first.id);
  };
  // 応用情報 午後の過去問ページと SQL・表の穴埋めドリルは、試験の一覧の「応用情報技術者試験 午後」の
  // 下に置く。問題集ではないので、開いている間はどの試験も選択中にしない。
  const pmPastOpen = session.screen === "pm-past";
  const dbDrillOpen = session.screen === "db-drill";
  const extraOpen = pmPastOpen || dbDrillOpen;
  const sidebar = (
    <ExamSidebar
      exams={EXAMS}
      groups={EXAM_GROUPS}
      examIndex={extraOpen ? -1 : examIndex}
      closedGroups={session.closedGroups}
      onSelectExam={(index) => {
        selectExam(index);
        if (extraOpen) session.setScreen("home");
      }}
      onToggleGroup={session.toggleGroup}
      extras={[
        {
          after: "APPM",
          badge: "過去",
          name: "応用情報 午後 過去問",
          sub: "IPA の公開問題 ・ 記述式",
          selected: pmPastOpen,
          onSelect: () => session.setScreen("pm-past"),
        },
        {
          after: "APPM",
          badge: "穴埋",
          name: "応用情報 SQL・表 穴埋め",
          sub: "午後 問6 対策 ・ 自動採点",
          selected: dbDrillOpen,
          onSelect: () => session.setScreen("db-drill"),
        },
      ]}
    />
  );

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
        ) : session.screen === "pm-past" ? (
          // 午後の過去問題は記述式なので、演習の画面とは別に組む。左の試験の一覧はそのまま出す。
          <PmPastApp sidebar={sidebar} />
        ) : session.screen === "db-drill" ? (
          // SQL・表の穴埋めドリルも、空欄に書いて答え合わせする形なので演習の画面とは別に組む。
          <DbDrillApp sidebar={sidebar} />
        ) : (
          <>
            {sidebar}

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

                  {session.focusKind && session.screen !== "home" && (
                    <RetryBanner
                      kind={session.focusKind}
                      count={session.items.length}
                      unrecorded={session.focusUnrecorded}
                      onExit={() => session.setScreen("home")}
                    />
                  )}

                  {(session.screen === "quiz" || session.screen === "explain") && (
                    <ProgressBar
                      done={session.summary.answered}
                      total={session.items.length}
                      index={session.index}
                      unit="問"
                      stat={
                        session.summary.answered === 0 ? (
                          "正答率 —"
                        ) : (
                          <>
                            正答率{" "}
                            <span className="font-bold text-ink">{session.summary.percent}%</span>
                            <span className="pl-1.5 text-muted-soft">
                              （{session.summary.correct}/{session.summary.answered}問）
                            </span>
                          </>
                        )
                      }
                    />
                  )}

                  {session.screen === "home" && (
                    <HomeScreen
                      setLabel={questionSet.label}
                      questionCount={questionSet.questions.length}
                      multipleCount={
                        questionSet.questions.filter((question) => Array.isArray(question.answer))
                          .length
                      }
                      secondsPerQuestion={SECONDS_PER_QUESTION[questionSet.exam] ?? 90}
                      answered={session.summary.answered}
                      summary={progress}
                      setSummary={session.summary}
                      hasNotes={session.hasNotes}
                      retryCounts={session.retryCounts}
                      setCount={setOptions.length}
                      allRetryCounts={session.allRetryCounts}
                      retryRandom={session.retryRandom}
                      onRetryRandomChange={session.setRetryRandom}
                      retryRecord={session.retryRecord}
                      onRetryRecordChange={session.setRetryRecord}
                      onRetry={(kind) => session.startRetry(kind, session.retryRandom)}
                      onRetryAll={(kind) => session.startRetryAll(kind, session.retryRandom)}
                      onGoWeakPick={() => session.setScreen("weak-pick")}
                      onGoDraw={() => session.setScreen("draw")}
                      backup={
                        <BackupPanel
                          setLabel={questionSet.label}
                          onExportAll={() => downloadBackup(exportAll())}
                          onExportSet={() =>
                            downloadBackup(
                              exportSet({
                                id: questionSet.id,
                                label: questionSet.label,
                                questionIds: questionSet.questions.map((question) =>
                                  sourceId(question.source),
                                ),
                              }),
                            )
                          }
                          onRead={readBackupFile}
                          onImport={importBackup}
                        />
                      }
                      onStart={session.start}
                      onRestart={session.restart}
                      onGoReview={() => session.setScreen("review")}
                      onClearRecord={clearEverything}
                      onClearNotes={noteStore.clear}
                    />
                  )}

                  {session.screen === "draw" && (
                    <DrawSetup
                      sets={setOptions}
                      settings={draw.settings}
                      onChange={draw.setSettings}
                      onStart={startDraw}
                      onCancel={() => session.setScreen("home")}
                    />
                  )}

                  {session.screen === "weak-pick" && (
                    <WeakPicker
                      questions={session.weakQuestions}
                      onStart={session.startPicked}
                      onCancel={() => session.setScreen("home")}
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
                      onSubmit={session.submit}
                      onUndoPick={session.canUndoPick ? session.undoPick : undefined}
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
                      onUndoPick={session.canUndoPick ? session.undoPick : undefined}
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
                      total={session.items.length}
                      elapsed={session.elapsed}
                      // 間違えた・苦手な問題だけの正答率は、合格ラインと比べても意味が無いので合否を出さない。
                      // ランダム出題は範囲から無作為に引いたものなので、本番の目安として合否を出す。
                      passLine={
                        session.focusKind && session.focusKind !== "draw"
                          ? undefined
                          : exam.passLine
                      }
                      wrongCount={session.retryCounts.wrong}
                      onRestart={session.restart}
                      onRetryWrong={() => session.startRetry("wrong")}
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
