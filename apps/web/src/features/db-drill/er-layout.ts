import type { Box, Point } from "@/features/quiz/figure-layout";
import { FONT, overlaps, PAD, textWidth } from "@/features/quiz/figure-layout";

import type { DbColumn, DbEntity, DbRelation } from "./types";

/**
 * E-R 図の配置。エンティティを格子に並べ、関連の線の端と空欄の枠の位置を決める。
 * 描画（er-figure.tsx）とテストの両方から使うので、ここでは数だけを扱う。
 */

/** エンティティ名の段の高さ。 */
export const NAME_H = 30;
/** 属性 1 行の高さ。 */
export const ATTR_H = 23;
/** 箱の左右の余白。 */
export const BOX_PAD_X = 14;
const BOX_PAD_BOTTOM = 8;
const MIN_W = 112;
/** 空欄の枠の大きさ。 */
export const BLANK_W = 46;
export const BLANK_H = 22;
/** 箱どうしの間隔。間に空欄の枠と矢印が収まるだけ空ける。 */
const GAP_X = 92;
const GAP_Y = 72;

/** `{{a}}` だけの文字列なら、その空欄の名前。 */
export const blankName = (text: string): string | undefined => text.match(/^\{\{([^}]+)\}\}$/)?.[1];

/** 文字の幅。空欄は枠の幅。 */
const labelWidth = (text: string, bold = false): number =>
  blankName(text) !== undefined ? BLANK_W : textWidth(text, FONT) * (bold ? 1.06 : 1);

const entitySize = (entity: DbEntity): { w: number; h: number } => {
  const widths = [labelWidth(entity.name, true), ...entity.attrs.map((a) => labelWidth(a.name))];
  const w = Math.max(MIN_W, Math.ceil(Math.max(...widths) + BOX_PAD_X * 2));
  const h = NAME_H + (entity.attrs.length > 0 ? entity.attrs.length * ATTR_H + BOX_PAD_BOTTOM : 0);
  return { w, h };
};

export type EntityLayout = { entity: DbEntity; box: Box };

export type RelationLayout = {
  relation: DbRelation;
  /** from の側の端。 */
  start: Point;
  /** to の側の端。 */
  end: Point;
  /** 空欄の枠（blank の関連だけ）。 */
  blankBox?: Box;
};

export type ErLayout = { view: Box; entities: EntityLayout[]; relations: RelationLayout[] };

const center = (box: Box): Point => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 });

/** 箱の中心から toward へ向かう線が、箱の枠と交わる点。 */
const clipToBox = (box: Box, toward: Point): Point => {
  const c = center(box);
  const dx = toward.x - c.x;
  const dy = toward.y - c.y;
  if (dx === 0 && dy === 0) return c;
  const scale = Math.min(
    dx === 0 ? Number.POSITIVE_INFINITY : box.w / 2 / Math.abs(dx),
    dy === 0 ? Number.POSITIVE_INFINITY : box.h / 2 / Math.abs(dy),
  );
  return { x: c.x + dx * scale, y: c.y + dy * scale };
};

/**
 * 2 つの箱を結ぶ線の両端。同じ行なら水平に、同じ列なら垂直に引く（低い方の箱の高さの中ほど）。
 * それ以外は中心どうしを結び、箱の枠で切る。
 */
const connect = (a: EntityLayout, b: EntityLayout): [Point, Point] => {
  const A = a.box;
  const B = b.box;
  if (a.entity.row === b.entity.row) {
    const y = A.y + Math.min(A.h, B.h) / 2;
    return A.x < B.x
      ? [
          { x: A.x + A.w, y },
          { x: B.x, y },
        ]
      : [
          { x: A.x, y },
          { x: B.x + B.w, y },
        ];
  }
  if (a.entity.col === b.entity.col) {
    const x = A.x + A.w / 2;
    return A.y < B.y
      ? [
          { x, y: A.y + A.h },
          { x, y: B.y },
        ]
      : [
          { x, y: A.y },
          { x, y: B.y + B.h },
        ];
  }
  return [clipToBox(A, center(B)), clipToBox(B, center(A))];
};

export const layoutEr = (entities: DbEntity[], relations: DbRelation[]): ErLayout => {
  const sizes = entities.map(entitySize);
  const cols = Math.max(0, ...entities.map((e) => e.col)) + 1;
  const rows = Math.max(0, ...entities.map((e) => e.row)) + 1;
  const colW = Array.from({ length: cols }, (_, c) =>
    Math.max(0, ...entities.flatMap((e, i) => (e.col === c ? [sizes[i]?.w ?? 0] : []))),
  );
  const rowH = Array.from({ length: rows }, (_, r) =>
    Math.max(0, ...entities.flatMap((e, i) => (e.row === r ? [sizes[i]?.h ?? 0] : []))),
  );
  const colX = colW.map((_, c) => PAD + colW.slice(0, c).reduce((s, w) => s + w + GAP_X, 0));
  const rowY = rowH.map((_, r) => PAD + rowH.slice(0, r).reduce((s, h) => s + h + GAP_Y, 0));

  const laid: EntityLayout[] = entities.map((entity, i) => {
    const size = sizes[i] ?? { w: MIN_W, h: NAME_H };
    const x = (colX[entity.col] ?? PAD) + ((colW[entity.col] ?? size.w) - size.w) / 2;
    return { entity, box: { x, y: rowY[entity.row] ?? PAD, w: size.w, h: size.h } };
  });
  const byId = new Map(laid.map((e) => [e.entity.id, e]));

  const relationLayouts = relations.flatMap((relation): RelationLayout[] => {
    const from = byId.get(relation.from);
    const to = byId.get(relation.to);
    if (!from || !to) return [];
    const [start, end] = connect(from, to);
    if (!("blank" in relation)) return [{ relation, start, end }];
    const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
    const blankBox = { x: mid.x - BLANK_W / 2, y: mid.y - BLANK_H / 2, w: BLANK_W, h: BLANK_H };
    return [{ relation, start, end, blankBox }];
  });

  const width = PAD + colW.reduce((s, w) => s + w, 0) + GAP_X * (cols - 1) + PAD;
  const height = PAD + rowH.reduce((s, h) => s + h, 0) + GAP_Y * (rows - 1) + PAD;
  return {
    view: { x: 0, y: 0, w: width, h: height },
    entities: laid,
    relations: relationLayouts,
  };
};

/** 図の書き方の誤り（テストで使う）。箱の重なり、知らないエンティティを指す関連、箱にかかる空欄の枠。 */
export const erProblems = (entities: DbEntity[], relations: DbRelation[]): string[] => {
  const problems: string[] = [];
  const ids = new Set(entities.map((e) => e.id));
  for (const relation of relations) {
    for (const id of [relation.from, relation.to]) {
      if (!ids.has(id)) problems.push(`関連が知らないエンティティ ${id} を指している`);
    }
  }
  const texts = entities.flatMap((e) => [e.name, ...e.attrs.map((a) => a.name)]);
  for (const text of texts) {
    if (text.includes("{{") && blankName(text) === undefined) {
      problems.push(`「${text}」：空欄は文字列全体にする`);
    }
  }
  const layout = layoutEr(entities, relations);
  layout.entities.forEach((a, i) => {
    for (const b of layout.entities.slice(i + 1)) {
      if (overlaps(a.box, b.box)) problems.push(`${a.entity.id} と ${b.entity.id} が重なっている`);
    }
    for (const r of layout.relations) {
      if (r.blankBox && overlaps(r.blankBox, a.box)) {
        problems.push(`関連 ${r.relation.from}-${r.relation.to} の空欄が ${a.entity.id} にかかる`);
      }
    }
  });
  return problems;
};

/** 読み上げ用の文字列で、空欄を「空欄a」にする。 */
const spoken = (text: string): string => {
  const name = blankName(text);
  return name === undefined ? text : `空欄${name}`;
};

const attrText = (attr: DbColumn): string =>
  `${spoken(attr.name)}${attr.key === "pk" ? "〔主〕" : attr.key === "fk" ? "〔外〕" : ""}`;

const RELATION_WORDS = { "1:1": "1 対 1", "1:N": "1 対多", "N:M": "多対多" } as const;

/** 図の代替テキスト。エンティティと属性、関連を文で並べる。 */
export const erDescription = (
  caption: string,
  entities: DbEntity[],
  relations: DbRelation[],
): string => {
  const nameOf = (id: string) => spoken(entities.find((e) => e.id === id)?.name ?? id);
  const entityText = entities
    .map((e) => `${spoken(e.name)}（${e.attrs.map(attrText).join("、")}）`)
    .join("、");
  const relationText = relations
    .map((r) =>
      "blank" in r
        ? `${nameOf(r.from)}と${nameOf(r.to)}の間は空欄${r.blank}`
        : r.kind === "1:N"
          ? `${nameOf(r.from)}→${nameOf(r.to)}（1 対多）`
          : `${nameOf(r.from)}と${nameOf(r.to)}（${RELATION_WORDS[r.kind]}）`,
    )
    .join("、");
  return `${caption}。エンティティ（〔主〕は主キー、〔外〕は外部キー）：${entityText}。関連：${relationText}。`;
};
