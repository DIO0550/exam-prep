import type { FigureTone, QuadrantFigure } from "../types";

/**
 * 2 つの軸で 4 つに分ける図（PPM・SL 理論・SWOT など）。
 *
 * 表で「市場成長率：高、占有率：高 → 花形」と並べると、読み手は頭の中で座標に置き直す。
 * 最初から座標の上に置いて、どの軸が高いと何と呼ぶかを位置で覚えられるようにする。
 */

const CELL_TONE: Record<FigureTone | "plain", { box: string; title: string }> = {
  plain: { box: "border-figure-line bg-figure", title: "text-ink" },
  accent: { box: "border-accent bg-accent-soft", title: "text-accent-deep" },
  ok: { box: "border-ok bg-ok-soft", title: "text-ok" },
  ng: { box: "border-ng bg-ng-soft", title: "text-ng" },
  muted: { box: "border-line bg-panel", title: "text-muted-soft" },
};

/**
 * 区分で分ける 4 マス（SWOT など）。上に列の見出し、左に行の見出しを置く。
 * 高低の軸ではないので矢印は付けず、見出しは区分の名前として帯に入れる。
 */
const CategoricalGrid = ({ figure }: { figure: QuadrantFigure }) => (
  <div className="overflow-x-auto">
    <div className="grid min-w-[420px] max-w-[680px] grid-cols-[auto_1fr_1fr] gap-2 text-read-sm">
      {figure.x.label !== "" && (
        <>
          <span />
          <span className="col-span-2 text-center font-bold text-muted text-read-xs">
            {figure.x.label}
          </span>
        </>
      )}
      <span className="flex items-end font-bold text-muted text-read-xs">{figure.y.label}</span>
      {[figure.x.low, figure.x.high].map((header) => (
        <span
          key={header}
          className="rounded-md bg-chip px-2 py-1 text-center font-bold text-muted text-read-xs"
        >
          {header}
        </span>
      ))}
      {[figure.y.high, figure.y.low].map((header, row) => (
        <div key={header} className="contents">
          <span className="flex items-center rounded-md bg-chip px-2 py-1 font-bold text-muted text-read-xs [writing-mode:vertical-rl]">
            {header}
          </span>
          {figure.cells.slice(row * 2, row * 2 + 2).map((cell) => (
            <Cell key={cell.title} {...cell} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const QuadrantFigureBlock = ({ figure }: { figure: QuadrantFigure }) =>
  figure.categorical ? <CategoricalGrid figure={figure} /> : <AxisGrid figure={figure} />;

const AxisGrid = ({ figure }: { figure: QuadrantFigure }) => (
  // 4 マスを潰すと 1 行が数文字になって読めないので、狭い画面では横へ流す。
  <div className="overflow-x-auto">
    <div className="grid min-w-[420px] max-w-[680px] grid-cols-[auto_auto_1fr_1fr] grid-rows-[auto_1fr_1fr_auto_auto] gap-2 text-read-sm">
      {/* 縦軸の名前。上向きの矢印で「上ほど高い」を示す。 */}
      <span className="col-span-4 font-bold text-muted text-read-xs">↑ {figure.y.label}</span>

      <span
        className="row-span-2 flex items-center justify-center border-diagram-line border-l-2"
        aria-hidden="true"
      />
      <span className="flex items-start pt-1 text-read-xs text-muted-soft">{figure.y.high}</span>
      {figure.cells.slice(0, 2).map((cell) => (
        <Cell key={cell.title} {...cell} />
      ))}
      <span className="flex items-end pb-1 text-read-xs text-muted-soft">{figure.y.low}</span>
      {figure.cells.slice(2, 4).map((cell) => (
        <Cell key={cell.title} {...cell} />
      ))}

      <span className="col-span-2" />
      <span className="border-diagram-line border-t-2 pt-1 text-read-xs text-muted-soft">
        {figure.x.reverse ? figure.x.high : figure.x.low}
      </span>
      <span className="border-diagram-line border-t-2 pt-1 text-right text-read-xs text-muted-soft">
        {figure.x.reverse ? figure.x.low : figure.x.high}
      </span>

      {/* 矢印は高くなる向き。左ほど高い軸では、名前を左に寄せて左向きの矢印を付ける。 */}
      {figure.x.reverse ? <span className="col-span-2" /> : null}
      <span
        className={`${figure.x.reverse ? "col-span-2" : "col-span-4 text-right"} font-bold text-muted text-read-xs`}
      >
        {figure.x.reverse ? `← ${figure.x.label}` : `${figure.x.label} →`}
      </span>
    </div>
  </div>
);

const Cell = ({ title, note, tone }: { title: string; note?: string; tone?: FigureTone }) => {
  const style = CELL_TONE[tone ?? "plain"];
  return (
    <div
      className={`flex min-h-[5.5em] flex-col gap-1 rounded-[9px] border px-3.5 py-3 ${style.box}`}
    >
      <span className={`font-bold text-read-sm ${style.title}`}>{title}</span>
      {note && <span className="text-pretty text-read-xs text-ink-soft leading-[1.7]">{note}</span>}
    </div>
  );
};
