import type { Figure } from "../types";
import { ArrayFigureBlock } from "./array-figure";
import { TimelineFigureBlock } from "./timeline-figure";

/** inline は問題カードの中、page は解説画面。図の地色だけ変わる（文字は text-read-* で共通）。 */
type Variant = "inline" | "page";

/**
 * 表の列幅。3 列と 4 列はよく使う形なので、中身の長さに合わせた配分を決め打ちにしてある
 * （3 列は最終列が説明文、4 列は最終列が短い語になりやすい）。それ以外は等分する。
 */
const columns = (count: number) => {
  if (count === 3) return "0.9fr 1fr 1.4fr";
  if (count === 4) return "1.3fr 1fr 1fr 0.8fr";
  return `repeat(${count}, minmax(0, 1fr))`;
};

/**
 * 表の最低幅。これを下回る画面では横スクロールさせる。
 *
 * 幅に合わせて列を詰めると、狭い画面で 1 行が 3〜4 文字になって読めなくなるため
 * （問題文に添える表と同じ扱い）。列が増えるぶんだけ必要な幅も広がる。
 */
const minWidth = (count: number) => (count <= 3 ? "min-w-[440px]" : `min-w-[${count * 140}px]`);

type FigureBlockProps = {
  figure: Figure;
  variant: Variant;
};

/**
 * 見出しの呼び名。中身が表のものを「図」と呼ぶと、絵を探して見つからない読み方になるので、
 * 表は「表」と呼ぶ。データ側のキャプションは呼び名を持たない。
 */
const labelOf = (figure: Figure): string => (figure.type === "table" ? "表" : "図");

export const FigureBlock = ({ figure, variant }: FigureBlockProps) => {
  const stepBg = variant === "inline" ? "bg-figure" : "bg-surface";

  return (
    <figure>
      <figcaption className="mb-3 flex flex-wrap items-baseline gap-2">
        <span className="rounded bg-chip px-1.5 py-0.5 font-bold text-[10px] text-muted tracking-[0.1em]">
          {labelOf(figure)}
        </span>
        <span className="text-pretty text-read-xs text-muted-soft">{figure.caption}</span>
      </figcaption>
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

      {figure.type === "array" && <ArrayFigureBlock figure={figure} />}

      {figure.type === "timeline" && <TimelineFigureBlock figure={figure} />}
    </figure>
  );
};
