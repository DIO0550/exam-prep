import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type {
  ArrayFigure,
  ChartFigure,
  DiagramFigure,
  FlowFigure,
  KarnaughFigure,
  QuadrantFigure,
  SequenceFigure,
  TimelineFigure,
  VennFigure,
} from "../types";
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

describe("FigureBlock（流れ図）", () => {
  const figure: FlowFigure = {
    type: "flow",
    caption: "手順",
    steps: [
      { actor: "CPU", text: "参照する" },
      { actor: "OS", text: "読み込む" },
    ],
  };

  it("段に番号を振り、順に並べる", () => {
    render(<FigureBlock figure={figure} variant="page" />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[1]?.textContent).toContain("2");
    expect(items[1]?.textContent).toContain("読み込む");
  });
});

describe("FigureBlock（構成図）", () => {
  const figure: DiagramFigure = {
    type: "diagram",
    caption: "構成",
    nodes: [
      { id: "pc", label: "PC", col: 0, row: 0, shape: "actor" },
      { id: "db", label: "DB", col: 2, row: 0, shape: "db" },
    ],
    edges: [{ from: "pc", to: "db", label: "SQL" }],
    groups: [{ label: "社内", col: 0, row: 0, w: 3, h: 1 }],
  };

  it("部品・線のラベル・囲みの見出しを描き、図の見出しを読み上げ名にする", () => {
    render(<FigureBlock figure={figure} variant="page" />);
    expect(screen.getByRole("img", { name: "構成" })).toBeInTheDocument();
    for (const text of ["PC", "DB", "SQL", "社内"]) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });
});

describe("FigureBlock（シーケンス図）", () => {
  const figure: SequenceFigure = {
    type: "sequence",
    caption: "やり取り",
    actors: ["PC", "サーバ"],
    steps: [
      { from: "PC", to: "サーバ", label: "要求" },
      { over: ["サーバ"], note: "処理する" },
      { from: "サーバ", to: "PC", label: "応答", dashed: true },
    ],
  };

  it("やり取りに番号を付けて描く", () => {
    render(<FigureBlock figure={figure} variant="page" />);
    expect(screen.getByText("① 要求")).toBeInTheDocument();
    expect(screen.getByText("② 応答")).toBeInTheDocument();
    expect(screen.getByText("処理する")).toBeInTheDocument();
  });
});

describe("FigureBlock（グラフ）", () => {
  const figure: ChartFigure = {
    type: "chart",
    caption: "売上と費用",
    x: { label: "売上高", min: 0, max: 10 },
    y: { label: "金額", min: 0, max: 10, ticks: [0, 5, 10] },
    series: [
      {
        label: "売上高線",
        points: [
          [0, 0],
          [10, 10],
        ],
      },
      {
        label: "総費用線",
        points: [
          [0, 4],
          [10, 8],
        ],
      },
    ],
    marks: [{ x: 6.67, y: 6.67, label: "損益分岐点" }],
  };

  it("系列の名前を線の横と凡例の両方に出す", () => {
    render(<FigureBlock figure={figure} variant="page" />);
    // 線の横の名前と凡例とで 2 回ずつ出る（色だけで見分けさせない）。
    // 線に付けた <title>（なぞったときの表示）は数えない。
    const shown = screen.getAllByText("売上高線").filter((element) => element.tagName !== "title");
    expect(shown).toHaveLength(2);
    // 目印の点にも同じ名前の <title> が付くので、図の中の文字だけを見る。
    const mark = screen.getAllByText("損益分岐点").filter((element) => element.tagName !== "title");
    expect(mark).toHaveLength(1);
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});

describe("FigureBlock（ベン図と 4 象限）", () => {
  it("ベン図は塗り分けごとに見出しを付けて並べる", () => {
    const figure: VennFigure = {
      type: "venn",
      caption: "集合",
      sets: ["A", "B"],
      universe: "S",
      panels: [
        { label: "ア", shaded: ["AB"] },
        { label: "イ", shaded: ["0"], verdict: "ok" },
      ],
    };
    render(<FigureBlock figure={figure} variant="page" />);
    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(screen.getByText("イ")).toHaveClass("text-ok");
  });

  it("4 象限は軸の名前とマスを出す", () => {
    const figure: QuadrantFigure = {
      type: "quadrant",
      caption: "PPM",
      x: { label: "占有率", low: "低", high: "高" },
      y: { label: "成長率", low: "低い", high: "高い" },
      cells: [{ title: "問題児" }, { title: "花形" }, { title: "負け犬" }, { title: "金のなる木" }],
    };
    render(<FigureBlock figure={figure} variant="page" />);
    expect(screen.getByText("占有率 →")).toBeInTheDocument();
    expect(screen.getByText("金のなる木")).toBeInTheDocument();
  });
});

describe("FigureBlock（カルノー図）", () => {
  const figure: KarnaughFigure = {
    type: "karnaugh",
    caption: "カルノー図",
    rows: ["A", "B"],
    cols: ["C", "D"],
    values: ["1001", "0110", "0110", "0000"],
    groups: ["00-0", "-1-1"],
  };

  it("まとめから項と式を作って、図の下に出す", () => {
    render(<FigureBlock figure={figure} variant="page" />);
    expect(screen.getByText("A\u0305・B\u0305・D\u0305")).toBeInTheDocument();
    expect(screen.getByText("まとめると A\u0305・B\u0305・D\u0305 ＋ B・D")).toBeInTheDocument();
    // 列の見出しはグレイコード順（01 の次は 11）。
    const codes = screen.getAllByText(/^(00|01|11|10)$/).map((element) => element.textContent);
    expect(codes.slice(0, 4)).toEqual(["00", "01", "11", "10"]);
  });
});
