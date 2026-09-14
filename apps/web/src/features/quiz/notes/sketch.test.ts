import { describe, expect, it } from "vitest";

import { SKETCH_HEIGHT, SKETCH_WIDTH } from "./note";
import { appendPoint, logicalPoint } from "./sketch";

/** 表示上は 400×300 の枠に出ているとして、その中の位置を論理座標に直す。 */
const RECT = { left: 100, top: 50, width: 400, height: 300 };

describe("logicalPoint", () => {
  it("枠の中の位置を、表示幅によらない座標に直す", () => {
    expect(logicalPoint(RECT, 100, 50)).toEqual({ x: 0, y: 0 });
    expect(logicalPoint(RECT, 300, 200)).toEqual({ x: SKETCH_WIDTH / 2, y: SKETCH_HEIGHT / 2 });
    expect(logicalPoint(RECT, 500, 350)).toEqual({ x: SKETCH_WIDTH, y: SKETCH_HEIGHT });
  });

  it("枠の幅が変わっても、同じ位置なら同じ座標になる", () => {
    const wide = { left: 0, top: 0, width: 800, height: 600 };

    expect(logicalPoint(wide, 400, 300)).toEqual(logicalPoint(RECT, 300, 200));
  });

  it("枠からはみ出した位置は枠の縁に寄せる", () => {
    expect(logicalPoint(RECT, 0, 0)).toEqual({ x: 0, y: 0 });
    expect(logicalPoint(RECT, 9999, 9999)).toEqual({ x: SKETCH_WIDTH, y: SKETCH_HEIGHT });
  });

  it("まだ幅が無い枠では点を置けない", () => {
    expect(logicalPoint({ left: 0, top: 0, width: 0, height: 0 }, 10, 10)).toBeNull();
  });
});

describe("appendPoint", () => {
  it("離れた点は足す", () => {
    const stroke = [0, 0];

    expect(appendPoint(stroke, 20, 20)).toBe(true);
    expect(stroke).toEqual([0, 0, 20, 20]);
  });

  it("直前の点に近すぎる点は捨てる（保存する量を抑えるため）", () => {
    const stroke = [10, 10];

    expect(appendPoint(stroke, 11, 12)).toBe(false);
    expect(stroke).toEqual([10, 10]);
  });

  it("空のひと筆には必ず足す", () => {
    const stroke: number[] = [];

    expect(appendPoint(stroke, 3, 4)).toBe(true);
    expect(stroke).toEqual([3, 4]);
  });
});
