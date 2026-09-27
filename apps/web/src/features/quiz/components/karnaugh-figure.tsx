import { useId } from "react";

import { coveredCells, grayCodes, runsOf, termLabel } from "../figure-layout";
import type { KarnaughFigure, SeriesColor } from "../types";
import { SvgFrame } from "./figure-svg";

/**
 * カルノー図。マスをグレイコード順に並べ、1 のまとめを色付きの囲みで描く。
 *
 * 両端の列（または上下の行）にまたがるまとめは、図の縁で開いた 2 つの囲みにする。
 * 教科書と同じ描き方で、「端どうしは隣」を形で見せるため。囲みから作った項と、
 * 項を足した式は図の下に出す。どちらも term から作るので、囲みと食い違わない。
 */

const CELL_W = 50;
const CELL_H = 40;
const HEAD_W = 60;
const HEAD_H = 42;

/** まとめの色。グラフの系列と同じ 4 色を、並べた順に使う。 */
const GROUP: Record<SeriesColor, { stroke: string; fill: string; swatch: string }> = {
  1: { stroke: "stroke-series-1", fill: "fill-series-1", swatch: "border-series-1" },
  2: { stroke: "stroke-series-2", fill: "fill-series-2", swatch: "border-series-2" },
  3: { stroke: "stroke-series-3", fill: "fill-series-3", swatch: "border-series-3" },
  4: { stroke: "stroke-series-4", fill: "fill-series-4", swatch: "border-series-4" },
};

const colorOf = (index: number): SeriesColor => ((index % 4) + 1) as SeriesColor;

export const KarnaughFigureBlock = ({ figure }: { figure: KarnaughFigure }) => {
  const clipId = `${useId().replace(/:/g, "")}-grid`;
  const variables = [...figure.rows, ...figure.cols];
  const rowCodes = grayCodes(figure.rows.length);
  const colCodes = grayCodes(figure.cols.length);
  const gridW = colCodes.length * CELL_W;
  const gridH = rowCodes.length * CELL_H;
  const view = { x: 0, y: 0, w: HEAD_W + gridW + 10, h: HEAD_H + gridH + 10 };
  const groups = figure.groups ?? [];

  return (
    <div className="flex flex-col gap-2.5">
      <SvgFrame view={view} label={figure.caption}>
        <defs>
          <clipPath id={clipId}>
            <rect x={HEAD_W} y={HEAD_H} width={gridW} height={gridH} />
          </clipPath>
        </defs>

        {/* 左上の区切り。右上に列の変数、左下に行の変数を書く。 */}
        <line x1={4} y1={4} x2={HEAD_W} y2={HEAD_H} className="stroke-diagram-line" />
        <text
          x={HEAD_W - 6}
          y={17}
          textAnchor="end"
          fontSize={13}
          fontWeight={700}
          className="fill-ink"
        >
          {figure.cols.join("")}
        </text>
        <text x={6} y={HEAD_H - 4} fontSize={13} fontWeight={700} className="fill-ink">
          {figure.rows.join("")}
        </text>

        {colCodes.map((code, index) => (
          <text
            key={`c${code}`}
            x={HEAD_W + (index + 0.5) * CELL_W}
            y={HEAD_H - 10}
            textAnchor="middle"
            fontSize={12}
            className="fill-muted-soft tabular-nums"
          >
            {code}
          </text>
        ))}
        {rowCodes.map((code, index) => (
          <text
            key={`r${code}`}
            x={HEAD_W - 10}
            y={HEAD_H + (index + 0.5) * CELL_H + 4}
            textAnchor="end"
            fontSize={12}
            className="fill-muted-soft tabular-nums"
          >
            {code}
          </text>
        ))}

        {/* マスと値。1 だけを濃く出し、0 は地に沈める。 */}
        {figure.values.map((line, row) =>
          [...line].map((value, col) => (
            <g
              // biome-ignore lint/suspicious/noArrayIndexKey: マスの位置そのものがキー
              key={`${row}-${col}`}
            >
              <rect
                x={HEAD_W + col * CELL_W}
                y={HEAD_H + row * CELL_H}
                width={CELL_W}
                height={CELL_H}
                className="fill-surface stroke-diagram-line"
                strokeWidth={1}
              />
              <text
                x={HEAD_W + (col + 0.5) * CELL_W}
                y={HEAD_H + (row + 0.5) * CELL_H + 5}
                textAnchor="middle"
                fontSize={15}
                fontWeight={value === "1" ? 700 : 400}
                className={value === "1" ? "fill-ink" : "fill-disabled"}
              >
                {value === "-" ? "×" : value}
              </text>
            </g>
          )),
        )}

        {/* まとめ。重なっても輪郭が分かれるよう、後のものほど内側に描く。 */}
        <g clipPath={`url(#${clipId})`}>
          {groups.map((term, index) => {
            const color = GROUP[colorOf(index)];
            const cells = coveredCells(figure, term);
            const rowRuns = runsOf(cells.map(([row]) => row));
            const colRuns = runsOf(cells.map(([, col]) => col));
            const inset = 4 + index * 3.5;
            // 端をまたぐとき、縁に接する側は図の外まで伸ばして開いた形にする。
            const open = 16;
            const wrapRows = rowRuns.length === 2;
            const wrapCols = colRuns.length === 2;
            return (
              <g key={term}>
                {rowRuns.flatMap((rows) =>
                  colRuns.map((cols) => {
                    let x = HEAD_W + cols.from * CELL_W + inset;
                    let right = HEAD_W + (cols.to + 1) * CELL_W - inset;
                    let y = HEAD_H + rows.from * CELL_H + inset;
                    let bottom = HEAD_H + (rows.to + 1) * CELL_H - inset;
                    if (wrapCols && cols.from === 0) x -= open;
                    if (wrapCols && cols.to === colCodes.length - 1) right += open;
                    if (wrapRows && rows.from === 0) y -= open;
                    if (wrapRows && rows.to === rowCodes.length - 1) bottom += open;
                    return (
                      <rect
                        key={`${rows.from}-${cols.from}`}
                        x={x}
                        y={y}
                        width={right - x}
                        height={bottom - y}
                        rx={11}
                        className={`${color.stroke} ${color.fill}`}
                        fillOpacity={0.1}
                        strokeWidth={2.2}
                      />
                    );
                  }),
                )}
              </g>
            );
          })}
        </g>
      </SvgFrame>

      {groups.length > 0 && (
        <div className="flex flex-col gap-1.5 text-read-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-muted-soft">
            {groups.map((term, index) => (
              <span key={term} className="flex items-center gap-1.5">
                <span
                  className={`inline-block h-3 w-5 rounded-[5px] border-2 ${GROUP[colorOf(index)].swatch}`}
                />
                <span className="text-ink">{termLabel(term, variables)}</span>
                <span className="text-read-xs">（{coveredCells(figure, term).length} マス）</span>
              </span>
            ))}
          </div>
          <span className="font-bold text-ink">
            まとめると {groups.map((term) => termLabel(term, variables)).join(" ＋ ")}
          </span>
        </div>
      )}
    </div>
  );
};
