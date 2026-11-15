import { describe, expect, it } from "vitest";

import type { PmMarker } from "./markers";
import { eraseRange, paintRange, parsePmMarkers, resolveMarkers } from "./markers";

const TEXT = "A社は通販サイトを運営している。顧客情報は DB に保存している。";

const at = (start: number, end: number, color: PmMarker["color"] = "yellow"): PmMarker => ({
  start,
  end,
  text: TEXT.slice(start, end),
  color,
});

describe("マーカーを引く・消す", () => {
  it("なぞった所に引き、引いた文字列も覚える", () => {
    expect(paintRange([], 3, 8, "yellow", TEXT)).toEqual([
      { start: 3, end: 8, text: "通販サイト", color: "yellow" },
    ]);
  });

  it("前後の空白は引かない。空白だけなら何もしない", () => {
    const space = TEXT.indexOf(" DB");
    expect(paintRange([], space, space + 3, "pink", TEXT)).toEqual([
      { start: space + 1, end: space + 3, text: "DB", color: "pink" },
    ]);
    expect(paintRange([], space, space + 1, "pink", TEXT)).toEqual([]);
  });

  it("同じ色で重ねたり続けて引いたりすると 1 本にまとめる", () => {
    const once = paintRange([], 2, 6, "yellow", TEXT);
    expect(paintRange(once, 4, 10, "yellow", TEXT)).toEqual([at(2, 10)]);
    expect(paintRange(once, 6, 8, "yellow", TEXT)).toEqual([at(2, 8)]);
  });

  it("違う色を上から引くと、その所だけ塗り替える", () => {
    expect(paintRange([at(0, 12)], 4, 8, "blue", TEXT)).toEqual([
      at(0, 4),
      at(4, 8, "blue"),
      at(8, 12),
    ]);
  });

  it("消しゴムは、なぞった所だけ消し、残りは分かれて残る", () => {
    expect(eraseRange([at(0, 12), at(14, 18, "green")], 4, 16, TEXT)).toEqual([
      at(0, 4),
      at(16, 18, "green"),
    ]);
    expect(eraseRange([at(2, 6)], 0, 20, TEXT)).toEqual([]);
  });
});

describe("書き起こしを直したとき", () => {
  it("位置の文字列が同じなら、そのまま使う", () => {
    expect(resolveMarkers([at(2, 7)], TEXT)).toEqual([at(2, 7)]);
  });

  it("文字がずれたら、同じ文字列のいちばん近い所へ付け直す。無くなっていたら外す", () => {
    const edited = `（前書き）${TEXT}`;
    expect(resolveMarkers([at(2, 7)], edited)).toEqual([{ ...at(2, 7), start: 7, end: 12 }]);
    // 「している。」は 2 か所にある。元の位置に近い 2 つめへ付け直す
    const second = TEXT.lastIndexOf("している。");
    const marker = at(second, second + 5);
    expect(resolveMarkers([marker], `（前書き）${TEXT}`)[0]?.start).toBe(second + 5);
    expect(resolveMarkers([at(2, 7)], "全く違う文章")).toEqual([]);
  });
});

describe("保存した値を読む", () => {
  it("形の合わないものは捨て、空になった問は持たない", () => {
    expect(
      parsePmMarkers({
        "ap-r07-aki-pm-01": [
          { start: 2, end: 4, text: "通販", color: "yellow" },
          { start: 2, end: 4, text: "通販サイト", color: "yellow" },
          { start: 4, end: 2, text: "", color: "yellow" },
          { start: 0, end: 1, text: "A", color: "red" },
          "壊れた値",
        ],
        "ap-r07-aki-pm-04": [{ start: 0, end: 1, text: "A", color: "purple" }],
        "ap-r07-aki-pm-05": "壊れた値",
      }),
    ).toEqual({ "ap-r07-aki-pm-01": [{ start: 2, end: 4, text: "通販", color: "yellow" }] });
    expect(parsePmMarkers(null)).toEqual({});
    expect(parsePmMarkers([])).toEqual({});
  });
});
