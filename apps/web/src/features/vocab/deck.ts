import type { AbbrGroup, Card } from "./types";

/** 出題形式。元の単語帳と同じ 3 通り。 */
export const CARD_MODES = ["略語 → 正式名称", "略語 → 意味", "正式名称 → 略語"] as const;
export type CardMode = (typeof CARD_MODES)[number];

/** 表に出す問いかけ。 */
export const ASK_OF: Record<CardMode, string> = {
  "略語 → 正式名称": "何の略？　正式名称をスペルアウトすると？",
  "略語 → 意味": "どういう意味？",
  "正式名称 → 略語": "この正式名称の略語は？",
};

/** 配る順。 */
export const CARD_ORDERS = ["シャッフル", "収録順"] as const;
export type CardOrder = (typeof CARD_ORDERS)[number];

/** 1 回で配る枚数。"すべて" は選んだ分野を全部。 */
export const CARD_LIMITS = [20, 50, 100, "すべて"] as const;
export type CardLimit = (typeof CARD_LIMITS)[number];

export type DeckSettings = {
  mode: CardMode;
  /** 出題する分野（AbbrGroup の id）。空なら 1 枚も配らない。 */
  categories: string[];
  order: CardOrder;
  limit: CardLimit;
  /** 「あやふや」を付けた語だけ配るか。 */
  weakOnly: boolean;
};

export const cardId = (groupId: string, abbr: string): string => `${groupId}:${abbr}`;

export const countEntries = (groups: AbbrGroup[]): number =>
  groups.reduce((total, group) => total + group.entries.length, 0);

/** 分類をまたいで全部の札にする。 */
export const allCards = (groups: AbbrGroup[]): Card[] =>
  groups.flatMap((group) =>
    group.entries.map((entry) => ({ id: cardId(group.id, entry.abbr), entry, group })),
  );

/** Fisher-Yates。並びは毎回変わってよいので、種は持たない（見直す相手が無いため）。 */
const shuffled = (cards: Card[], random: () => number): Card[] => {
  const rest = [...cards];
  for (let index = rest.length - 1; index > 0; index -= 1) {
    const pick = Math.floor(random() * (index + 1));
    const here = rest[index];
    const there = rest[pick];
    if (here === undefined || there === undefined) continue;
    rest[index] = there;
    rest[pick] = here;
  }
  return rest;
};

/** 設定どおりに札を配る。weak は「あやふや」を付けた札の ID。 */
export const buildDeck = (
  cards: Card[],
  settings: DeckSettings,
  weak: Set<string>,
  random: () => number = Math.random,
): Card[] => {
  const picked = cards.filter(
    (card) =>
      settings.categories.includes(card.group.id) && (!settings.weakOnly || weak.has(card.id)),
  );
  const ordered = settings.order === "シャッフル" ? shuffled(picked, random) : picked;
  return settings.limit === "すべて" ? ordered : ordered.slice(0, settings.limit);
};
