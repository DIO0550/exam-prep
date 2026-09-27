import type {
  ChartFigure,
  DiagramEdge,
  DiagramFigure,
  DiagramNode,
  DiagramShape,
  FigureTone,
  KarnaughFigure,
  SequenceFigure,
  SequenceStep,
  VennFigure,
} from "./types";
import { DIAGRAM_SHAPES } from "./types";

/**
 * 解説の図（構成図・シーケンス図・グラフ）の位置決め。
 *
 * 描画と切り離してあるのは、データの検査（questions.test.ts）で同じ計算を使うため。
 * 「部品どうしが重なっていないか」「文字が枠からはみ出していないか」は型では落ちないので、
 * 描くときと同じ座標を出して機械で確かめる。
 *
 * 座標の単位は、文字サイズが標準のときの px。SVG はこの座標のまま viewBox に入れ、
 * 表示の大きさは em で決める（文字サイズの設定で図ごと拡大されるようにするため）。
 */

/** 図の中の文字の大きさと行の高さ。 */
export const FONT = 13;
export const LINE = 17;
export const SMALL = 11;
export const SMALL_LINE = 14;

/** 図の外周の余白。 */
export const PAD = 12;

/**
 * 文字列の幅の見積もり（px）。
 *
 * 実際に描いて測れないテストでも使えるよう、字の種類ごとの平均幅で見積もる。
 * 全角は 1 文字 1em、半角は字形ごとにおおよその幅を当てる。狭く見積もると枠から
 * はみ出すので、どれもやや広めに取ってある。
 */
export const textWidth = (text: string, size: number = FONT): number => {
  let em = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (code >= 0x80) {
      // 半角カナは半分、それ以外（かな・漢字・全角記号）は 1 文字 1em。
      em += code >= 0xff61 && code <= 0xff9f ? 0.5 : 1;
    } else if (char === " ") {
      em += 0.28;
    } else if ("MWmw@%".includes(char)) {
      em += 0.86;
    } else if ("iljtfrI!|.,:;'`()[]{}".includes(char)) {
      em += 0.34;
    } else if (/[A-Z]/.test(char)) {
      em += 0.68;
    } else if (/[0-9]/.test(char)) {
      em += 0.58;
    } else if (/[a-z]/.test(char)) {
      em += 0.56;
    } else {
      em += 0.6;
    }
  }
  return em * size;
};

/** ラベルを行に分ける。改行は \n で書く。 */
export const linesOf = (text: string): string[] => text.split("\n");

/** 複数行の文字の、いちばん長い行の幅。 */
export const blockWidth = (text: string, size: number = FONT): number =>
  Math.max(0, ...linesOf(text).map((line) => textWidth(line, size)));

export type Point = { x: number; y: number };
export type Box = { x: number; y: number; w: number; h: number };

/** 2 つの箱が、margin 以上離れずに重なっているか。 */
export const overlaps = (a: Box, b: Box, margin = 0): boolean =>
  a.x < b.x + b.w + margin &&
  b.x < a.x + a.w + margin &&
  a.y < b.y + b.h + margin &&
  b.y < a.y + a.h + margin;

/** a が b の中にすっぽり収まっているか。 */
const inside = (a: Box, b: Box): boolean =>
  a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;

const unionOf = (boxes: Box[]): Box => {
  const x = Math.min(...boxes.map((box) => box.x));
  const y = Math.min(...boxes.map((box) => box.y));
  const right = Math.max(...boxes.map((box) => box.x + box.w));
  const bottom = Math.max(...boxes.map((box) => box.y + box.h));
  return { x, y, w: right - x, h: bottom - y };
};

/** 文字の塊を、中心を指定して置いたときの箱。 */
const textBox = (text: string, center: Point, size = FONT, line = LINE): Box => {
  const w = blockWidth(text, size);
  const h = linesOf(text).length * line;
  return { x: center.x - w / 2, y: center.y - h / 2, w, h };
};

/* ------------------------------------------------------------------ */
/* 構成図                                                               */
/* ------------------------------------------------------------------ */

export const CELL_W = 150;
export const CELL_H = 84;

export type NodeLayout = {
  node: DiagramNode;
  shape: DiagramShape;
  /** 部品の中心。 */
  cx: number;
  cy: number;
  /** 部品そのもの（線が縁に当たる範囲）の幅と高さ。 */
  w: number;
  h: number;
  /** fields を持つ部品の、各欄の幅。 */
  fieldWidths: number[];
  /** 欄を持つ部品の、箱の上に出す見出しの範囲。 */
  headBox?: Box;
  /** 注記の範囲（部品の下か右）。 */
  noteBox?: Box;
  /** 部品と、上の見出し・注記まで含めた範囲。重なりの検査に使う。 */
  bounds: Box;
};

/** 部品の形ごとの大きさ。中の文字が枠に収まるように決める。 */
const sizeOf = (node: DiagramNode, shape: DiagramShape, cellW: number) => {
  if (node.fields) {
    const fieldWidths = node.fields.map((field) => Math.max(34, textWidth(field) + 18));
    return { w: fieldWidths.reduce((sum, width) => sum + width, 0), h: 34, fieldWidths };
  }

  const tw = blockWidth(node.label);
  const th = linesOf(node.label).length * LINE;
  const fixed = node.w ? node.w * cellW - 20 : 0;
  const size = (w: number, h: number) => ({ w: Math.max(w, fixed), h, fieldWidths: [] });

  switch (shape) {
    case "circle": {
      const d = Math.max(44, tw + 18, th + 16);
      return { w: d, h: d, fieldWidths: [] };
    }
    case "diamond": {
      // 文字の箱（半分の大きさ x, y）がひし形に収まる条件 x/a + y/b ≤ 1 から、a と b を決める。
      const x = tw / 2 + 6;
      const y = th / 2 + 3;
      return size(Math.max(72, 2 * 1.7 * x), 2 * (y / (1 - 1 / 1.7)));
    }
    case "db":
      return size(Math.max(64, tw + 28), th + 30);
    case "actor":
      return size(Math.max(40, tw + 8), 38 + th);
    case "cloud":
      return size(Math.max(96, tw + 52), Math.max(54, th + 34));
    case "text":
      return size(tw + 8, th + 6);
    case "round":
      return size(Math.max(64, tw + 32), Math.max(34, th + 14));
    default:
      return size(Math.max(64, tw + 24), Math.max(34, th + 14));
  }
};

const layoutNode = (node: DiagramNode, cellW: number, cellH: number): NodeLayout => {
  const shape = node.shape ?? "box";
  const { w, h, fieldWidths } = sizeOf(node, shape, cellW);
  const cx = node.col * cellW;
  const cy = node.row * cellH;

  const body = { x: cx - w / 2, y: cy - h / 2, w, h };
  // 欄を持つ部品の見出しは、箱の上に小さく出す。
  const headBox =
    node.fields && node.label !== ""
      ? textBox(node.label, { x: cx, y: cy - h / 2 - 4 - SMALL_LINE / 2 }, SMALL, SMALL_LINE)
      : undefined;
  let noteBox: Box | undefined;
  if (node.note) {
    const lines = linesOf(node.note).length;
    if (node.notePlace === "right") {
      // 右に置く注記は左寄せで、部品の縦の真ん中にそろえる。
      const noteW = blockWidth(node.note, SMALL);
      noteBox = {
        x: cx + w / 2 + 6,
        y: cy - (lines * SMALL_LINE) / 2,
        w: noteW,
        h: lines * SMALL_LINE,
      };
    } else {
      noteBox = textBox(
        node.note,
        { x: cx, y: cy + h / 2 + 4 + (lines * SMALL_LINE) / 2 },
        SMALL,
        SMALL_LINE,
      );
    }
  }
  const parts = [body, headBox, noteBox].filter((part): part is Box => part !== undefined);

  return { node, shape, cx, cy, w, h, fieldWidths, headBox, noteBox, bounds: unionOf(parts) };
};

/**
 * 部品の中心から外の点へ向かう線が、部品の縁と交わる点。
 * 線は部品の中心どうしを結ぶ向きで引き、縁で切って端にする。
 */
export const clipToNode = (layout: NodeLayout, toward: Point): Point => {
  const dx = toward.x - layout.cx;
  const dy = toward.y - layout.cy;
  if (dx === 0 && dy === 0) return { x: layout.cx, y: layout.cy };
  const a = layout.w / 2;
  const b = layout.h / 2;

  let t: number;
  switch (layout.shape) {
    case "circle":
      t = a / Math.hypot(dx, dy);
      break;
    case "diamond":
      t = 1 / (Math.abs(dx) / a + Math.abs(dy) / b);
      break;
    case "cloud":
      t = 1 / Math.hypot(dx / a, dy / (b * 0.92));
      break;
    default:
      t = Math.min(dx === 0 ? Infinity : a / Math.abs(dx), dy === 0 ? Infinity : b / Math.abs(dy));
  }
  // 行き先が部品の中にあるときは、縁まで伸ばさず中心から出す。
  if (t >= 1) return { x: layout.cx, y: layout.cy };
  return { x: layout.cx + dx * t, y: layout.cy + dy * t };
};

/** 欄の中心の x。fromField の矢印はここから出す。 */
export const fieldCenter = (layout: NodeLayout, index: number): Point => {
  const left = layout.cx - layout.w / 2;
  const before = layout.fieldWidths.slice(0, index).reduce((sum, width) => sum + width, 0);
  return { x: left + before + (layout.fieldWidths[index] ?? 0) / 2, y: layout.cy };
};

export type EdgeLayout = {
  edge: DiagramEdge;
  /** 折れ線の点。bend のあるときは [始点, 制御点, 終点]。 */
  points: Point[];
  curved: boolean;
  selfLoop: boolean;
  /** ラベルの中心。 */
  labelAt: Point;
  /** × を付ける位置。 */
  blockAt: Point;
  labelBox?: Box;
};

const quadAt = (p0: Point, p1: Point, p2: Point, t: number): Point => ({
  x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x,
  y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y,
});

const cubicAt = (p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point => ({
  x:
    (1 - t) ** 3 * p0.x + 3 * (1 - t) ** 2 * t * p1.x + 3 * (1 - t) * t ** 2 * p2.x + t ** 3 * p3.x,
  y:
    (1 - t) ** 3 * p0.y + 3 * (1 - t) ** 2 * t * p1.y + 3 * (1 - t) * t ** 2 * p2.y + t ** 3 * p3.y,
});

const pathLength = (points: Point[]): number =>
  points.slice(1).reduce((sum, point, index) => {
    const prev = points[index] as Point;
    return sum + Math.hypot(point.x - prev.x, point.y - prev.y);
  }, 0);

/** 折れ線を、始点から全長の fraction のところで切った残り（始点側）。 */
const truncateAlong = (points: Point[], fraction: number): Point[] => {
  let rest = pathLength(points) * fraction;
  const kept: Point[] = [points[0] as Point];
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1] as Point;
    const to = points[index] as Point;
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    if (rest <= length) {
      const t = length === 0 ? 0 : rest / length;
      kept.push({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });
      return kept;
    }
    kept.push(to);
    rest -= length;
  }
  return kept;
};

/** 折れ線の上で、始点から全長の fraction だけ進んだ点。 */
export const pointAlong = (points: Point[], fraction: number): Point => {
  const lengths = points.slice(1).map((point, index) => {
    const prev = points[index] as Point;
    return Math.hypot(point.x - prev.x, point.y - prev.y);
  });
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let rest = total * fraction;
  for (const [index, length] of lengths.entries()) {
    const from = points[index] as Point;
    const to = points[index + 1] as Point;
    if (rest <= length || index === lengths.length - 1) {
      const t = length === 0 ? 0 : Math.min(1, rest / length);
      return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
    }
    rest -= length;
  }
  return points[0] ?? { x: 0, y: 0 };
};

/** 自分へ戻る線（状態遷移の「同じ状態のまま」）の、制御点を含む 4 点。 */
export const selfLoopPoints = (layout: NodeLayout): [Point, Point, Point, Point] => {
  const top = layout.cy - layout.h / 2;
  const spread = Math.min(12, layout.w / 4);
  return [
    { x: layout.cx - spread, y: top + (layout.shape === "circle" ? 3 : 0) },
    { x: layout.cx - spread - 26, y: top - 40 },
    { x: layout.cx + spread + 26, y: top - 40 },
    { x: layout.cx + spread, y: top + (layout.shape === "circle" ? 3 : 0) },
  ];
};

const layoutEdge = (
  edge: DiagramEdge,
  nodes: Map<string, NodeLayout>,
  cellW: number,
  cellH: number,
): EdgeLayout | undefined => {
  const from = nodes.get(edge.from);
  const to = nodes.get(edge.to);
  if (!from || !to) return undefined;
  const labelFraction = edge.labelAt ?? 0.5;

  if (from === to) {
    const [p0, p1, p2, p3] = selfLoopPoints(from);
    const top = cubicAt(p0, p1, p2, p3, 0.5);
    const labelAt = edge.label
      ? { x: top.x, y: top.y - 6 - (linesOf(edge.label).length * LINE) / 2 }
      : top;
    return {
      edge,
      points: [p0, p1, p2, p3],
      curved: true,
      selfLoop: true,
      labelAt,
      blockAt: top,
      labelBox: edge.label ? textBox(edge.label, labelAt) : undefined,
    };
  }

  const start = edge.fromField !== undefined ? fieldCenter(from, edge.fromField) : undefined;
  const via = (edge.via ?? []).map(([col, row]) => ({ x: col * cellW, y: row * cellH }));
  const fromCenter = start ?? { x: from.cx, y: from.cy };
  const toCenter = { x: to.cx, y: to.cy };

  let points: Point[];
  let curved = false;
  if (edge.bend && via.length === 0) {
    const mid = { x: (fromCenter.x + toCenter.x) / 2, y: (fromCenter.y + toCenter.y) / 2 };
    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    const length = Math.hypot(dx, dy) || 1;
    // 進む向きの左（画面の座標は y が下向きなので、(dy, -dx) が左）。
    const control = {
      x: mid.x + (dy / length) * edge.bend * cellW,
      y: mid.y + (-dx / length) * edge.bend * cellW,
    };
    points = [start ?? clipToNode(from, control), control, clipToNode(to, control)];
    curved = true;
  } else {
    const first = via[0] ?? toCenter;
    const last = via[via.length - 1] ?? fromCenter;
    points = [start ?? clipToNode(from, first), ...via, clipToNode(to, last)];
  }

  const along = (fraction: number): Point =>
    curved
      ? quadAt(points[0] as Point, points[1] as Point, points[2] as Point, fraction)
      : pointAlong(points, fraction);
  const labelAt = along(labelFraction);

  // 遮断される線は、行き先の手前に × を置き、線はそこで止める（届かないことを形で見せる）。
  let blockAt = along(0.72);
  if (edge.blocked && !curved) {
    const total = pathLength(points);
    const fraction = Math.max(0.55, 1 - 22 / (total || 1));
    blockAt = pointAlong(points, fraction);
    points = truncateAlong(points, fraction);
  }

  return {
    edge,
    points,
    curved,
    selfLoop: false,
    labelAt,
    blockAt,
    labelBox: edge.label ? textBox(edge.label, labelAt) : undefined,
  };
};

export type GroupLayout = { box: Box; labelBox: Box };

const shrink = (box: Box, by: number): Box => ({
  x: box.x + by,
  y: box.y + by,
  w: Math.max(0, box.w - by * 2),
  h: Math.max(0, box.h - by * 2),
});

/** 線分が箱と交わるか（Liang–Barsky の切り取り）。 */
export const segmentHitsBox = (a: Point, b: Point, box: Box): boolean => {
  let t0 = 0;
  let t1 = 1;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const edges: [number, number][] = [
    [-dx, a.x - box.x],
    [dx, box.x + box.w - a.x],
    [-dy, a.y - box.y],
    [dy, box.y + box.h - a.y],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
  }
  return true;
};

/** 線を折れ線に直したもの。曲線は細かく刻んで近似する。 */
const edgePolyline = (edge: EdgeLayout): Point[] => {
  if (!edge.curved) return edge.points;
  const [p0, p1, p2] = edge.points as [Point, Point, Point];
  return Array.from({ length: 13 }, (_, index) => quadAt(p0, p1, p2, index / 12));
};

export type DiagramLayout = {
  nodes: Map<string, NodeLayout>;
  edges: EdgeLayout[];
  groups: GroupLayout[];
  /** viewBox に入れる範囲。 */
  view: Box;
};

export const layoutDiagram = (figure: DiagramFigure): DiagramLayout => {
  const cellW = figure.cell?.w ?? CELL_W;
  const cellH = figure.cell?.h ?? CELL_H;

  const nodes = new Map(
    figure.nodes.map((node) => [node.id, layoutNode(node, cellW, cellH)] as const),
  );
  const edges = (figure.edges ?? [])
    .map((edge) => layoutEdge(edge, nodes, cellW, cellH))
    .filter((edge): edge is EdgeLayout => edge !== undefined);
  const groups = (figure.groups ?? []).map((group) => {
    const box = {
      x: (group.col - 0.5) * cellW + 6,
      y: (group.row - 0.5) * cellH + 2,
      w: group.w * cellW - 12,
      h: group.h * cellH - 4,
    };
    const labelW = textWidth(group.label, SMALL) + 4;
    return { box, labelBox: { x: box.x + 8, y: box.y + 4, w: labelW, h: SMALL_LINE } };
  });

  const boxes: Box[] = [
    ...[...nodes.values()].map((node) => node.bounds),
    ...groups.map((group) => group.box),
    ...edges.flatMap((edge) => [
      ...edge.points.map((point) => ({ x: point.x, y: point.y, w: 0, h: 0 })),
      ...(edge.labelBox ? [edge.labelBox] : []),
    ]),
  ];
  const all = boxes.length > 0 ? unionOf(boxes) : { x: 0, y: 0, w: 0, h: 0 };
  const view = { x: all.x - PAD, y: all.y - PAD, w: all.w + PAD * 2, h: all.h + PAD * 2 };

  return { nodes, edges, groups, view };
};

/**
 * 構成図の書き間違いを拾う。空の配列なら問題なし。
 *
 * 部品の重なり、囲みの枠をまたぐ部品、線のラベルと部品の重なりは、描いてみるまで
 * 気付けないので、ここで先に落とす。
 */
export const diagramProblems = (figure: DiagramFigure): string[] => {
  const problems: string[] = [];
  const ids = figure.nodes.map((node) => node.id);
  const duplicated = ids.filter((id, index) => ids.indexOf(id) !== index);
  for (const id of duplicated) problems.push(`部品 ${id} が重複している`);

  for (const node of figure.nodes) {
    if (node.shape && !DIAGRAM_SHAPES.includes(node.shape)) {
      problems.push(`部品 ${node.id} の形 ${node.shape} は描けない`);
    }
    if (node.fields && node.fields.length === 0) problems.push(`部品 ${node.id} の欄が空`);
    if (!node.fields && node.label.trim() === "") problems.push(`部品 ${node.id} のラベルが空`);
  }

  for (const edge of figure.edges ?? []) {
    for (const end of [edge.from, edge.to]) {
      if (!ids.includes(end)) problems.push(`線 ${edge.from}→${edge.to} の ${end} が無い`);
    }
    if (edge.fromField !== undefined) {
      const fields = figure.nodes.find((node) => node.id === edge.from)?.fields;
      if (!fields || edge.fromField < 0 || edge.fromField >= fields.length) {
        problems.push(`線 ${edge.from}→${edge.to} の fromField が欄を指していない`);
      }
    }
  }

  const layout = layoutDiagram(figure);
  const placed = [...layout.nodes.values()];

  for (const [index, a] of placed.entries()) {
    for (const b of placed.slice(index + 1)) {
      if (overlaps(a.bounds, b.bounds, 6)) {
        problems.push(`部品 ${a.node.id} と ${b.node.id} が近すぎる（重なっている）`);
      }
    }
  }

  for (const [index, group] of layout.groups.entries()) {
    const label = figure.groups?.[index]?.label ?? "";
    if (group.labelBox.x + group.labelBox.w > group.box.x + group.box.w - 6) {
      problems.push(`囲み「${label}」の見出しが枠の幅に収まらない`);
    }
    for (const node of placed) {
      const body = { x: node.cx - node.w / 2, y: node.cy - node.h / 2, w: node.w, h: node.h };
      if (overlaps(body, group.box) && !inside(node.bounds, group.box)) {
        problems.push(`部品 ${node.node.id} が囲み「${label}」の枠をまたいでいる`);
      }
      if (overlaps(node.bounds, group.labelBox, 2)) {
        problems.push(`部品 ${node.node.id} が囲み「${label}」の見出しに重なっている`);
      }
    }
  }

  // 線が、端の部品以外の部品・注記・見出しの上を通っていないか。通っていると、どこへ
  // つながる線なのか、どの注記の文字なのかが読めなくなる。
  for (const edge of layout.edges) {
    if (edge.selfLoop) continue;
    const name = `線 ${edge.edge.from}→${edge.edge.to}`;
    const path = edgePolyline(edge);
    const crosses = (box: Box) =>
      path.slice(1).some((point, index) => segmentHitsBox(path[index] as Point, point, box));
    for (const node of placed) {
      const isEnd = node.node.id === edge.edge.from || node.node.id === edge.edge.to;
      const body = {
        x: node.cx - node.w / 2 + 3,
        y: node.cy - node.h / 2 + 3,
        w: node.w - 6,
        h: node.h - 6,
      };
      if (!isEnd && crosses(body)) problems.push(`${name} が部品 ${node.node.id} の上を通っている`);
      if (node.noteBox && crosses(shrink(node.noteBox, 1))) {
        problems.push(`${name} が部品 ${node.node.id} の注記を横切っている`);
      }
      if (node.headBox && crosses(shrink(node.headBox, 1))) {
        problems.push(`${name} が部品 ${node.node.id} の見出しを横切っている`);
      }
    }
    for (const [index, group] of layout.groups.entries()) {
      if (crosses(shrink(group.labelBox, 1))) {
        problems.push(
          `${name} が囲み「${figure.groups?.[index]?.label ?? ""}」の見出しを横切っている`,
        );
      }
    }
  }

  const labelled = layout.edges.filter((edge) => edge.labelBox);
  for (const [index, edge] of labelled.entries()) {
    const box = edge.labelBox as Box;
    for (const node of placed) {
      if (overlaps(box, node.bounds, 1)) {
        problems.push(
          `線 ${edge.edge.from}→${edge.edge.to} のラベル「${edge.edge.label}」が部品 ${node.node.id} に重なっている`,
        );
      }
    }
    for (const other of labelled.slice(index + 1)) {
      if (overlaps(box, other.labelBox as Box, 1)) {
        problems.push(`線のラベル「${edge.edge.label}」と「${other.edge.label}」が重なっている`);
      }
    }
    for (const group of layout.groups) {
      if (overlaps(box, group.labelBox, 1)) {
        problems.push(`線のラベル「${edge.edge.label}」が囲みの見出しに重なっている`);
      }
    }
  }

  return problems;
};

/* ------------------------------------------------------------------ */
/* シーケンス図                                                         */
/* ------------------------------------------------------------------ */

/** やり取りに振る番号。①〜㉟ を使い、それを超えたら括弧書きにする。 */
export const stepNumber = (n: number): string => {
  if (n >= 1 && n <= 20) return String.fromCodePoint(0x2460 + n - 1);
  if (n >= 21 && n <= 35) return String.fromCodePoint(0x3251 + n - 21);
  return `(${n})`;
};

const isMessage = (step: SequenceStep): step is Extract<SequenceStep, { from: string }> =>
  "from" in step;
const isNote = (step: SequenceStep): step is Extract<SequenceStep, { over: unknown }> =>
  "over" in step;

export type SequenceRow =
  | {
      kind: "message";
      step: Extract<SequenceStep, { from: string }>;
      number: number;
      /** 番号を付けたラベル。 */
      text: string;
      x1: number;
      x2: number;
      /** 矢印の高さ。 */
      y: number;
      labelBox: Box;
      self: boolean;
    }
  | { kind: "note"; step: Extract<SequenceStep, { over: unknown }>; box: Box }
  | { kind: "divider"; label: string; y: number };

export type SequenceLayout = {
  actors: { label: string; x: number; box: Box }[];
  rows: SequenceRow[];
  /** 生存線の下端。 */
  bottom: number;
  view: Box;
};

const SEQ_GAP = 132;
const SELF_LOOP_W = 30;

export const layoutSequence = (figure: SequenceFigure): SequenceLayout => {
  const count = figure.actors.length;
  const heads = figure.actors.map((label) => ({
    w: Math.max(84, blockWidth(label) + 26),
    h: linesOf(label).length * LINE + 14,
  }));
  const headH = Math.max(...heads.map((head) => head.h));
  const indexOf = (actor: string) => figure.actors.indexOf(actor);

  // 隣どうしの間隔。見出しの箱が並ぶ幅と、その間を渡るやり取りのラベルが入る幅を確保する。
  const gaps = Array.from({ length: Math.max(0, count - 1) }, (_, index) =>
    Math.max(SEQ_GAP, ((heads[index]?.w ?? 0) + (heads[index + 1]?.w ?? 0)) / 2 + 24),
  );
  let rightExtra = 0;
  let number = 0;
  const texts = figure.steps.map((step) => {
    if (!isMessage(step)) return "";
    number += 1;
    return `${stepNumber(number)} ${step.label}`;
  });

  for (const [index, step] of figure.steps.entries()) {
    if (!isMessage(step)) continue;
    const a = indexOf(step.from);
    const b = indexOf(step.to);
    if (a < 0 || b < 0) continue;
    const need = blockWidth(texts[index] ?? "") + 28;
    if (a === b) {
      const room = need + SELF_LOOP_W - 10;
      if (a < count - 1) gaps[a] = Math.max(gaps[a] ?? 0, room);
      else rightExtra = Math.max(rightExtra, room);
      continue;
    }
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const span = gaps.slice(lo, hi).reduce((sum, gap) => sum + gap, 0);
    if (span < need) {
      const add = (need - span) / (hi - lo);
      for (let gap = lo; gap < hi; gap += 1) gaps[gap] = (gaps[gap] ?? 0) + add;
    }
  }

  const xs = figure.actors.map((_, index) =>
    gaps.slice(0, index).reduce((sum, gap) => sum + gap, 0),
  );
  const actors = figure.actors.map((label, index) => {
    const head = heads[index] ?? { w: 0, h: 0 };
    const x = xs[index] ?? 0;
    return { label, x, box: { x: x - head.w / 2, y: 0, w: head.w, h: headH } };
  });

  const rows: SequenceRow[] = [];
  let y = headH + 16;
  number = 0;
  for (const [index, step] of figure.steps.entries()) {
    if (isMessage(step)) {
      number += 1;
      const text = texts[index] ?? "";
      const x1 = xs[indexOf(step.from)] ?? 0;
      const x2 = xs[indexOf(step.to)] ?? 0;
      const lines = linesOf(text).length;
      const w = blockWidth(text);
      if (x1 === x2) {
        // 自分への矢印は右へ張り出す輪にして、ラベルはその右に出す。
        const h = Math.max(lines * LINE, 24);
        const labelBox = { x: x1 + SELF_LOOP_W + 8, y, w, h: lines * LINE };
        rows.push({ kind: "message", step, number, text, x1, x2, y, labelBox, self: true });
        y += h + 20;
      } else {
        const labelBox = { x: (x1 + x2) / 2 - w / 2, y, w, h: lines * LINE };
        const arrowY = y + lines * LINE + 6;
        rows.push({
          kind: "message",
          step,
          number,
          text,
          x1,
          x2,
          y: arrowY,
          labelBox,
          self: false,
        });
        y = arrowY + 18;
      }
    } else if (isNote(step)) {
      const ends = step.over.map((actor) => xs[indexOf(actor)] ?? 0);
      const left = Math.min(...ends);
      const right = Math.max(...ends);
      const w = Math.max(blockWidth(step.note) + 22, right - left + (ends.length > 1 ? 40 : 0));
      const h = linesOf(step.note).length * LINE + 12;
      rows.push({ kind: "note", step, box: { x: (left + right) / 2 - w / 2, y, w, h } });
      y += h + 14;
    } else {
      rows.push({ kind: "divider", label: step.divider, y: y + 8 });
      y += 32;
    }
  }

  const bottom = y + 4;
  const boxes: Box[] = [
    ...actors.map((actor) => actor.box),
    ...rows.flatMap((row) => {
      if (row.kind === "message") return [row.labelBox];
      if (row.kind === "note") return [row.box];
      const w = textWidth(row.label, SMALL) + 16;
      return [{ x: -w / 2, y: row.y - 8, w, h: 16 }];
    }),
    { x: (xs[count - 1] ?? 0) + rightExtra, y: bottom, w: 0, h: 0 },
  ];
  const all = unionOf(boxes);
  const view = { x: all.x - PAD, y: all.y - PAD, w: all.w + PAD * 2, h: all.h + PAD * 2 };

  return { actors, rows, bottom, view };
};

export const sequenceProblems = (figure: SequenceFigure): string[] => {
  const problems: string[] = [];
  if (figure.actors.length < 2) problems.push("登場人物が 2 つ未満");
  if (new Set(figure.actors).size !== figure.actors.length) problems.push("登場人物が重複している");
  for (const step of figure.steps) {
    const named = isMessage(step) ? [step.from, step.to] : isNote(step) ? step.over : [];
    for (const actor of named) {
      if (!figure.actors.includes(actor)) problems.push(`登場人物「${actor}」が並びに無い`);
    }
    if (isMessage(step) && step.label.trim() === "") problems.push("ラベルの無いやり取りがある");
  }
  if (!figure.steps.some(isMessage)) problems.push("やり取りが 1 つも無い");
  const messages = figure.steps.filter(isMessage).length;
  if (messages > 35) problems.push("やり取りが多すぎる（番号は 35 まで）");
  return problems;
};

/* ------------------------------------------------------------------ */
/* グラフ                                                               */
/* ------------------------------------------------------------------ */

export const PLOT_W = 420;
export const PLOT_H = 230;

export type ChartLabel = {
  kind: "series" | "mark" | "guide" | "area";
  text: string;
  /** 文字の基準の位置と揃え。描くときはこの値をそのまま SvgText に渡す。 */
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  box: Box;
  /** 塗る範囲の名前だけが持つ、範囲と同じ色。 */
  tone?: FigureTone;
};

export type ChartLayout = {
  /** 描く範囲（軸の内側）。 */
  plot: Box;
  sx: (value: number) => number;
  sy: (value: number) => number;
  /** 図の中に出す名前（系列・目印・基準線・塗る範囲）。重なりの検査にも使う。 */
  labels: ChartLabel[];
  view: Box;
};

/** 系列の名前を出す点。 */
export const seriesLabelPoint = (series: ChartFigure["series"][number]): [number, number] =>
  series.points[series.labelAt ?? series.points.length - 1] ?? [0, 0];

const tickText = (axis: ChartFigure["x"], index: number, value: number): string =>
  axis.tickLabels?.[index] ?? value.toLocaleString("ja-JP");

export const chartTickText = tickText;

/** 文字の基準の位置と揃えから、文字の塊の箱を出す（SvgText と同じく縦は真ん中にそろう）。 */
const anchoredBox = (
  text: string,
  x: number,
  y: number,
  anchor: "start" | "middle" | "end",
): Box => {
  const w = blockWidth(text, SMALL);
  const h = linesOf(text).length * SMALL_LINE;
  const left = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2;
  return { x: left, y: y - h / 2, w, h };
};

/** 名前を点のどちら側に出すかから、基準の位置と揃えを決める。 */
const placeAt = (
  place: "right" | "left" | "above" | "below" | undefined,
  x: number,
  y: number,
  lift: number,
) => {
  switch (place) {
    case "above":
      return { x, y: y - 14, anchor: "middle" as const };
    case "below":
      return { x, y: y + 16, anchor: "middle" as const };
    case "left":
      return { x: x - 9, y: y - lift, anchor: "end" as const };
    default:
      return { x: x + 9, y: y - lift, anchor: "start" as const };
  }
};

export const layoutChart = (figure: ChartFigure): ChartLayout => {
  const yTickW = Math.max(
    0,
    ...(figure.y.ticks ?? []).map((value, index) =>
      textWidth(tickText(figure.y, index, value), SMALL),
    ),
  );
  const left = Math.max(30, yTickW + 14);
  const top = 30;
  const plot = { x: left, y: top, w: figure.plot?.w ?? PLOT_W, h: figure.plot?.h ?? PLOT_H };
  const sx = (value: number) =>
    plot.x + ((value - figure.x.min) / (figure.x.max - figure.x.min)) * plot.w;
  const sy = (value: number) =>
    plot.y + plot.h - ((value - figure.y.min) / (figure.y.max - figure.y.min)) * plot.h;

  const labels: ChartLabel[] = [];
  const push = (
    kind: ChartLabel["kind"],
    text: string,
    at: { x: number; y: number; anchor: "start" | "middle" | "end" },
    tone?: FigureTone,
  ) => {
    if (text === "") return;
    labels.push({ kind, text, ...at, box: anchoredBox(text, at.x, at.y, at.anchor), tone });
  };

  for (const series of figure.series) {
    if (series.kind === "bar") continue;
    const [x, y] = seriesLabelPoint(series);
    push("series", series.label, placeAt(series.labelPlace, sx(x), sy(y), 0));
  }
  for (const mark of figure.marks ?? []) {
    push("mark", mark.label, placeAt(mark.place, sx(mark.x), sy(mark.y), 9));
  }
  for (const guide of figure.guides ?? []) {
    if (!guide.label) continue;
    if (guide.x !== undefined) {
      push("guide", guide.label, { x: sx(guide.x), y: plot.y - 10, anchor: "middle" });
    } else if (guide.y !== undefined) {
      push("guide", guide.label, { x: plot.x + plot.w + 6, y: sy(guide.y), anchor: "start" });
    }
  }
  for (const area of figure.areas ?? []) {
    if (!area.label) continue;
    const [x, y] = area.labelAt ?? [
      area.points.reduce((sum, [px]) => sum + px, 0) / area.points.length,
      area.points.reduce((sum, [, py]) => sum + py, 0) / area.points.length,
    ];
    push("area", area.label, { x: sx(x), y: sy(y), anchor: "middle" }, area.tone ?? "accent");
  }

  // 縦軸の名前は軸の上に左寄せ、横軸の名前は軸の下に右寄せで出す（どちらも横書きのまま）。
  const all = unionOf([
    { x: 0, y: 0, w: plot.x + plot.w + 14, h: plot.y + plot.h + 50 },
    { x: 0, y: 0, w: textWidth(figure.y.label, SMALL), h: 1 },
    ...labels.map((label) => label.box),
  ]);
  const view = { x: all.x - PAD / 2, y: all.y, w: all.w + PAD, h: all.h };
  return { plot, sx, sy, labels, view };
};

export const chartProblems = (figure: ChartFigure): string[] => {
  const problems: string[] = [];
  const within = (value: number, axis: ChartFigure["x"]) =>
    value >= axis.min - 1e-9 && value <= axis.max + 1e-9;
  if (figure.x.max <= figure.x.min) problems.push("横軸の範囲が逆になっている");
  if (figure.y.max <= figure.y.min) problems.push("縦軸の範囲が逆になっている");

  for (const axis of [figure.x, figure.y]) {
    for (const value of axis.ticks ?? []) {
      if (!within(value, axis)) problems.push(`「${axis.label}」の目盛り ${value} が範囲の外`);
    }
    if (axis.tickLabels && axis.tickLabels.length !== (axis.ticks ?? []).length) {
      problems.push(`「${axis.label}」の目盛りの文字の数が目盛りと合わない`);
    }
  }

  for (const series of figure.series) {
    if (series.points.length === 0) problems.push(`系列「${series.label}」に点が無い`);
    for (const [x, y] of series.points) {
      if (!within(x, figure.x) || !within(y, figure.y)) {
        problems.push(`系列「${series.label}」の点 (${x}, ${y}) が軸の範囲の外`);
      }
    }
    if (series.kind === "curve") {
      const xs = series.points.map(([x]) => x);
      if (xs.some((x, index) => index > 0 && x <= (xs[index - 1] ?? x))) {
        problems.push(`曲線「${series.label}」の点が左から右へ並んでいない`);
      }
    }
    if (series.labelAt !== undefined && !series.points[series.labelAt]) {
      problems.push(`系列「${series.label}」の labelAt が点を指していない`);
    }
  }

  for (const mark of figure.marks ?? []) {
    if (!within(mark.x, figure.x) || !within(mark.y, figure.y)) {
      problems.push(`目印「${mark.label}」が軸の範囲の外`);
    }
  }
  for (const guide of figure.guides ?? []) {
    if ((guide.x === undefined) === (guide.y === undefined)) {
      problems.push("基準線は x か y のどちらか一方だけを持つ");
    }
    if (guide.x !== undefined && !within(guide.x, figure.x)) problems.push("縦の基準線が範囲の外");
    if (guide.y !== undefined && !within(guide.y, figure.y)) problems.push("横の基準線が範囲の外");
  }
  for (const area of figure.areas ?? []) {
    if (area.points.length < 3) problems.push(`塗る範囲「${area.label ?? ""}」の点が 3 つ未満`);
    for (const [x, y] of area.points) {
      if (!within(x, figure.x) || !within(y, figure.y)) {
        problems.push(`塗る範囲「${area.label ?? ""}」が軸の範囲の外`);
      }
    }
  }

  // 図の中の名前（線の横・目印・基準線・塗る範囲）どうしが重なって読めなくなっていないか。
  const { labels } = layoutChart(figure);
  for (const [index, a] of labels.entries()) {
    for (const b of labels.slice(index + 1)) {
      if (overlaps(a.box, b.box, 1)) problems.push(`名前「${a.text}」と「${b.text}」が重なる`);
    }
  }
  if (figure.series.length > 4) problems.push("系列が 4 つを超えている（色が見分けられない）");

  return problems;
};

/* ------------------------------------------------------------------ */
/* ベン図                                                               */
/* ------------------------------------------------------------------ */

export const vennProblems = (figure: VennFigure): string[] => {
  const problems: string[] = [];
  const letters = figure.sets.length === 2 ? ["A", "B"] : ["A", "B", "C"];
  if (figure.panels.length === 0) problems.push("塗り分けが 1 つも無い");
  for (const panel of figure.panels) {
    for (const region of panel.shaded) {
      if (region === "0") {
        if (!figure.universe) problems.push("全体集合が無いのに、どれにも入らない部分を塗っている");
        continue;
      }
      if ([...region].some((letter) => !letters.includes(letter))) {
        problems.push(`塗る部分「${region}」が集合の数と合わない`);
      }
    }
  }
  return problems;
};

/* ------------------------------------------------------------------ */
/* カルノー図                                                           */
/* ------------------------------------------------------------------ */

/** 変数の数に応じたグレイコードの並び（隣どうしが 1 ビットだけ違う順）。 */
export const grayCodes = (count: number): string[] =>
  count === 1 ? ["0", "1"] : ["00", "01", "11", "10"];

/** まとめ（"-1-1" の形）から、項の文字（"B・D"）を作る。否定は上線（U+0305）で書く。 */
export const termLabel = (term: string, variables: string[]): string => {
  const parts = [...term]
    .map((bit, index) => {
      const name = variables[index] ?? "";
      if (bit === "1") return name;
      // 否定の上線は名前の全部の字に掛ける（x₁ なら x と ₁ の両方）。
      if (bit === "0") return [...name].map((char) => `${char}\u0305`).join("");
      return "";
    })
    .filter((part) => part !== "");
  return parts.length === 0 ? "1" : parts.join("・");
};

/** まとめが覆うマス（画面の並びでの [行, 列]）。 */
export const coveredCells = (
  figure: Pick<KarnaughFigure, "rows" | "cols">,
  term: string,
): [number, number][] => {
  const rowCodes = grayCodes(figure.rows.length);
  const colCodes = grayCodes(figure.cols.length);
  const matches = (code: string, pattern: string) =>
    [...code].every((bit, index) => pattern[index] === "-" || pattern[index] === bit);
  const rowPattern = term.slice(0, figure.rows.length);
  const colPattern = term.slice(figure.rows.length);
  const cells: [number, number][] = [];
  for (const [row, rowCode] of rowCodes.entries()) {
    if (!matches(rowCode, rowPattern)) continue;
    for (const [col, colCode] of colCodes.entries()) {
      if (matches(colCode, colPattern)) cells.push([row, col]);
    }
  }
  return cells;
};

/**
 * 並びの上で連続する範囲に分ける。端をまたぐまとめ（両端の列など）は 2 つに分かれ、
 * それぞれ図の縁で開いた形に描く。
 */
export const runsOf = (indexes: number[]): { from: number; to: number }[] => {
  const sorted = [...new Set(indexes)].sort((a, b) => a - b);
  const runs: { from: number; to: number }[] = [];
  for (const index of sorted) {
    const last = runs[runs.length - 1];
    if (last && index === last.to + 1) last.to = index;
    else runs.push({ from: index, to: index });
  }
  return runs;
};

export const karnaughProblems = (figure: KarnaughFigure): string[] => {
  const problems: string[] = [];
  const variables = [...figure.rows, ...figure.cols];
  if (figure.rows.length < 1 || figure.rows.length > 2) problems.push("行の変数は 1〜2 個");
  if (figure.cols.length < 1 || figure.cols.length > 2) problems.push("列の変数は 1〜2 個");
  if (new Set(variables).size !== variables.length) problems.push("変数の名前が重複している");

  const height = 2 ** figure.rows.length;
  const width = 2 ** figure.cols.length;
  if (figure.values.length !== height) problems.push(`行の数が ${height} ではない`);
  for (const [index, row] of figure.values.entries()) {
    if (row.length !== width) problems.push(`${index + 1} 行目のマスの数が ${width} ではない`);
    if (!/^[01-]*$/.test(row)) problems.push(`${index + 1} 行目に 0・1・- 以外の文字がある`);
  }

  const covered = new Set<string>();
  for (const term of figure.groups ?? []) {
    if (term.length !== variables.length || !/^[01-]+$/.test(term)) {
      problems.push(`まとめ「${term}」の形が変数の数と合わない`);
      continue;
    }
    const cells = coveredCells(figure, term);
    const values = cells.map(([row, col]) => figure.values[row]?.[col]);
    if (values.some((value) => value === "0")) {
      problems.push(`まとめ「${termLabel(term, variables)}」が 0 のマスを含んでいる`);
    }
    if (!values.includes("1")) problems.push(`まとめ「${termLabel(term, variables)}」に 1 が無い`);
    for (const [row, col] of cells) covered.add(`${row}-${col}`);
  }

  if ((figure.groups ?? []).length > 0) {
    for (const [row, line] of figure.values.entries()) {
      for (const [col, value] of [...line].entries()) {
        if (value === "1" && !covered.has(`${row}-${col}`)) {
          problems.push(`${row + 1} 行 ${col + 1} 列の 1 がどのまとめにも入っていない`);
        }
      }
    }
  }
  return problems;
};
