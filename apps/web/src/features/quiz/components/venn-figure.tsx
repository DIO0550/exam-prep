import { useId } from "react";

import type { VennFigure, VennPanel, VennRegion } from "../types";

/**
 * ベン図。集合を円で描き、指している部分だけを塗る。
 *
 * 選択肢の式ごとに panels を並べると、同じ円の上で塗り方を見比べられる。
 * 「A と B の両方に入り C には入らない」のような部分は、入る円で切り抜き（clipPath）、
 * 入らない円で抜く（mask）ことで塗る。
 */

type Circle = { cx: number; cy: number; r: number };

const W = 220;
const LAYOUT: Record<2 | 3, { circles: Circle[]; h: number; labels: { x: number; y: number }[] }> =
  {
    2: {
      circles: [
        { cx: 86, cy: 88, r: 50 },
        { cx: 134, cy: 88, r: 50 },
      ],
      h: 162,
      labels: [
        { x: 58, y: 30 },
        { x: 162, y: 30 },
      ],
    },
    3: {
      circles: [
        { cx: 88, cy: 78, r: 44 },
        { cx: 132, cy: 78, r: 44 },
        { cx: 110, cy: 116, r: 44 },
      ],
      h: 186,
      labels: [
        { x: 50, y: 28 },
        { x: 170, y: 28 },
        { x: 110, y: 176 },
      ],
    },
  };

const LETTERS = ["A", "B", "C"] as const;

const Panel = ({ figure, panel }: { figure: VennFigure; panel: VennPanel }) => {
  const id = useId().replace(/:/g, "");
  const count = figure.sets.length as 2 | 3;
  const { circles, h, labels } = LAYOUT[count];
  const universe = { x: 8, y: 8, w: W - 16, h: h - 16 };

  /** 1 つの部分を塗る。入る円で切り抜いてから、入らない円を抜く。 */
  const region = (code: VennRegion) => {
    const members = code === "0" ? [] : [...code];
    const inIndexes = LETTERS.slice(0, count)
      .map((letter, index) => (members.includes(letter) ? index : -1))
      .filter((index) => index >= 0);
    const outIndexes = LETTERS.slice(0, count)
      .map((_, index) => index)
      .filter((index) => !inIndexes.includes(index));

    const rect = (
      <rect
        x={universe.x}
        y={universe.y}
        width={universe.w}
        height={universe.h}
        className="fill-accent"
        fillOpacity={0.32}
      />
    );
    const clipped = inIndexes.reduceRight(
      (inner, index) => (
        <g key={index} clipPath={`url(#${id}-c${index})`}>
          {inner}
        </g>
      ),
      rect,
    );
    return (
      <g
        key={code}
        mask={outIndexes.length > 0 ? `url(#${id}-m${outIndexes.join("")})` : undefined}
      >
        {clipped}
      </g>
    );
  };

  const masks = [...new Set(panel.shaded)].map((code) => {
    const members = code === "0" ? [] : [...code];
    return LETTERS.slice(0, count)
      .map((letter, index) => (members.includes(letter) ? -1 : index))
      .filter((index) => index >= 0);
  });

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg
        viewBox={`0 0 ${W} ${h}`}
        role="img"
        aria-label={`${panel.label ?? ""} ${panel.shaded.join("・")} を塗った図`}
        className="h-auto w-[13em] max-w-full"
      >
        <defs>
          {circles.map((circle, index) => (
            <clipPath key={`c${circle.cx}-${circle.cy}`} id={`${id}-c${index}`}>
              <circle cx={circle.cx} cy={circle.cy} r={circle.r} />
            </clipPath>
          ))}
          {masks
            .filter((out) => out.length > 0)
            .map((out) => (
              <mask key={out.join("")} id={`${id}-m${out.join("")}`}>
                <rect x={0} y={0} width={W} height={h} fill="white" />
                {out.map((index) => {
                  const circle = circles[index] as Circle;
                  return (
                    <circle key={index} cx={circle.cx} cy={circle.cy} r={circle.r} fill="black" />
                  );
                })}
              </mask>
            ))}
        </defs>

        {figure.universe && (
          <rect
            x={universe.x}
            y={universe.y}
            width={universe.w}
            height={universe.h}
            rx={4}
            className="fill-surface stroke-diagram-line"
            strokeWidth={1.2}
          />
        )}
        {panel.shaded.map(region)}
        {circles.map((circle) => (
          <circle
            key={`o${circle.cx}-${circle.cy}`}
            cx={circle.cx}
            cy={circle.cy}
            r={circle.r}
            fill="none"
            className="stroke-ink-soft"
            strokeWidth={1.4}
          />
        ))}
        {figure.sets.map((name, index) => {
          const at = labels[index] ?? { x: 0, y: 0 };
          return (
            <text
              key={name}
              x={at.x}
              y={at.y}
              textAnchor="middle"
              fontSize={13}
              fontWeight={700}
              className="fill-ink stroke-surface"
              strokeWidth={4}
              paintOrder="stroke"
            >
              {name}
            </text>
          );
        })}
        {figure.universe && (
          <text x={W - 14} y={h - 14} textAnchor="end" fontSize={11} className="fill-muted-soft">
            {figure.universe}
          </text>
        )}
      </svg>
      {panel.label && (
        <span
          className={`font-bold text-read-sm ${
            panel.verdict === "ok" ? "text-ok" : panel.verdict === "ng" ? "text-ng" : "text-ink"
          }`}
        >
          {panel.label}
        </span>
      )}
      {panel.note && (
        <span className="max-w-[16em] text-center text-pretty text-read-xs text-muted-soft leading-[1.6]">
          {panel.note}
        </span>
      )}
    </div>
  );
};

export const VennFigureBlock = ({ figure }: { figure: VennFigure }) => (
  <div className="flex flex-wrap justify-start gap-x-5 gap-y-4">
    {figure.panels.map((panel, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: 見出しの無い塗り分けもあり、並べ替えない
      <Panel key={index} figure={figure} panel={panel} />
    ))}
  </div>
);
