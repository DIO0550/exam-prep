"use client";

import { useCallback, useMemo, useState } from "react";

import type { CardLimit, CardMode, CardOrder, DeckSettings } from "../deck";
import { allCards, buildDeck } from "../deck";
import type { Card, VocabDeck } from "../types";
import { weakStore } from "../weak/store";
import { useWeak } from "./use-weak";

export type Phase = "setup" | "drill" | "result";

/** 1 枚ごとの手ごたえ。 */
export type Verdict = "ok" | "ng";

const DEFAULT_SETTINGS = (deck: VocabDeck): DeckSettings => ({
  mode: "略語 → 正式名称",
  categories: deck.groups.map((group) => group.id),
  order: "シャッフル",
  limit: 50,
  weakOnly: false,
});

/**
 * フラッシュカードの状態。
 *
 * 「あやふや」だけはこの端末に残す（weakStore）。どこまでめくったかは残さない。
 * 途中から再開するより、配り直して最初からめくるほうが単語帳の使い方に合うため。
 */
export const useFlashcards = (deck: VocabDeck) => {
  const weak = useWeak();
  const weakIds = useMemo(() => new Set(weak.ids), [weak.ids]);
  const cards = useMemo(() => allCards(deck.groups), [deck.groups]);

  const [settings, setSettings] = useState<DeckSettings>(() => DEFAULT_SETTINGS(deck));
  const [phase, setPhase] = useState<Phase>("setup");
  const [drawn, setDrawn] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});

  // 単語帳を選び直したら、設定ごと初めの状態に戻す。
  const [loadedFor, setLoadedFor] = useState(deck);
  if (loadedFor !== deck) {
    setLoadedFor(deck);
    setSettings(DEFAULT_SETTINGS(deck));
    setPhase("setup");
    setDrawn([]);
    setIndex(0);
    setFlipped(false);
    setVerdicts({});
  }

  /** 今の設定で配ったら何枚になるか。設定画面の「開始する」の下に出す。 */
  const poolSize = useMemo(
    () =>
      cards.filter(
        (card) =>
          settings.categories.includes(card.group.id) &&
          (!settings.weakOnly || weakIds.has(card.id)),
      ).length,
    [cards, settings.categories, settings.weakOnly, weakIds],
  );

  const weakCount = weak.ids.length;
  const current = drawn[index];
  const answered = drawn.filter((card) => verdicts[card.id] !== undefined).length;
  const okCount = drawn.filter((card) => verdicts[card.id] === "ok").length;
  const missed = useMemo(
    () => drawn.filter((card) => verdicts[card.id] === "ng"),
    [drawn, verdicts],
  );

  /** 渡された札でめくり始める。 */
  const begin = useCallback((next: Card[]) => {
    setDrawn(next);
    setIndex(0);
    setFlipped(false);
    setVerdicts({});
    setPhase(next.length === 0 ? "setup" : "drill");
  }, []);

  const start = useCallback(() => {
    begin(buildDeck(cards, settings, weakIds));
  }, [begin, cards, settings, weakIds]);

  /** 同じ札をもう一度。並びはそのままで、手ごたえだけ捨てる。 */
  const again = useCallback(() => begin(drawn), [begin, drawn]);

  /** 「あやふや」だった札だけもう一周。 */
  const againMissed = useCallback(() => begin(missed), [begin, missed]);

  const toSetup = useCallback(() => setPhase("setup"), []);

  const flip = useCallback(() => setFlipped(true), []);

  const next = useCallback(() => {
    setFlipped(false);
    setIndex((prev) => {
      if (prev + 1 >= drawn.length) {
        setPhase("result");
        return prev;
      }
      return prev + 1;
    });
  }, [drawn.length]);

  const prev = useCallback(() => {
    setFlipped(false);
    setIndex((current) => Math.max(0, current - 1));
  }, []);

  /** 手ごたえを付けて次へ。「あやふや」はこの端末に残り、「覚えた」で外れる。 */
  const answer = useCallback(
    (verdict: Verdict) => {
      if (!current || !flipped) return;
      setVerdicts((prev) => ({ ...prev, [current.id]: verdict }));
      weakStore.mark(current.id, verdict === "ng");
      next();
    },
    [current, flipped, next],
  );

  const setMode = useCallback((mode: CardMode) => setSettings((prev) => ({ ...prev, mode })), []);
  const setOrder = useCallback(
    (order: CardOrder) => setSettings((prev) => ({ ...prev, order })),
    [],
  );
  const setLimit = useCallback(
    (limit: CardLimit) => setSettings((prev) => ({ ...prev, limit })),
    [],
  );
  const setWeakOnly = useCallback(
    (weakOnly: boolean) => setSettings((prev) => ({ ...prev, weakOnly })),
    [],
  );

  const toggleCategory = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((kept) => kept !== id)
        : [...prev.categories, id],
    }));
  }, []);

  const selectAllCategories = useCallback(() => {
    setSettings((prev) => ({ ...prev, categories: deck.groups.map((group) => group.id) }));
  }, [deck.groups]);

  const clearCategories = useCallback(() => {
    setSettings((prev) => ({ ...prev, categories: [] }));
  }, []);

  return {
    settings,
    phase,
    drawn,
    index,
    current,
    flipped,
    verdicts,
    poolSize,
    weakCount,
    weakIds,
    answered,
    okCount,
    missed,
    isLast: index + 1 >= drawn.length,
    setMode,
    setOrder,
    setLimit,
    setWeakOnly,
    toggleCategory,
    selectAllCategories,
    clearCategories,
    start,
    again,
    againMissed,
    toSetup,
    flip,
    answer,
    next,
    prev,
  };
};

export type FlashcardSession = ReturnType<typeof useFlashcards>;
