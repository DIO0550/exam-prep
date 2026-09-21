import { describe, expect, it } from "vitest";

import { ABBR_GROUPS } from "./data/abbreviations";
import type { DeckSettings } from "./deck";
import { allCards, buildDeck, cardId, countEntries } from "./deck";

const CARDS = allCards(ABBR_GROUPS);
const ALL_CATEGORIES = ABBR_GROUPS.map((group) => group.id);

const settings = (patch: Partial<DeckSettings> = {}): DeckSettings => ({
  mode: "略語 → 正式名称",
  categories: ALL_CATEGORIES,
  order: "収録順",
  limit: "すべて",
  weakOnly: false,
  ...patch,
});

/** 並びを確かめたいときの、決まった順で値を返す乱数。 */
const fixedRandom = (values: number[]): (() => number) => {
  let index = 0;
  return () => values[index++ % values.length] ?? 0;
};

describe("略語データ", () => {
  it("360 語あり、札の ID が重複しない", () => {
    expect(countEntries(ABBR_GROUPS)).toBe(360);
    expect(new Set(CARDS.map((card) => card.id)).size).toBe(360);
  });

  it("どの語にも正式名称・日本語・説明がそろっている", () => {
    for (const { entry } of CARDS) {
      expect(entry.full, `${entry.abbr} の正式名称`).not.toBe("");
      expect(entry.ja, `${entry.abbr} の日本語`).not.toBe("");
      expect(entry.desc, `${entry.abbr} の説明`).not.toBe("");
    }
  });

  it("頭字語の位置は正式名称の中に収まり、重複しない", () => {
    for (const { entry } of CARDS) {
      expect(new Set(entry.acronym).size, `${entry.abbr} の頭字語の位置`).toBe(
        entry.acronym.length,
      );
      for (const at of entry.acronym) {
        expect(at, `${entry.abbr} の頭字語の位置`).toBeGreaterThanOrEqual(0);
        expect(at, `${entry.abbr} の頭字語の位置`).toBeLessThan(entry.full.length);
      }
    }
  });

  it("頭字語は略語の字をなぞる（数字や X で置いた語は除く）", () => {
    // 2PC・M2M・O2O・W3C は数字が語を表し、XSS・DX は X が Cross / Trans を表す。
    // ISO は正式名称の頭字語ではない（ギリシャ語の isos 由来）ので、そもそも印が付かない。
    const irregular = new Set(["2PC", "M2M", "O2O", "W3C", "XSS", "DX", "ISO"]);
    for (const { entry } of CARDS) {
      if (irregular.has(entry.abbr)) continue;
      const spelled = entry.acronym
        .map((at) => entry.full[at])
        .join("")
        .toUpperCase();
      expect(spelled, `${entry.abbr} の頭字語`).toBe(
        entry.abbr.replace(/[^A-Za-z0-9]/g, "").toUpperCase(),
      );
    }
  });
});

describe("札の配り方", () => {
  it("選んだ分野の語だけを配る", () => {
    const deck = buildDeck(CARDS, settings({ categories: ["db"] }), new Set());
    expect(deck.length).toBe(21);
    for (const card of deck) expect(card.group.id).toBe("db");
  });

  it("分野を 1 つも選んでいなければ 1 枚も配らない", () => {
    expect(buildDeck(CARDS, settings({ categories: [] }), new Set())).toEqual([]);
  });

  it("枚数の上限で切る", () => {
    expect(buildDeck(CARDS, settings({ limit: 20 }), new Set())).toHaveLength(20);
    expect(buildDeck(CARDS, settings({ limit: 100 }), new Set())).toHaveLength(100);
    expect(buildDeck(CARDS, settings({ limit: "すべて" }), new Set())).toHaveLength(360);
  });

  it("収録順ならデータの並びのまま出す", () => {
    const deck = buildDeck(CARDS, settings({ limit: 20 }), new Set());
    expect(deck.map((card) => card.entry.abbr).slice(0, 3)).toEqual(["CPU", "MPU", "GPU"]);
  });

  it("シャッフルすると並びが変わり、札の顔ぶれは変わらない", () => {
    const deck = buildDeck(
      CARDS,
      settings({ order: "シャッフル", categories: ["db"] }),
      new Set(),
      fixedRandom([0.1, 0.9, 0.3, 0.7, 0.5]),
    );
    const plain = buildDeck(CARDS, settings({ categories: ["db"] }), new Set());

    expect(deck.map((card) => card.id)).not.toEqual(plain.map((card) => card.id));
    expect(new Set(deck.map((card) => card.id))).toEqual(new Set(plain.map((card) => card.id)));
  });

  it("「あやふや」だけに絞ると、印の付いた札だけ配る", () => {
    const weak = new Set([cardId("db", "DBMS"), cardId("nw", "TCP")]);
    const deck = buildDeck(CARDS, settings({ weakOnly: true }), weak);

    expect(deck.map((card) => card.entry.abbr).sort()).toEqual(["DBMS", "TCP"]);
  });
});
