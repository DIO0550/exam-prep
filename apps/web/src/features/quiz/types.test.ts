import { describe, expect, it } from "vitest";
import type { Source } from "./types";
import { formatSource, shortSource, sourceId } from "./types";

const base: Source = { exam: "AP", era: "令和", year: 3, term: "haru", section: "am", no: 1 };

describe("formatSource", () => {
  it("年度・期・試験区分・時間区分・問番号を並べる", () => {
    expect(formatSource(base)).toBe("令和3年度 春期 応用情報技術者試験 午前 問1");
  });

  it("改変があるときは末尾に併記する", () => {
    expect(formatSource({ ...base, modified: "図を自作のものに差し替え" })).toBe(
      "令和3年度 春期 応用情報技術者試験 午前 問1（図を自作のものに差し替え）",
    );
  });

  it("表示側の改変（選択肢の並べ替え）も併記する", () => {
    expect(formatSource(base, "選択肢の順序を入れ替えて表示")).toBe(
      "令和3年度 春期 応用情報技術者試験 午前 問1（選択肢の順序を入れ替えて表示）",
    );
  });

  it("データの改変と表示側の改変は、1 つの括弧に並べる", () => {
    expect(
      formatSource({ ...base, modified: "表記を一部改変" }, "選択肢の順序を入れ替えて表示"),
    ).toBe(
      "令和3年度 春期 応用情報技術者試験 午前 問1（表記を一部改変、選択肢の順序を入れ替えて表示）",
    );
  });

  it("秋期・午後・別区分も同じ形で出る", () => {
    expect(formatSource({ ...base, exam: "FE", term: "aki", section: "pm", no: 12 })).toBe(
      "令和3年度 秋期 基本情報技術者試験 午後 問12",
    );
  });
});

describe("sourceId", () => {
  it("年と問番号を 2 桁に揃える", () => {
    expect(sourceId(base)).toBe("ap-r03-haru-am-01");
    expect(sourceId({ ...base, no: 80 })).toBe("ap-r03-haru-am-80");
  });

  it("元号で接頭辞が変わる", () => {
    expect(sourceId({ ...base, era: "平成", year: 31 })).toBe("ap-h31-haru-am-01");
  });

  it("改変の有無で ID は変わらない", () => {
    expect(sourceId({ ...base, modified: "図を差し替え" })).toBe(sourceId(base));
  });
});

describe("書き下ろした問題の出典", () => {
  const original: Source = {
    kind: "original",
    deck: "gcp-cdl-scenario",
    label: "GCP シナリオ",
    no: 7,
    reference: "Google Cloud「Cloud Digital Leader 学習ガイド v2.0」",
  };

  it("本サイト作成であることと、典拠を併記する", () => {
    expect(formatSource(original)).toBe(
      "GCP シナリオ 問7・本サイト作成（典拠 Google Cloud「Cloud Digital Leader 学習ガイド v2.0」）",
    );
  });

  it("表示のしかたによる差分も、典拠と同じ括弧に並べる", () => {
    expect(formatSource(original, "選択肢の順序を入れ替えて表示")).toBe(
      "GCP シナリオ 問7・本サイト作成（典拠 Google Cloud「Cloud Digital Leader 学習ガイド v2.0」、選択肢の順序を入れ替えて表示）",
    );
  });

  it("一覧には問題集の名前と番号を出す", () => {
    expect(shortSource(original)).toBe("GCP シナリオ 問7");
  });

  it("問題 ID は問題集の ID と番号で作る", () => {
    expect(sourceId(original)).toBe("gcp-cdl-scenario-07");
    expect(sourceId({ ...original, no: 30 })).toBe("gcp-cdl-scenario-30");
  });
});
