import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ArrayFigure, QuadrantFigure, SequenceFigure, TimelineFigure } from "../types";
import { FigureBlock } from "./figure-block";

/**
 * 配列図とタイムチャートは、中身の文字ではなく「どの位置に置かれるか」で意味が決まる。
 * 置き場所はグリッドの列で表しているので、そこを見る。
 */

const columnOf = (element: HTMLElement) => element.style.gridColumn;

describe("FigureBlock（配列図）", () => {
  const figure: ArrayFigure = {
    type: "array",
    caption: "図：交換のようす",
    headers: ["枠1", "枠2", "枠3"],
    rows: [
      { label: "はじめ", cells: ["5", "3", "1"], swap: [0, 1], note: "5 > 3 なので交換" },
      { label: "1回目", cells: ["3", "5", "1"], marked: [2] },
    ],
  };

  it("段とセルをそのまま並べ、注記も出す", () => {
    render(<FigureBlock figure={figure} variant="page" />);

    expect(screen.getByText("はじめ")).toBeInTheDocument();
    expect(screen.getByText("5 > 3 なので交換")).toBeInTheDocument();
    // 同じ値が別の段にも出るので、件数で見る。
    expect(screen.getAllByText("5")).toHaveLength(2);
  });

  it("強調するセルだけ塗る", () => {
    const { container } = render(<FigureBlock figure={figure} variant="page" />);
    const filled = container.querySelectorAll(".bg-accent");

    // marked に入れた 1 つだけが塗られ、ほかのセルは塗らない。
    expect(filled).toHaveLength(1);
    expect(filled[0]?.textContent).toBe("1");
  });

  it("比べた 2 つの位置を、その範囲の列にまたがらせる", () => {
    const { container } = render(<FigureBlock figure={figure} variant="page" />);
    const bracket = container.querySelector<HTMLElement>("[style*='grid-column']");

    // 添字 0 と 1 は、1 列目から 3 列目の手前まで。
    expect(bracket && columnOf(bracket)).toBe("1 / 3");
  });
});

describe("FigureBlock（タイムチャート）", () => {
  const figure: TimelineFigure = {
    type: "timeline",
    caption: "図：処理の進み方",
    span: 8,
    unit: "秒",
    tracks: [
      {
        label: "多重度1",
        bars: [
          { start: 0, length: 4, label: "タスク1", tone: 1 },
          { start: 4, length: 4, label: "タスク2", tone: 2 },
        ],
      },
    ],
    marks: [{ at: 1, label: "2件目到着" }],
  };

  it("帯を開始時刻の列から、長さのぶんだけ占める", () => {
    render(<FigureBlock figure={figure} variant="page" />);

    // 1 列目は見出しなので、時刻 0 は 2 列目から始まる。
    expect(columnOf(screen.getByText("タスク1"))).toBe("2 / span 4");
    expect(columnOf(screen.getByText("タスク2"))).toBe("6 / span 4");
  });

  it("目印は、その時刻の列に立てる", () => {
    render(<FigureBlock figure={figure} variant="page" />);

    const mark = screen.getByText("2件目到着").parentElement;
    expect(mark && columnOf(mark)).toBe("3");
  });

  it("目盛りと単位を出す", () => {
    render(<FigureBlock figure={figure} variant="page" />);

    expect(screen.getByText("（秒）")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });
});

describe("FigureBlock（シーケンス図）", () => {
  const figure: SequenceFigure = {
    type: "sequence",
    caption: "図：やり取りの順序",
    actors: ["クライアント", "サーバ", "DNS"],
    steps: [
      { from: 0, to: 1, label: "接続を要求する" },
      { from: 1, to: 2, label: "公開鍵を引く" },
      { from: 1, to: 0, label: "証明書を返す", reply: true },
      { from: 1, to: 1, label: "署名を検証する" },
    ],
  };

  it("矢印を、送り手と受け手の列にまたがらせる", () => {
    render(<FigureBlock figure={figure} variant="page" />);

    // 0 → 1 は 1 列目から 3 列目の手前まで。
    expect(columnOf(screen.getByText(/接続を要求する/).parentElement as HTMLElement)).toBe("1 / 3");
    // 1 → 2 は 2 列目から。
    expect(columnOf(screen.getByText(/公開鍵を引く/).parentElement as HTMLElement)).toBe("2 / 4");
  });

  it("戻りの矢印も、同じ範囲にまたがらせて向きだけ変える", () => {
    const { container } = render(<FigureBlock figure={figure} variant="page" />);
    const reply = screen.getByText(/証明書を返す/).parentElement as HTMLElement;

    expect(columnOf(reply)).toBe("1 / 3");
    // 向きは矢印の記号で表す。戻りは左向き。
    expect(reply.textContent).toContain("◀");
    expect(container.textContent).toContain("▶");
  });

  it("相手のいないやり取りは、その列だけに置く", () => {
    render(<FigureBlock figure={figure} variant="page" />);
    const self = screen.getByText(/署名を検証する/).parentElement as HTMLElement;

    expect(columnOf(self)).toBe("2");
  });

  it("順番が分かるよう番号を振る", () => {
    render(<FigureBlock figure={figure} variant="page" />);

    expect(screen.getByText(/^1\. 接続を要求する$/)).toBeInTheDocument();
    expect(screen.getByText(/^4\. 署名を検証する$/)).toBeInTheDocument();
  });
});

describe("FigureBlock（4象限図）", () => {
  const figure: QuadrantFigure = {
    type: "quadrant",
    caption: "図：4つの象限",
    axisX: { label: "占有率", low: "低", high: "高" },
    axisY: { label: "成長率", low: "低", high: "高" },
    cells: [
      { x: "high", y: "high", title: "花形" },
      { x: "low", y: "high", title: "問題児" },
      { x: "high", y: "low", title: "金のなる木" },
      { x: "low", y: "low", title: "負け犬" },
    ],
  };

  it("上段を縦軸の高い側、左列を横軸の低い側にして並べる", () => {
    const { container } = render(<FigureBlock figure={figure} variant="page" />);
    const titles = [...container.querySelectorAll(".font-bold.text-read-sm")].map(
      (cell) => cell.textContent,
    );

    // 左上・右上・左下・右下の順に並ぶ。
    expect(titles.slice(0, 4)).toEqual(["問題児", "花形", "負け犬", "金のなる木"]);
  });

  it("軸の名前と両端の言葉を出す", () => {
    render(<FigureBlock figure={figure} variant="page" />);

    expect(screen.getByText("成長率")).toBeInTheDocument();
    expect(screen.getByText("占有率")).toBeInTheDocument();
  });
});
