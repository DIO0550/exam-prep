import type { Figure } from "../types";

/** inline は問題カードの中、page は解説画面。文字サイズと図の地色だけ変わる。 */
type Variant = "inline" | "page";

const SIZES = {
  inline: {
    actor: "text-[12px]",
    step: "text-[12.5px]",
    expr: "text-[13.5px]",
    cell: "text-[12.5px]",
  },
  page: { actor: "text-[12.5px]", step: "text-[13px]", expr: "text-[14px]", cell: "text-[13px]" },
} as const;

/** 表の列幅。4 列のときだけ最終列（安定性など短い語）を詰める。 */
const columns = (count: number) => (count === 4 ? "1.3fr 1fr 1fr 0.8fr" : "0.9fr 1fr 1.4fr");

type FigureBlockProps = {
  figure: Figure;
  variant: Variant;
};

export const FigureBlock = ({ figure, variant }: FigureBlockProps) => {
  const size = SIZES[variant];
  const stepBg = variant === "inline" ? "bg-figure" : "bg-surface";

  return (
    <div>
      {figure.type === "flow" && (
        <div className="flex flex-col gap-2">
          {figure.steps.map((step) => (
            <div
              key={step.actor}
              className={`flex items-start gap-3.5 rounded-[9px] border border-figure-line px-3.5 py-3 ${stepBg}`}
            >
              <span className={`flex-[0_0_96px] font-bold text-accent leading-[1.6] ${size.actor}`}>
                {step.actor}
              </span>
              <span className={`flex-1 text-pretty text-ink-soft leading-[1.8] ${size.step}`}>
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
              <span
                className={`min-w-[220px] flex-1 font-medium text-ink leading-[1.7] tabular-nums ${size.expr}`}
              >
                {line.expr}
              </span>
              <span className="flex-none text-[11.5px] text-muted-soft">{line.note}</span>
            </div>
          ))}
        </div>
      )}

      {figure.type === "table" && (
        <div className="flex flex-col">
          <div
            className="grid gap-3 border-figure-head border-b-[1.5px] pb-[9px]"
            style={{ gridTemplateColumns: columns(figure.headers.length) }}
          >
            {figure.headers.map((header) => (
              <span
                key={header}
                className="font-bold text-[11.5px] text-muted-soft tracking-[0.04em]"
              >
                {header}
              </span>
            ))}
          </div>
          {figure.rows.map((row) => (
            <div
              key={row[0]}
              className="grid gap-3 border-line-softer border-b py-3"
              style={{ gridTemplateColumns: columns(figure.headers.length) }}
            >
              {row.map((cell, cellIndex) => (
                <span
                  key={cell}
                  className={`text-pretty leading-[1.7] ${size.cell} ${
                    cellIndex === 0 ? "font-bold text-ink" : "text-muted-soft"
                  }`}
                >
                  {cell}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3.5 text-[11.5px] text-muted-soft">{figure.caption}</div>
    </div>
  );
};
