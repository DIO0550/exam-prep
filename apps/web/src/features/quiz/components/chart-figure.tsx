import type { Point } from "../figure-layout";
import { chartTickText, layoutChart, PAD, SMALL, SMALL_LINE } from "../figure-layout";
import type { ChartFigure, ChartSeries, SeriesColor } from "../types";
import { ArrowHead, NODE_TONE, polylinePath, SvgFrame, SvgText } from "./figure-svg";

/**
 * グラフ。損益分岐点や待ち時間の曲線のように、「どこで交わるか」「どこで跳ね上がるか」を見せる。
 *
 * 線は 2px、目印の点は地の色の輪を付けて線の上でも埋もれないようにする。系列が 2 つ以上なら、
 * 線の横の名前に加えて図の下に凡例を出す（色だけで見分けさせないため）。
 */

const SERIES: Record<SeriesColor, { stroke: string; fill: string }> = {
  1: { stroke: "stroke-series-1", fill: "fill-series-1" },
  2: { stroke: "stroke-series-2", fill: "fill-series-2" },
  3: { stroke: "stroke-series-3", fill: "fill-series-3" },
  4: { stroke: "stroke-series-4", fill: "fill-series-4" },
};

/** 凡例の見本。棒は塗った四角、線は同じ色の短い線で出す。 */
const SWATCH: Record<SeriesColor, { box: string; line: string }> = {
  1: { box: "border-series-1 bg-series-1", line: "border-series-1" },
  2: { box: "border-series-2 bg-series-2", line: "border-series-2" },
  3: { box: "border-series-3 bg-series-3", line: "border-series-3" },
  4: { box: "border-series-4 bg-series-4", line: "border-series-4" },
};

/** 色を指定しなかった系列には、並べた順に色を振る。 */
const colorOf = (series: ChartSeries, index: number): SeriesColor =>
  series.color ?? (((index % 4) + 1) as SeriesColor satisfies SeriesColor);

/**
 * 単調な 3 次補間（Fritsch–Carlson）。点のあいだで行き過ぎない、なめらかな曲線にする。
 * 待ち時間の曲線のように、点の間でふくらむと意味が変わってしまうものに使う。
 */
const monotonePath = (points: Point[]): string => {
  const n = points.length;
  if (n < 3) return polylinePath(points);
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const dx = xs.slice(1).map((x, index) => x - (xs[index] ?? 0));
  const slope = ys.slice(1).map((y, index) => (y - (ys[index] ?? 0)) / (dx[index] || 1));
  const m = points.map((_, index) => {
    if (index === 0) return slope[0] ?? 0;
    if (index === n - 1) return slope[n - 2] ?? 0;
    const before = slope[index - 1] ?? 0;
    const after = slope[index] ?? 0;
    return before * after <= 0 ? 0 : (before + after) / 2;
  });
  for (let index = 0; index < n - 1; index += 1) {
    const s = slope[index] ?? 0;
    if (s === 0) {
      m[index] = 0;
      m[index + 1] = 0;
      continue;
    }
    const a = (m[index] ?? 0) / s;
    const b = (m[index + 1] ?? 0) / s;
    const length = a * a + b * b;
    if (length > 9) {
      const t = 3 / Math.sqrt(length);
      m[index] = t * a * s;
      m[index + 1] = t * b * s;
    }
  }
  let d = `M${xs[0]} ${ys[0]}`;
  for (let index = 0; index < n - 1; index += 1) {
    const step = (dx[index] ?? 0) / 3;
    const x0 = xs[index] ?? 0;
    const y0 = ys[index] ?? 0;
    const x1 = xs[index + 1] ?? 0;
    const y1 = ys[index + 1] ?? 0;
    d += ` C${x0 + step} ${y0 + (m[index] ?? 0) * step} ${x1 - step} ${y1 - (m[index + 1] ?? 0) * step} ${x1} ${y1}`;
  }
  return d;
};

/** 階段（次の点まで値を保つ）。 */
const stepPath = (points: Point[]): string =>
  points
    .map((point, index) => {
      if (index === 0) return `M${point.x} ${point.y}`;
      return `H${point.x} V${point.y}`;
    })
    .join(" ");

export const ChartFigureBlock = ({ figure }: { figure: ChartFigure }) => {
  const { plot, sx, sy, labels, view } = layoutChart(figure);
  const bottom = plot.y + plot.h;
  const rightEdge = plot.x + plot.w;
  const baseline = sy(Math.max(figure.y.min, Math.min(0, figure.y.max)));

  // 棒の幅。隣の棒との間隔の 6 割か 24px の小さいほう。
  const bars = figure.series.filter((series) => series.kind === "bar");
  const barXs = [...new Set(bars.flatMap((series) => series.points.map(([x]) => sx(x))))].sort(
    (a, b) => a - b,
  );
  const spacing = Math.min(plot.w, ...barXs.slice(1).map((x, index) => x - (barXs[index] ?? 0)));
  const barW = Math.min(24, spacing * 0.6);

  return (
    <div className="flex flex-col gap-2">
      <SvgFrame view={view} label={figure.caption}>
        {/* 目盛りの横線。地から一段だけ濃い、細い実線。 */}
        {(figure.y.ticks ?? []).map((value) => (
          <line
            key={`grid-${value}`}
            x1={plot.x}
            x2={rightEdge}
            y1={sy(value)}
            y2={sy(value)}
            className="stroke-line-soft"
            strokeWidth={1}
          />
        ))}

        {(figure.areas ?? []).map((area) => {
          const tone = NODE_TONE[area.tone ?? "accent"];
          const points = area.points.map(([x, y]) => ({ x: sx(x), y: sy(y) }));
          return (
            <polygon
              key={`area-${area.label ?? ""}-${area.points.join()}`}
              points={points.map((point) => `${point.x},${point.y}`).join(" ")}
              className={`${tone.shape} [fill-opacity:0.7]`}
              strokeWidth={1}
            />
          );
        })}

        {(figure.guides ?? []).map((guide) =>
          guide.x !== undefined ? (
            <g key={`gx-${guide.x}`}>
              <line
                x1={sx(guide.x)}
                x2={sx(guide.x)}
                y1={plot.y}
                y2={bottom}
                className="stroke-muted-soft"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            </g>
          ) : (
            <g key={`gy-${guide.y}`}>
              <line
                x1={plot.x}
                x2={rightEdge}
                y1={sy(guide.y ?? 0)}
                y2={sy(guide.y ?? 0)}
                className="stroke-muted-soft"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            </g>
          ),
        )}

        {/* 軸。先に矢じりを付けて、どちら向きに大きくなるかを示す。 */}
        <g className="stroke-muted-soft" strokeWidth={1.2}>
          <line x1={plot.x} x2={rightEdge + 8} y1={bottom} y2={bottom} />
          <line x1={plot.x} x2={plot.x} y1={bottom} y2={plot.y - 8} />
        </g>
        <ArrowHead
          from={{ x: plot.x, y: bottom }}
          tip={{ x: rightEdge + 12, y: bottom }}
          className="fill-muted-soft"
        />
        <ArrowHead
          from={{ x: plot.x, y: bottom }}
          tip={{ x: plot.x, y: plot.y - 12 }}
          className="fill-muted-soft"
        />

        {(figure.y.ticks ?? []).map((value, index) => (
          <text
            key={`yt-${value}`}
            x={plot.x - 6}
            y={sy(value) + 4}
            textAnchor="end"
            fontSize={SMALL}
            className="fill-muted-soft tabular-nums"
          >
            {chartTickText(figure.y, index, value)}
          </text>
        ))}
        {(figure.x.ticks ?? []).map((value, index) => (
          <text
            key={`xt-${value}`}
            x={sx(value)}
            y={bottom + 16}
            textAnchor="middle"
            fontSize={SMALL}
            className="fill-muted-soft tabular-nums"
          >
            {chartTickText(figure.x, index, value)}
          </text>
        ))}
        <text x={0} y={plot.y - 16} fontSize={SMALL} fontWeight={700} className="fill-muted">
          {figure.y.label}
        </text>
        <text
          x={rightEdge + 12}
          y={bottom + 38}
          textAnchor="end"
          fontSize={SMALL}
          fontWeight={700}
          className="fill-muted"
        >
          {figure.x.label}
        </text>

        {figure.series.map((series, index) => {
          const color = SERIES[colorOf(series, index)];
          if (series.kind === "bar") {
            return (
              <g key={series.label} className={color.fill}>
                {series.points.map(([x, y]) => {
                  const px = sx(x);
                  const py = sy(y);
                  const height = Math.abs(baseline - py);
                  const x0 = px - barW / 2;
                  const x1 = x0 + barW;
                  // 角を丸めるのは値の側の端だけ。0 より下の棒は下の端を丸める。
                  const r = Math.min(4, height / 2, barW / 2) * (py <= baseline ? 1 : -1);
                  return (
                    <path
                      key={`${x}-${y}`}
                      d={`M${x0} ${baseline} V${py + r} Q${x0} ${py} ${x0 + Math.abs(r)} ${py} H${x1 - Math.abs(r)} Q${x1} ${py} ${x1} ${py + r} V${baseline} Z`}
                    >
                      <title>{`${series.label}：${y.toLocaleString("ja-JP")}`}</title>
                    </path>
                  );
                })}
              </g>
            );
          }
          const points = series.points.map(([x, y]) => ({ x: sx(x), y: sy(y) }));
          const d =
            series.kind === "curve"
              ? monotonePath(points)
              : series.kind === "step"
                ? stepPath(points)
                : polylinePath(points);
          return (
            <path
              key={series.label}
              d={d}
              fill="none"
              className={color.stroke}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={series.dashed ? "6 4" : undefined}
            >
              <title>{series.label}</title>
            </path>
          );
        })}

        {(figure.marks ?? []).map((mark, index) => (
          <circle
            // biome-ignore lint/suspicious/noArrayIndexKey: 名前の無い目印もあり、並べ替えない
            key={index}
            cx={sx(mark.x)}
            cy={sy(mark.y)}
            r={4.5}
            className="fill-ink-soft stroke-surface"
            strokeWidth={2}
          >
            {mark.label && <title>{mark.label}</title>}
          </circle>
        ))}

        {/* 図の中の名前。位置は layoutChart が決め、重ならないことは検査で確かめてある。
            線の名前は色を線に任せ、文字は地の文の色にする。 */}
        {labels.map((label, index) => (
          <SvgText
            // biome-ignore lint/suspicious/noArrayIndexKey: 同じ名前が別の種類で出ることがある
            key={index}
            text={label.text}
            x={label.x}
            y={label.y}
            size={SMALL}
            line={SMALL_LINE}
            anchor={label.anchor}
            weight={label.kind === "mark" || label.kind === "area" ? 700 : undefined}
            className={
              label.kind === "area"
                ? NODE_TONE[label.tone ?? "accent"].text
                : label.kind === "mark"
                  ? "fill-ink"
                  : label.kind === "guide"
                    ? "fill-muted"
                    : "fill-ink-soft"
            }
            halo
          />
        ))}
      </SvgFrame>

      {figure.series.length >= 2 && (
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-2 text-read-xs text-muted-soft"
          style={{ paddingLeft: `${(plot.x + PAD / 2) / 13.5}em` }}
        >
          {figure.series.map((series, index) => {
            const color = colorOf(series, index);
            return (
              <span key={series.label} className="flex items-center gap-1.5">
                {series.kind === "bar" ? (
                  <span
                    className={`inline-block h-3 w-3 rounded-[3px] border ${SWATCH[color].box}`}
                  />
                ) : (
                  <span
                    className={`inline-block w-6 border-t-2 ${SWATCH[color].line} ${
                      series.dashed ? "border-dashed" : ""
                    }`}
                  />
                )}
                {series.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
