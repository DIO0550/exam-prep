import { describe, expect, it } from "vitest";

import { choiceOrder, isShuffled, naturalOrder, positionOf, shuffledOrder } from "./choice-order";

/** 4 択の問題を 100 問ぶん。並びの偏りは 1 問では見えないので、まとめて見る。 */
const IDS = Array.from({ length: 100 }, (_, index) => `ap-r07-aki-am-${index + 1}`);

describe("naturalOrder", () => {
  it("原本のままの並びを返す", () => {
    expect(naturalOrder(4)).toEqual([0, 1, 2, 3]);
  });
});

describe("shuffledOrder", () => {
  it("原本の添字を過不足なく並べ替える", () => {
    for (const id of IDS) {
      expect([...shuffledOrder(4, id, 0)].sort()).toEqual([0, 1, 2, 3]);
    }
  });

  it("同じ問題・同じ種なら、何度呼んでも同じ並びになる", () => {
    expect(shuffledOrder(4, "ap-r07-aki-am-01", 3)).toEqual(
      shuffledOrder(4, "ap-r07-aki-am-01", 3),
    );
  });

  it("問題ごとに違う並びになる（全問が同じ入れ替え方にならない）", () => {
    const orders = new Set(IDS.map((id) => shuffledOrder(4, id, 0).join()));

    expect(orders.size).toBeGreaterThan(10);
  });

  it("種を進めると、ほとんどの問題で並びが変わる", () => {
    const changed = IDS.filter(
      (id) => shuffledOrder(4, id, 0).join() !== shuffledOrder(4, id, 1).join(),
    );

    // 4 択なので偶然一致するものが 1 割弱ある。それを踏まえても大半は変わる
    expect(changed.length).toBeGreaterThan(60);
  });

  it("原本と同じ並びになる問題は、ごく一部にとどまる", () => {
    const kept = IDS.filter((id) => !isShuffled(shuffledOrder(4, id, 0)));

    expect(kept.length).toBeLessThan(15);
  });
});

describe("choiceOrder", () => {
  it("シャッフルしない設定なら原本のまま", () => {
    expect(choiceOrder(4, "ap-r07-aki-am-01", 5, false)).toEqual([0, 1, 2, 3]);
  });

  it("シャッフルする設定なら並べ替えた順を返す", () => {
    expect(choiceOrder(4, "ap-r07-aki-am-01", 5, true)).toEqual(
      shuffledOrder(4, "ap-r07-aki-am-01", 5),
    );
  });
});

describe("positionOf", () => {
  it("原本の添字が、今どこに出ているかを返す", () => {
    expect(positionOf([2, 0, 3, 1], 2)).toBe(0);
    expect(positionOf([2, 0, 3, 1], 1)).toBe(3);
  });

  it("並びに無い添字はそのまま返す", () => {
    expect(positionOf([2, 0, 3, 1], 7)).toBe(7);
  });
});

describe("isShuffled", () => {
  it("原本のままなら false、1 つでもずれていれば true", () => {
    expect(isShuffled([0, 1, 2, 3])).toBe(false);
    expect(isShuffled([0, 1, 3, 2])).toBe(true);
  });
});
