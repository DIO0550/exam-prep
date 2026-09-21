"use client";

import { useRef, useState } from "react";

import { ProgressBar } from "@/features/quiz/components/progress-bar";
import { SiteFooter } from "@/features/quiz/components/site-footer";
import { useScrollReset } from "@/features/quiz/hooks/use-scroll-reset";

import { DEFAULT_DECK, VOCAB_DECKS } from "../decks";
import { useFlashcards } from "../hooks/use-flashcards";
import { FlashcardDrill } from "./flashcard-drill";
import { FlashcardResult } from "./flashcard-result";
import { FlashcardSetup } from "./flashcard-setup";
import { VocabSidebar } from "./vocab-sidebar";

/**
 * 単語帳。左で単語帳を選び、中央で分野と出題のしかたを決めてフラッシュカードをめくる。
 *
 * 演習側（QuizApp）と同じ組み方にしてある。幅があるときは左右がそれぞれスクロールし、
 * 狭いときは縦に積まれてページごと動く。
 */
export const VocabApp = () => {
  const [deckId, setDeckId] = useState(DEFAULT_DECK.id);
  const deck = VOCAB_DECKS.find((candidate) => candidate.id === deckId) ?? DEFAULT_DECK;
  const session = useFlashcards(deck);

  // 画面や札が替わったら、右側を上まで戻してから見せる。
  const contentRef = useRef<HTMLDivElement>(null);
  useScrollReset(contentRef, `${deck.id}:${session.phase}:${session.index}`);

  return (
    <>
      <VocabSidebar
        decks={VOCAB_DECKS}
        deckId={deck.id}
        weakCount={session.weakCount}
        onSelectDeck={setDeckId}
      />

      <div
        ref={contentRef}
        className="flex min-w-0 flex-1 flex-col md:flex-[999_1_520px] md:overflow-y-auto md:overscroll-contain"
      >
        <main className="flex flex-1 justify-center px-7 pb-16">
          <div className="flex w-full max-w-[860px] flex-col gap-6">
            <header className="flex flex-wrap items-baseline gap-3 border-line border-b pt-6 pb-3.5">
              <span className="font-bold text-[10.5px] text-muted tracking-[0.14em]">単語帳</span>
              <h1 className="font-bold text-[17px] leading-[1.4] tracking-[0.01em]">{deck.name}</h1>
              <span className="text-[11.5px] text-muted">{deck.sub}</span>
            </header>

            {/* 進み具合は演習と同じ帯で出す。置き場所と形が同じなら、画面をまたいでも探さずに済む。 */}
            {session.phase === "drill" && (
              <ProgressBar
                done={session.answered}
                total={session.drawn.length}
                index={session.index}
                unit="枚"
                stat={
                  <>
                    覚えた <span className="font-bold text-ok">{session.okCount}</span>
                    <span className="px-1.5 text-muted-soft">・</span>
                    あやふや{" "}
                    <span className="font-bold text-ng">{session.answered - session.okCount}</span>
                  </>
                }
              />
            )}

            {session.phase === "setup" && <FlashcardSetup deck={deck} session={session} />}
            {session.phase === "drill" && <FlashcardDrill session={session} />}
            {session.phase === "result" && <FlashcardResult session={session} />}
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
};
