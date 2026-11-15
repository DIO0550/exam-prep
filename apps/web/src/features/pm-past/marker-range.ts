/**
 * マーカーの位置（文字数）と、画面の範囲（DOM の Range）の行き来。
 *
 * 問題文の欄（area）の中の文字の並び（area.textContent と同じもの）で何文字目かを数える。
 * 選んだ所を文字数に直すのも、文字数から塗る範囲を作るのも同じ数え方にしているので、
 * 空欄の枠や読み上げ用の「（主キー）」のような、目に見えない文字が混ざっていてもずれない。
 */

export type Offsets = { start: number; end: number };

/** area の中の文字の節（Text）を、並んでいる順に。 */
const textNodes = (area: Node): Text[] => {
  const walker = document.createTreeWalker(area, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text);
  return nodes;
};

/** area の頭から (node, offset) までの文字数。 */
const offsetAt = (area: Node, node: Node, offset: number): number => {
  const before = document.createRange();
  before.setStart(area, 0);
  before.setEnd(node, offset);
  // Range の toString は、範囲に入る Text の中身をそのままつないだもの（textContent と同じ数え方）
  return before.toString().length;
};

/** (node, offset) を area の中に収める。前にはみ出していれば頭、後ろなら末尾。 */
const clampPoint = (
  area: Node,
  whole: Range,
  node: Node,
  offset: number,
): { node: Node; offset: number } => {
  const side = whole.comparePoint(node, offset);
  if (side < 0) return { node: area, offset: 0 };
  if (side > 0) return { node: area, offset: area.childNodes.length };
  return { node, offset };
};

/** 選んだ範囲のうち area に入る所を、文字数で返す。area に掛かっていなければ null。 */
export const offsetsIn = (area: Node, range: Range): Offsets | null => {
  const whole = document.createRange();
  whole.selectNodeContents(area);
  let from: { node: Node; offset: number };
  let to: { node: Node; offset: number };
  try {
    from = clampPoint(area, whole, range.startContainer, range.startOffset);
    to = clampPoint(area, whole, range.endContainer, range.endOffset);
  } catch {
    // 別の文書（iframe など）の中を選んでいる
    return null;
  }
  const start = offsetAt(area, from.node, from.offset);
  const end = offsetAt(area, to.node, to.offset);
  return end > start ? { start, end } : null;
};

/** いま選んでいる所のうち、area に入る所。選んでいなければ null。 */
export const selectedOffsets = (area: Node | null): Offsets | null => {
  const selection = document.getSelection();
  if (!area || !selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
  return offsetsIn(area, selection.getRangeAt(0));
};

/** area の start 文字目から end 文字目の手前までを覆う範囲。文字が足りなければ null。 */
export const rangeAt = (area: Node, start: number, end: number): Range | null => {
  const range = document.createRange();
  let position = 0;
  let started = false;
  for (const node of textNodes(area)) {
    const next = position + node.data.length;
    // 節の境目に当たる頭は次の節の頭に、末尾は前の節の末尾に置く（間の目に見えない節を含めない）
    if (!started && start < next) {
      range.setStart(node, start - position);
      started = true;
    }
    if (started && end <= next) {
      range.setEnd(node, end - position);
      return range;
    }
    position = next;
  }
  return null;
};

/** (x, y) が range の文字の上にあるか。字の並ぶ箱（行ごと）で見る。 */
export const rangeContainsPoint = (range: Range, x: number, y: number): boolean => {
  // jsdom など、配置を持たない環境には getClientRects が無い
  if (typeof range.getClientRects !== "function") return false;
  return Array.from(range.getClientRects()).some(
    (rect) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom,
  );
};
