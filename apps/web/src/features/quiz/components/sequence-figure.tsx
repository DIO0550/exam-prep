import { layoutSequence, linesOf, SMALL, textWidth } from "../figure-layout";
import type { SequenceFigure } from "../types";
import {
  ArrowHead,
  BlockMark,
  LINE_TONE,
  NODE_TONE,
  polylinePath,
  SvgFrame,
  SvgText,
  shorten,
} from "./figure-svg";

/**
 * シーケンス図。登場人物を横に並べ、時間を上から下へ流す。
 *
 * やり取りの矢印には ①②… の番号が付くので、解説の本文から「③で〜」と指せる。
 * 応答は点線、届かないやり取りは × で止める。間隔は、間を渡るラベルが収まるように自動で広げる。
 */

/** 遮断の × を置く、行き先の手前の距離。 */
const BLOCK_GAP = 26;

export const SequenceFigureBlock = ({ figure }: { figure: SequenceFigure }) => {
  const layout = layoutSequence(figure);
  const left = layout.view.x + 12;
  const right = layout.view.x + layout.view.w - 12;

  return (
    <SvgFrame view={layout.view} label={figure.caption}>
      {/* 生存線。見出しの下から、最後のやり取りの下まで。 */}
      {layout.actors.map((actor) => (
        <line
          key={`life-${actor.label}`}
          x1={actor.x}
          x2={actor.x}
          y1={actor.box.y + actor.box.h}
          y2={layout.bottom}
          className="stroke-diagram-line"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      ))}

      {layout.actors.map((actor) => (
        <g key={`head-${actor.label}`}>
          <rect
            x={actor.box.x}
            y={actor.box.y}
            width={actor.box.w}
            height={actor.box.h}
            rx={6}
            className="fill-accent-soft stroke-accent"
            strokeWidth={1.4}
          />
          <SvgText
            text={actor.label}
            x={actor.x}
            y={actor.box.y + actor.box.h / 2}
            className="fill-accent-deep"
            weight={700}
          />
        </g>
      ))}

      {layout.rows.map((row, index) => {
        if (row.kind === "divider") {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: 段は並べ替わらない
            <g key={index}>
              <line
                x1={left}
                x2={right}
                y1={row.y}
                y2={row.y}
                className="stroke-muted-soft"
                strokeWidth={1}
                strokeDasharray="2 3"
              />
              {/* 生存線が文字の間から透けないよう、裏に地の色の四角を敷く。 */}
              <rect
                x={(left + right) / 2 - textWidth(row.label, SMALL) / 2 - 6}
                y={row.y - 9}
                width={textWidth(row.label, SMALL) + 12}
                height={18}
                rx={3}
                className="fill-surface"
              />
              <SvgText
                text={row.label}
                x={(left + right) / 2}
                y={row.y}
                size={SMALL}
                weight={700}
                className="fill-muted-soft"
              />
            </g>
          );
        }

        if (row.kind === "note") {
          const tone = row.step.tone ? NODE_TONE[row.step.tone] : undefined;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: 段は並べ替わらない
            <g key={index}>
              <rect
                x={row.box.x}
                y={row.box.y}
                width={row.box.w}
                height={row.box.h}
                rx={4}
                className={tone?.shape ?? "fill-flag-soft stroke-flag"}
                strokeWidth={1.2}
              />
              <SvgText
                text={row.step.note}
                x={row.box.x + row.box.w / 2}
                y={row.box.y + row.box.h / 2}
                className={tone?.text ?? "fill-flag-ink"}
              />
            </g>
          );
        }

        const { step, x1, x2, y } = row;
        const tone = LINE_TONE[step.tone ?? "plain"];
        const strokeWidth = step.tone ? 2 : 1.6;
        const dash = step.dashed ? "6 4" : undefined;
        const labelClass = step.tone === "ng" ? "fill-ng" : "fill-ink";
        const label = (
          <SvgText
            text={row.text}
            x={row.self ? row.labelBox.x : row.labelBox.x + row.labelBox.w / 2}
            y={row.labelBox.y + row.labelBox.h / 2}
            anchor={row.self ? "start" : "middle"}
            className={labelClass}
          />
        );

        if (row.self) {
          const loop = [
            { x: x1, y },
            { x: x1 + 30, y },
            { x: x1 + 30, y: y + 20 },
            { x: x1 + 2, y: y + 20 },
          ];
          const tip = loop[3] as { x: number; y: number };
          const corner = loop[2] as { x: number; y: number };
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: 段は並べ替わらない
            <g key={index}>
              <path
                d={polylinePath([...loop.slice(0, 3), shorten(corner, tip)])}
                fill="none"
                className={tone.stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={dash}
              />
              <ArrowHead from={corner} tip={tip} className={tone.fill} />
              {label}
            </g>
          );
        }

        const direction = Math.sign(x2 - x1);
        const tip = { x: step.blocked ? x2 - direction * BLOCK_GAP : x2, y };
        const tail = { x: x1, y };
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: 段は並べ替わらない
          <g key={index}>
            <line
              x1={x1}
              x2={step.blocked ? tip.x : shorten(tail, tip).x}
              y1={y}
              y2={y}
              className={tone.stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={dash}
            />
            {step.blocked ? (
              <BlockMark at={tip} />
            ) : (
              <ArrowHead from={tail} tip={tip} className={tone.fill} />
            )}
            {label}
          </g>
        );
      })}

      {/* 読み上げ用。番号付きのやり取りを順に並べる（SVG の文字は並びが読み取りにくいため）。 */}
      <desc>
        {layout.rows
          .map((row) => {
            if (row.kind === "message") return `${row.text}（${row.step.from}→${row.step.to}）`;
            if (row.kind === "note") return linesOf(row.step.note).join(" ");
            return row.label;
          })
          .join("。")}
      </desc>
    </SvgFrame>
  );
};
