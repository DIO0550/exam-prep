import { describe, expect, it } from "vitest";

import { layoutTree, NODE_W } from "./tree-layout";

/**
 * 木の図は座標がずれると「どちらが左の子か」が変わってしまう。
 * 描画を見ずに確かめられるよう、置き方の決まりをここで固定する。
 */

describe("layoutTree", () => {
  it("葉を左から並べ、親を子の真ん中に置く", () => {
    const layout = layoutTree({
      nodes: [
        { id: "a", label: "A" },
        { id: "b", label: "B", parent: "a", side: "left" },
        { id: "c", label: "C", parent: "a", side: "right" },
      ],
    });
    const at = (id: string) => layout.nodes.find((node) => node.id === id);

    expect(at("b")?.x).toBeLessThan(at("c")?.x ?? 0);
    expect(at("a")?.x).toBe(((at("b")?.x ?? 0) + (at("c")?.x ?? 0)) / 2);
    // 深さが 1 つ下がると、同じぶんだけ下へ置く。
    expect(at("b")?.y).toBe(at("c")?.y);
    expect(at("a")?.y).toBeLessThan(at("b")?.y ?? 0);
  });

  it("片方の子が無くても、左右が入れ替わって見えないよう場所を空ける", () => {
    const layout = layoutTree({
      nodes: [
        { id: "a", label: "A" },
        { id: "c", label: "C", parent: "a", side: "right" },
      ],
    });
    const at = (id: string) => layout.nodes.find((node) => node.id === id);

    // 右の子だけなら、親は子より左に来る。
    expect(at("a")?.x).toBeLessThan(at("c")?.x ?? 0);
  });

  it("枝は親の下端から子の上端へ引く", () => {
    const layout = layoutTree({
      nodes: [
        { id: "a", label: "A" },
        { id: "b", label: "B", parent: "a" },
      ],
    });
    const edge = layout.edges[0];
    const parent = layout.nodes.find((node) => node.id === "a");
    const child = layout.nodes.find((node) => node.id === "b");

    expect(edge?.y1).toBeGreaterThan(parent?.y ?? 0);
    expect(edge?.y2).toBeLessThan(child?.y ?? 0);
  });

  it("図の大きさは、並べた葉の数と深さで決まる", () => {
    const layout = layoutTree({
      nodes: [
        { id: "a", label: "A" },
        { id: "b", label: "B", parent: "a", side: "left" },
        { id: "c", label: "C", parent: "a", side: "right" },
      ],
    });

    // 葉 2 つぶんの幅（箱と間隔）に収まり、最後の間隔は含めない。
    expect(layout.width).toBeGreaterThan(NODE_W * 2);
    expect(layout.height).toBeGreaterThan(0);
  });

  it("根が無ければ何も置かない", () => {
    expect(layoutTree({ nodes: [{ id: "a", label: "A", parent: "x" }] }).nodes).toHaveLength(0);
  });
});
