import { describe, expect, it } from "vitest";

import {
  chartProblems,
  clipToNode,
  coveredCells,
  diagramProblems,
  karnaughProblems,
  layoutDiagram,
  layoutSequence,
  sequenceProblems,
  stepNumber,
  termLabel,
  textWidth,
  vennProblems,
} from "./figure-layout";
import type { ChartFigure, DiagramFigure, SequenceFigure } from "./types";

/**
 * 図の位置決め。見た目の崩れは型では落ちないので、座標そのものを確かめる。
 */

describe("textWidth", () => {
  it("全角は 1 文字 1em、半角はそれより狭く見積もる", () => {
    expect(textWidth("あいう", 10)).toBe(30);
    expect(textWidth("abc", 10)).toBeLessThan(30);
    expect(textWidth("", 10)).toBe(0);
  });
});

describe("layoutDiagram", () => {
  const figure: DiagramFigure = {
    type: "diagram",
    caption: "2 つの箱",
    nodes: [
      { id: "a", label: "送信側", col: 0, row: 0 },
      { id: "b", label: "受信側", col: 2, row: 0 },
    ],
    edges: [{ from: "a", to: "b", label: "データ" }],
  };

  it("線は部品の中心どうしではなく、縁から縁へ引く", () => {
    const layout = layoutDiagram(figure);
    const edge = layout.edges[0];
    const a = layout.nodes.get("a");
    const b = layout.nodes.get("b");
    expect(edge?.points[0]?.x).toBeCloseTo((a?.cx ?? 0) + (a?.w ?? 0) / 2);
    expect(edge?.points[1]?.x).toBeCloseTo((b?.cx ?? 0) - (b?.w ?? 0) / 2);
  });

  it("円は、中心からの向きに合わせて円周で切る", () => {
    const layout = layoutDiagram({
      ...figure,
      nodes: [{ id: "c", label: "状態", col: 0, row: 0, shape: "circle" }],
      edges: [],
    });
    const circle = layout.nodes.get("c");
    if (!circle) throw new Error("no node");
    const point = clipToNode(circle, { x: 100, y: 100 });
    expect(Math.hypot(point.x, point.y)).toBeCloseTo(circle.w / 2);
  });

  it("重なった部品、無い部品への線、枠をまたぐ部品を拾う", () => {
    expect(diagramProblems(figure)).toEqual([]);
    const broken: DiagramFigure = {
      ...figure,
      nodes: [...figure.nodes, { id: "c", label: "重なる箱", col: 0.2, row: 0 }],
      edges: [{ from: "a", to: "z" }],
      groups: [{ label: "社内", col: 1.5, row: 0, w: 1, h: 1 }],
    };
    const problems = diagramProblems(broken);
    expect(problems.some((problem) => problem.includes("a と c"))).toBe(true);
    expect(problems.some((problem) => problem.includes("z が無い"))).toBe(true);
    expect(problems.some((problem) => problem.includes("枠をまたいで"))).toBe(true);
  });

  it("遮断される線は、× の手前で止める", () => {
    const layout = layoutDiagram({
      ...figure,
      edges: [{ from: "a", to: "b", blocked: true }],
    });
    const edge = layout.edges[0];
    const b = layout.nodes.get("b");
    const end = edge?.points[edge.points.length - 1];
    expect(end?.x).toBeLessThan((b?.cx ?? 0) - (b?.w ?? 0) / 2 - 10);
    expect(edge?.blockAt.x).toBeCloseTo(end?.x ?? 0);
  });
});

describe("layoutSequence", () => {
  const figure: SequenceFigure = {
    type: "sequence",
    caption: "やり取り",
    actors: ["クライアント", "サーバ"],
    steps: [
      { from: "クライアント", to: "サーバ", label: "とても長いラベルの要求メッセージを送る" },
      { from: "サーバ", to: "クライアント", label: "応答", dashed: true },
    ],
  };

  it("やり取りに順に番号を振る", () => {
    const rows = layoutSequence(figure).rows.filter((row) => row.kind === "message");
    expect(rows.map((row) => (row.kind === "message" ? row.text : ""))).toEqual([
      "① とても長いラベルの要求メッセージを送る",
      "② 応答",
    ]);
    expect(stepNumber(21)).toBe("㉑");
  });

  it("ラベルが収まるよう、登場人物の間隔を広げる", () => {
    const layout = layoutSequence(figure);
    const gap = (layout.actors[1]?.x ?? 0) - (layout.actors[0]?.x ?? 0);
    expect(gap).toBeGreaterThan(textWidth("① とても長いラベルの要求メッセージを送る"));
  });

  it("並びに無い登場人物を拾う", () => {
    expect(sequenceProblems(figure)).toEqual([]);
    const broken: SequenceFigure = {
      ...figure,
      steps: [{ from: "クライアント", to: "DNS", label: "問合せ" }],
    };
    expect(sequenceProblems(broken)).toContain("登場人物「DNS」が並びに無い");
  });
});

describe("chartProblems", () => {
  const figure: ChartFigure = {
    type: "chart",
    caption: "グラフ",
    x: { label: "x", min: 0, max: 10 },
    y: { label: "y", min: 0, max: 10 },
    series: [
      {
        label: "直線",
        points: [
          [0, 0],
          [10, 10],
        ],
      },
    ],
  };

  it("軸の外の点と、並びの崩れた曲線を拾う", () => {
    expect(chartProblems(figure)).toEqual([]);
    const broken: ChartFigure = {
      ...figure,
      series: [
        {
          label: "はみ出す",
          points: [
            [0, 0],
            [12, 3],
          ],
        },
        {
          label: "曲線",
          kind: "curve",
          points: [
            [0, 0],
            [5, 3],
            [4, 4],
          ],
        },
      ],
    };
    const problems = chartProblems(broken);
    expect(problems).toContain("系列「はみ出す」の点 (12, 3) が軸の範囲の外");
    expect(problems).toContain("曲線「曲線」の点が左から右へ並んでいない");
  });
});

describe("vennProblems", () => {
  it("集合の数に合わない部分と、全体集合の無い補集合を拾う", () => {
    const problems = vennProblems({
      type: "venn",
      caption: "ベン図",
      sets: ["A", "B"],
      panels: [{ shaded: ["C", "0"] }],
    });
    expect(problems).toContain("塗る部分「C」が集合の数と合わない");
    expect(problems).toContain("全体集合が無いのに、どれにも入らない部分を塗っている");
  });
});

describe("カルノー図", () => {
  const base = { rows: ["A", "B"], cols: ["C", "D"] };

  it("まとめの形から、覆うマスと項の文字を作る", () => {
    // B・D は、AB＝01・11 の行 × CD＝01・11 の列（画面の並びで 1〜2 行目・1〜2 列目）。
    expect(coveredCells(base, "-1-1")).toEqual([
      [1, 1],
      [1, 2],
      [2, 1],
      [2, 2],
    ]);
    // 両端の列（CD＝00 と 10）は隣どうし。
    expect(coveredCells(base, "00-0")).toEqual([
      [0, 0],
      [0, 3],
    ]);
    expect(termLabel("00-0", ["A", "B", "C", "D"])).toBe("A\u0305・B\u0305・D\u0305");
    expect(termLabel("----", ["A", "B", "C", "D"])).toBe("1");
    expect(termLabel("01", ["x₁", "x₂"])).toBe("x\u0305₁\u0305・x₂");
  });

  it("0 を含むまとめと、どのまとめにも入らない 1 を拾う", () => {
    const figure = {
      type: "karnaugh" as const,
      caption: "カルノー図",
      ...base,
      values: ["1001", "0110", "0110", "0000"],
      groups: ["-0-0"],
    };
    const problems = karnaughProblems(figure);
    expect(problems).toContain("まとめ「B\u0305・D\u0305」が 0 のマスを含んでいる");
    expect(problems.some((problem) => problem.includes("どのまとめにも入っていない"))).toBe(true);
    expect(karnaughProblems({ ...figure, groups: ["00-0", "-1-1"] })).toEqual([]);
  });
});
