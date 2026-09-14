import { SKETCH_HEIGHT, SKETCH_WIDTH, type Stroke } from "./note";

/**
 * 手書きの座標まわり。canvas を触らない部分だけを切り出してある。
 */

/** 直前の点からこれだけ離れていなければ、点を足さない（論理座標）。保存する量を抑えるため。 */
const MIN_GAP = 4;

const clamp = (value: number, max: number): number => Math.min(Math.max(value, 0), max);

/**
 * 画面上の位置を、手書き領域の論理座標に直す。
 * 枠に幅が無いとき（まだ描画されていないとき）は置けないので null。
 */
export const logicalPoint = (
  rect: { left: number; top: number; width: number; height: number },
  clientX: number,
  clientY: number,
): { x: number; y: number } | null => {
  if (rect.width <= 0 || rect.height <= 0) return null;
  return {
    x: clamp(Math.round(((clientX - rect.left) / rect.width) * SKETCH_WIDTH), SKETCH_WIDTH),
    y: clamp(Math.round(((clientY - rect.top) / rect.height) * SKETCH_HEIGHT), SKETCH_HEIGHT),
  };
};

/**
 * 描いている途中のひと筆に点を足す。足したら true。
 * 近すぎる点は捨てる（1 回のドラッグで数百点入り、保存する量が跳ねるため）。
 */
export const appendPoint = (stroke: Stroke, x: number, y: number): boolean => {
  const lastY = stroke.at(-1);
  const lastX = stroke.at(-2);
  if (lastX !== undefined && lastY !== undefined) {
    if (Math.abs(x - lastX) < MIN_GAP && Math.abs(y - lastY) < MIN_GAP) return false;
  }
  stroke.push(x, y);
  return true;
};
