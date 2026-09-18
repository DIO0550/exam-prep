import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ArrayFigure, TimelineFigure } from "../types";
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
