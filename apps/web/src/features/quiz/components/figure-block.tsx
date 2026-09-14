import type { Figure } from "../types";

/** inline は問題カードの中、page は解説画面。図の地色だけ変わる（文字は text-read-* で共通）。 */
type Variant = "inline" | "page";

/** 表の列幅。4 列のときだけ最終列（安定性など短い語）を詰める。 */
const columns = (count: number) => (count === 4 ? "1.3fr 1fr 1fr 0.8fr" : "0.9fr 1fr 1.4fr");

/**
 * 表の最低幅。これを下回る画面では横スクロールさせる。
 *
 * 幅に合わせて列を詰めると、狭い画面で 1 行が 3〜4 文字になって読めなくなるため
 * （問題文に添える表と同じ扱い）。
 */
const minWidth = (count: number) => (count === 4 ? "min-w-[560px]" : "min-w-[440px]");

type FigureBlockProps = {
  figure: Figure;
  variant: Variant;
};

export const FigureBlock = ({ figure, variant }: FigureBlockProps) => {
  const stepBg = variant === "inline" ? "bg-figure" : "bg-surface";

  return (
    <div>
      {figure.type === "flow" && (
        <div className="flex flex-col gap-2">
          {figure.steps.map((step, stepIndex) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: 同じ登場人物が何度も出るので actor はキーにできない
              key={stepIndex}
              className={`flex items-start gap-3.5 rounded-[9px] border border-figure-line px-3.5 py-3 ${stepBg}`}
            >
              <span className="flex-[0_0_8.5em] font-bold text-read-sm text-accent leading-[1.6]">
                {step.actor}
              </span>
              <span className="flex-1 text-pretty text-read-sm text-ink-soft leading-[1.8]">
                {step.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {figure.type === "calc" && (
        <div className="flex flex-col gap-2.5">
          {figure.lines.map((line) => (
            <div
              key={line.expr}
              className="flex flex-wrap items-baseline gap-4 border-line border-b border-dashed pb-[9px]"
            >
              <span className="min-w-[220px] flex-1 font-medium text-read-md text-ink leading-[1.7] tabular-nums">
                {line.expr}
              </span>
              <span className="flex-none text-read-xs text-muted-soft">{line.note}</span>
            </div>
          ))}
        </div>
      )}

      {figure.type === "table" && (
        <div className="overflow-x-auto">
          <div className={`flex flex-col ${minWidth(figure.headers.length)}`}>
            <div
              className="grid gap-3 border-figure-head border-b-[1.5px] pb-[9px]"
              style={{ gridTemplateColumns: columns(figure.headers.length) }}
            >
              {figure.headers.map((header) => (
                <span
                  key={header}
                  className="font-bold text-read-xs text-muted-soft tracking-[0.04em]"
                >
                  {header}
                </span>
              ))}
            </div>
            {figure.rows.map((row, rowIndex) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: 表は静的で並べ替えないため添字で足りる
                key={rowIndex}
                className="grid gap-3 border-line-softer border-b py-3"
                style={{ gridTemplateColumns: columns(figure.headers.length) }}
              >
                {row.map((cell, cellIndex) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: 同じ行に同じ値が並ぶのでセルの値はキーにできない
                    key={cellIndex}
                    className={`text-pretty text-read-sm leading-[1.7] ${
                      cellIndex === 0 ? "font-bold text-ink" : "text-muted-soft"
                    }`}
                  >
                    {cell}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3.5 text-read-xs text-muted-soft">{figure.caption}</div>
    </div>
  );
};
