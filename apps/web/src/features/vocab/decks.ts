import { ABBR_GROUPS } from "./data/abbreviations";
import { countEntries } from "./deck";
import type { VocabDeck } from "./types";

/**
 * 単語帳の一覧。左のパネルに並ぶ。
 *
 * 今は応用情報の略語だけ。ほかの試験の単語帳を足すときは、同じ形でここに 1 つ足す。
 */
const AP_ACRONYM: VocabDeck = {
  id: "ap-acronym",
  name: "応用情報 略語",
  sub: `略語 ${countEntries(ABBR_GROUPS)} 語`,
  groups: ABBR_GROUPS,
};

export const VOCAB_DECKS: VocabDeck[] = [AP_ACRONYM];

/** 最初に開く単語帳。 */
export const DEFAULT_DECK = AP_ACRONYM;
