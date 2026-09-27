import type { ReactNode } from "react";

import type { Box, Point } from "../figure-layout";
import { LINE, linesOf } from "../figure-layout";
import type { FigureTone } from "../types";

/**
 * 解説の図を SVG で描くときの共通部品。
 *
 * 座標は「文字サイズが標準のときの px」で持ち、表示の大きさは em で決める。こうすると、
 * ヘッダーの文字サイズを変えたときに、図の中の文字も図の大きさも一緒に拡大される。
 */

/** 図の中の文字の基準（text-read-sm の 13.5px）。SVG の 1 単位をこれで em に直す。 */
const BASE_PX = 13.5;

/**
 * 図の枠。狭い画面では 85% まで縮め、それより狭ければ横へ流す。
 * 縮めすぎると中の文字が読めなくなり、縮めないと少しはみ出すだけの図まで横スクロールになるため。
 */
export const SvgFrame = ({
  view,
  label,
  children,
}: {
  view: Box;
  label: string;
  children: ReactNode;
}) => (
  <div className="scroll-shadow-x overflow-x-auto text-read-sm">
    <svg
      viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
      role="img"
      aria-label={label}
      className="block h-auto"
      style={{
        width: "100%",
        maxWidth: `${view.w / BASE_PX}em`,
        minWidth: `${(view.w * 0.85) / BASE_PX}em`,
      }}
      fontSize={13}
    >
      {children}
    </svg>
  </div>
);

/** 部品の色（塗り・枠・文字）。 */
export const NODE_TONE: Record<FigureTone | "plain", { shape: string; text: string }> = {
  plain: { shape: "fill-surface stroke-diagram-line", text: "fill-ink" },
  accent: { shape: "fill-accent-soft stroke-accent", text: "fill-accent-deep" },
  ok: { shape: "fill-ok-soft stroke-ok", text: "fill-ok" },
  ng: { shape: "fill-ng-soft stroke-ng", text: "fill-ng" },
  muted: { shape: "fill-panel stroke-disabled", text: "fill-muted-soft" },
};

/** 線と矢じりの色。 */
export const LINE_TONE: Record<FigureTone | "plain", { stroke: string; fill: string }> = {
  plain: { stroke: "stroke-diagram-line", fill: "fill-diagram-line" },
  accent: { stroke: "stroke-accent", fill: "fill-accent" },
  ok: { stroke: "stroke-ok", fill: "fill-ok" },
  ng: { stroke: "stroke-ng", fill: "fill-ng" },
  muted: { stroke: "stroke-disabled", fill: "fill-disabled" },
};

/** 矢じりの長さと幅。 */
export const HEAD_LENGTH = 9;
const HEAD_HALF = 4.6;

/** 先端が tip、向きが from → tip の矢じり。 */
export const ArrowHead = ({
  from,
  tip,
  className,
}: {
  from: Point;
  tip: Point;
  className: string;
}) => {
  const dx = tip.x - from.x;
  const dy = tip.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const baseX = tip.x - ux * HEAD_LENGTH;
  const baseY = tip.y - uy * HEAD_LENGTH;
  const points = [
    `${tip.x},${tip.y}`,
    `${baseX - uy * HEAD_HALF},${baseY + ux * HEAD_HALF}`,
    `${baseX + uy * HEAD_HALF},${baseY - ux * HEAD_HALF}`,
  ].join(" ");
  return <polygon points={points} className={className} stroke="none" />;
};

/** 矢じりの付け根まで線を縮めた点（線の端が矢じりの先から突き出ないようにする）。 */
export const shorten = (from: Point, tip: Point, by = HEAD_LENGTH - 1): Point => {
  const dx = tip.x - from.x;
  const dy = tip.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const cut = Math.min(by, length / 2);
  return { x: tip.x - (dx / length) * cut, y: tip.y - (dy / length) * cut };
};

/**
 * 複数行の文字。center を塊の中心に置く。
 * halo を付けると、下を通る線を文字の周りだけ地の色で消す（線の上に載せるラベル向け）。
 */
export const SvgText = ({
  text,
  x,
  y,
  className = "fill-ink",
  size,
  line = LINE,
  anchor = "middle",
  halo = false,
  weight,
}: {
  text: string;
  x: number;
  y: number;
  className?: string;
  size?: number;
  line?: number;
  anchor?: "start" | "middle" | "end";
  halo?: boolean;
  weight?: number;
}) => {
  const lines = linesOf(text);
  // 行の高さの中で、字の基準線が真ん中より少し下に来るように置く。
  const first = y - ((lines.length - 1) * line) / 2 + line * 0.3;
  return (
    <text
      x={x}
      y={first}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      className={`${className} ${halo ? "stroke-surface" : ""}`}
      strokeWidth={halo ? 4 : undefined}
      strokeLinejoin={halo ? "round" : undefined}
      paintOrder={halo ? "stroke" : undefined}
    >
      {lines.map((part, index) => (
        <tspan
          // biome-ignore lint/suspicious/noArrayIndexKey: 同じ文字の行が並ぶことがあり、行の順は変わらない
          key={index}
          x={x}
          dy={index === 0 ? 0 : line}
        >
          {part}
        </tspan>
      ))}
    </text>
  );
};

/** 折れ線の点を SVG の path にする。 */
export const polylinePath = (points: Point[]): string =>
  points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");

/** 遮断を表す ×。 */
export const BlockMark = ({ at }: { at: Point }) => (
  <g className="stroke-ng" strokeWidth={2.6} strokeLinecap="round">
    <circle cx={at.x} cy={at.y} r={9} className="fill-surface stroke-ng" strokeWidth={1.4} />
    <path
      d={`M${at.x - 4} ${at.y - 4} L${at.x + 4} ${at.y + 4} M${at.x + 4} ${at.y - 4} L${at.x - 4} ${at.y + 4}`}
    />
  </g>
);
