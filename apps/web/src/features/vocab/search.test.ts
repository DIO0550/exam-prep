import { describe, expect, it } from "vitest";

import { ABBR_GROUPS, AMBIGUOUS_ABBRS } from "./data/abbreviations";
import { countEntries, filterAmbiguous, filterGroups } from "./search";

const entries = ABBR_GROUPS.flatMap((group) => group.entries);

describe("略語単語帳のデータ", () => {
  it("360 語あり、分類の中で略語が重複しない", () => {
    expect(countEntries(ABBR_GROUPS)).toBe(360);
    for (const group of ABBR_GROUPS) {
      const abbrs = group.entries.map((entry) => entry.abbr);
      expect(new Set(abbrs).size, `${group.title} の略語`).toBe(abbrs.length);
    }
  });

  it("どの語にも正式名称・日本語・説明がそろっている", () => {
    for (const entry of entries) {
      expect(entry.full, `${entry.abbr} の正式名称`).not.toBe("");
      expect(entry.ja, `${entry.abbr} の日本語`).not.toBe("");
      expect(entry.desc, `${entry.abbr} の説明`).not.toBe("");
    }
  });

  it("頭字語の位置は正式名称の中に収まり、重複しない", () => {
    for (const entry of entries) {
      const seen = new Set(entry.acronym);
      expect(seen.size, `${entry.abbr} の頭字語の位置`).toBe(entry.acronym.length);
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
    for (const entry of entries) {
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

  it("同じ略語で違う意味は、意味が 2 つ以上あって見分け方が付いている", () => {
    for (const item of AMBIGUOUS_ABBRS) {
      expect(item.meanings.length, `${item.abbr} の意味の数`).toBeGreaterThanOrEqual(2);
      expect(item.hint, `${item.abbr} の見分け方`).not.toBe("");
    }
  });
});

describe("略語の検索", () => {
  it("検索語が空なら、元の分類をそのまま返す", () => {
    expect(filterGroups(ABBR_GROUPS, "  ", "略語・正式名称")).toBe(ABBR_GROUPS);
    expect(filterAmbiguous(AMBIGUOUS_ABBRS, "", "略語・正式名称")).toBe(AMBIGUOUS_ABBRS);
  });

  it("略語は大文字小文字を問わず引ける", () => {
    const hit = filterGroups(ABBR_GROUPS, "cpu", "略語・正式名称");
    expect(hit.flatMap((group) => group.entries).map((entry) => entry.abbr)).toContain("CPU");
  });

  it("正式名称・日本語でも引ける", () => {
    const spelled = filterGroups(ABBR_GROUPS, "Central Processing", "略語・正式名称");
    expect(spelled.flatMap((group) => group.entries).map((entry) => entry.abbr)).toContain("CPU");

    const japanese = filterGroups(ABBR_GROUPS, "中央処理装置", "略語・正式名称");
    expect(japanese.flatMap((group) => group.entries).map((entry) => entry.abbr)).toContain("CPU");
  });

  it("「説明も含む」でだけ、説明の中の言葉が当たる", () => {
    const key = "命令の取出し";
    expect(countEntries(filterGroups(ABBR_GROUPS, key, "略語・正式名称"))).toBe(0);
    expect(countEntries(filterGroups(ABBR_GROUPS, key, "説明も含む"))).toBeGreaterThan(0);
  });

  it("1 語も残らなかった分類は落ちる", () => {
    const hit = filterGroups(ABBR_GROUPS, "cpu", "略語・正式名称");
    expect(hit.length).toBeLessThan(ABBR_GROUPS.length);
    for (const group of hit) expect(group.entries.length).toBeGreaterThan(0);
  });

  it("同じ略語で違う意味も、略語と意味の両方から引ける", () => {
    expect(filterAmbiguous(AMBIGUOUS_ABBRS, "mac", "略語・正式名称").map((i) => i.abbr)).toEqual([
      "MAC",
    ]);
    expect(
      filterAmbiguous(AMBIGUOUS_ABBRS, "Message Authentication", "略語・正式名称").map(
        (i) => i.abbr,
      ),
    ).toEqual(["MAC"]);
  });
});
