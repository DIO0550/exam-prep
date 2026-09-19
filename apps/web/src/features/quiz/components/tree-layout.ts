import type { TreeFigure } from "../types";

/**
 * 木構造の図の座標を決める。
 *
 * 描画（SVG）と分けてあるのは、位置がずれていないかを目で見ずに確かめられるようにするため。
 * 葉を左から順に並べ、親は子の真ん中に置く、という素直な置き方をする。
 * `side` が付いた 2 分木では、片方の子が無くても場所を空けておき、左右が入れ替わって見えないようにする。
 */

/** 節の大きさと間隔（SVG の座標。1 が 1px に対応する）。 */
export const NODE_W = 52;
export const NODE_H = 30;
const GAP_X = 12;
const GAP_Y = 32;
const SLOT_W = NODE_W + GAP_X;
const ROW_H = NODE_H + GAP_Y;

export type PlacedNode = {
  id: string;
  label: string;
  marked: boolean;
  /** 箱の中心の座標。 */
  x: number;
  y: number;
};

export type TreeEdge = { from: string; to: string; x1: number; y1: number; x2: number; y2: number };

export type TreeLayout = {
  nodes: PlacedNode[];
  edges: TreeEdge[];
  width: number;
  height: number;
};

type Node = TreeFigure["nodes"][number];

/** 子の並び。left / right が付いていれば、欠けている側も場所だけ空ける（null が空き）。 */
const childrenOf = (nodes: Node[], id: string): (Node | null)[] => {
  const children = nodes.filter((node) => node.parent === id);
  if (!children.some((child) => child.side)) return children;
  return [
    children.find((child) => child.side === "left") ?? null,
    children.find((child) => child.side === "right") ?? null,
  ];
};

export const layoutTree = ({ nodes }: Pick<TreeFigure, "nodes">): TreeLayout => {
  const root = nodes.find((node) => node.parent === undefined);
  if (!root) return { nodes: [], edges: [], width: 0, height: 0 };

  const placed: PlacedNode[] = [];
  const edges: TreeEdge[] = [];
  let nextSlot = 0;
  let maxDepth = 0;

  /** 節を置いて、その中心の横位置（スロット単位）を返す。 */
  const place = (node: Node, depth: number): number => {
    maxDepth = Math.max(maxDepth, depth);
    const children = childrenOf(nodes, node.id);
    const slots = children.map((child) => (child ? place(child, depth + 1) : nextSlot++));
    const slot = slots.length === 0 ? nextSlot++ : (Math.min(...slots) + Math.max(...slots)) / 2;

    const x = slot * SLOT_W + NODE_W / 2;
    const y = depth * ROW_H + NODE_H / 2;
    placed.push({ id: node.id, label: node.label, marked: node.marked === true, x, y });

    for (const child of children) {
      if (!child) continue;
      const target = placed.find((candidate) => candidate.id === child.id);
      if (!target) continue;
      edges.push({
        from: node.id,
        to: child.id,
        x1: x,
        y1: y + NODE_H / 2,
        x2: target.x,
        y2: target.y - NODE_H / 2,
      });
    }

    return slot;
  };

  place(root, 0);

  return {
    nodes: placed,
    edges,
    width: nextSlot * SLOT_W - GAP_X,
    height: (maxDepth + 1) * ROW_H - GAP_Y,
  };
};
