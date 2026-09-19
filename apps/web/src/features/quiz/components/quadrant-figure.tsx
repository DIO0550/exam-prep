import type { QuadrantFigure } from "../types";

/**
 * 2 本の軸で 4 つに分けて見せる図。
 *
 * 表で「高 × 低」と書くより、実際に 4 つの枠を置いたほうが位置関係がそのまま頭に入る。
 * 軸の名前と両端の言葉を外側に出し、枠の中は見出しと短い補足だけにしてある。
 */

/** 4 つの枠の並び。上段が縦軸の高い側、左列が横軸の低い側。 */
const PLACES = [
  { y: "high", x: "low" },
  { y: "high", x: "high" },
  { y: "low", x: "low" },
  { y: "low", x: "high" },
] as const;

export const QuadrantFigureBlock = ({ figure }: { figure: QuadrantFigure }) => {
  const cellAt = (x: "low" | "high", y: "low" | "high") =>
    figure.cells.find((cell) => cell.x === x && cell.y === y);

  return (
    <div className="flex max-w-[54em] gap-2.5">
      {/* 縦軸。上が「高い側」。 */}
      <div className="flex flex-col items-center justify-between py-1 text-read-xs text-muted-soft">
        <span className="whitespace-nowrap [writing-mode:vertical-rl]">{figure.axisY.high}</span>
        <span className="whitespace-nowrap font-bold text-ink [writing-mode:vertical-rl]">
          {figure.axisY.label}
        </span>
        <span className="whitespace-nowrap [writing-mode:vertical-rl]">{figure.axisY.low}</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          {PLACES.map((place) => {
            const cell = cellAt(place.x, place.y);
            return (
              <div
                key={`${place.y}-${place.x}`}
                className="flex min-h-[4.5em] flex-col gap-1 rounded-[9px] border border-figure-line bg-figure px-3.5 py-3"
              >
                <span className="font-bold text-ink text-read-sm">{cell?.title}</span>
                {cell?.note && (
                  <span className="text-pretty text-muted-soft text-read-xs leading-[1.6]">
                    {cell.note}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 横軸。右が「高い側」。 */}
        <div className="flex items-center justify-between gap-2 text-read-xs text-muted-soft">
          <span>{figure.axisX.low}</span>
          <span className="font-bold text-ink">{figure.axisX.label}</span>
          <span>{figure.axisX.high}</span>
        </div>
      </div>
    </div>
  );
};
