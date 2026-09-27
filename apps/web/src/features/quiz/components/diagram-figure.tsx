import type { EdgeLayout, NodeLayout, Point } from "../figure-layout";
import { LINE, layoutDiagram, linesOf, SMALL, SMALL_LINE } from "../figure-layout";
import type { DiagramFigure } from "../types";
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
 * 構成図。部品を格子の上に置き、線は部品の縁から縁へ引く。
 *
 * 形は見た目の約束ごとに合わせてある（箱＝装置や処理、円柱＝データベース、雲＝インターネット、
 * 人＝利用者、円＝状態）。位置決めは figure-layout.ts にあり、データの検査でも同じ計算を使う。
 */

/** 雲の輪郭（横 100・縦 60 の枠に描いたもの）。部品の大きさに合わせて引き伸ばす。 */
const CLOUD =
  "M20 58 C4 58 0 42 11 35 C6 20 22 10 33 16 C40 2 62 0 69 13 C81 6 99 16 92 31 C101 38 97 58 80 58 Z";

const NodeShape = ({ layout }: { layout: NodeLayout }) => {
  const { cx, cy, w, h, shape, node } = layout;
  const tone = NODE_TONE[node.tone ?? "plain"];
  const left = cx - w / 2;
  const top = cy - h / 2;
  const common = { className: tone.shape, strokeWidth: node.tone ? 1.8 : 1.4 };

  if (node.fields) {
    let x = left;
    return (
      <g>
        {node.label !== "" && (
          <SvgText
            text={node.label}
            x={cx}
            y={top - 4 - (linesOf(node.label).length * SMALL_LINE) / 2}
            size={SMALL}
            line={SMALL_LINE}
            className="fill-muted-soft"
          />
        )}
        {node.fields.map((field, index) => {
          const width = layout.fieldWidths[index] ?? 0;
          const cell = (
            // biome-ignore lint/suspicious/noArrayIndexKey: 欄は同じ文字が並ぶことがあり、順は変わらない
            <g key={index}>
              <rect x={x} y={top} width={width} height={h} {...common} />
              <SvgText text={field} x={x + width / 2} y={cy} className={tone.text} />
            </g>
          );
          x += width;
          return cell;
        })}
      </g>
    );
  }

  // 左寄せの文字は、枠の左端から少し内側を起点にする（枠の無い text は余白を詰める）。
  const alignLeft = node.align === "left";
  const labelX = alignLeft ? left + (shape === "text" ? 4 : 12) : cx;
  const label = (y: number) => (
    <SvgText
      text={node.label}
      x={labelX}
      y={y}
      anchor={alignLeft ? "start" : "middle"}
      className={tone.text}
      weight={node.tone ? 700 : 500}
    />
  );

  switch (shape) {
    case "circle":
      return (
        <g>
          <circle cx={cx} cy={cy} r={w / 2} {...common} />
          {label(cy)}
        </g>
      );
    case "diamond":
      return (
        <g>
          <polygon
            points={`${cx},${top} ${left + w},${cy} ${cx},${top + h} ${left},${cy}`}
            {...common}
          />
          {label(cy)}
        </g>
      );
    case "db": {
      const ry = 7;
      return (
        <g>
          <path
            d={`M${left} ${top + ry} V${top + h - ry} A${w / 2} ${ry} 0 0 0 ${left + w} ${top + h - ry} V${top + ry}`}
            {...common}
          />
          <ellipse cx={cx} cy={top + ry} rx={w / 2} ry={ry} {...common} />
          {label(cy + ry / 2)}
        </g>
      );
    }
    case "actor": {
      return (
        <g>
          <g
            className={`fill-none ${LINE_TONE[node.tone ?? "plain"].stroke}`}
            strokeWidth={1.8}
            strokeLinecap="round"
          >
            <circle cx={cx} cy={top + 7} r={6} className={tone.shape} />
            <path
              d={`M${cx} ${top + 13} V${top + 25} M${cx - 10} ${top + 17} H${cx + 10} M${cx} ${top + 25} L${cx - 8} ${top + 35} M${cx} ${top + 25} L${cx + 8} ${top + 35}`}
            />
          </g>
          {label(top + 38 + (linesOf(node.label).length * LINE) / 2)}
        </g>
      );
    }
    case "cloud":
      return (
        <g>
          <path
            d={CLOUD}
            transform={`translate(${left} ${top}) scale(${w / 100} ${h / 60})`}
            vectorEffect="non-scaling-stroke"
            {...common}
          />
          {label(cy + h * 0.07)}
        </g>
      );
    case "text":
      return label(cy);
    case "round":
      return (
        <g>
          <rect x={left} y={top} width={w} height={h} rx={Math.min(h / 2, 16)} {...common} />
          {label(cy)}
        </g>
      );
    default:
      return (
        <g>
          <rect x={left} y={top} width={w} height={h} rx={4} {...common} />
          {label(cy)}
        </g>
      );
  }
};

const EdgeLine = ({ layout }: { layout: EdgeLayout }) => {
  const { edge, points, curved, selfLoop } = layout;
  const tone = LINE_TONE[edge.tone ?? "plain"];
  const arrow = edge.arrow ?? "to";
  // 遮断される線は × の手前で止めるので、矢じりは付けない。
  const headEnd = arrow !== "none" && !edge.blocked;
  const headStart = arrow === "both";

  const first = points[0] as Point;
  const last = points[points.length - 1] as Point;
  // 矢じりの向きは、端の 1 つ手前の点（曲線なら制御点）から決める。
  const beforeLast = points[points.length - 2] ?? first;
  const afterFirst = points[1] ?? last;

  const start = headStart ? shorten(afterFirst, first) : first;
  const end = headEnd ? shorten(beforeLast, last) : last;

  let d: string;
  if (selfLoop) {
    const [, c1, c2] = points as [Point, Point, Point, Point];
    d = `M${start.x} ${start.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`;
  } else if (curved) {
    const control = points[1] as Point;
    d = `M${start.x} ${start.y} Q${control.x} ${control.y} ${end.x} ${end.y}`;
  } else {
    d = polylinePath([start, ...points.slice(1, -1), end]);
  }

  return (
    <g>
      <path
        d={d}
        fill="none"
        className={tone.stroke}
        strokeWidth={edge.tone === "accent" || edge.tone === "ng" || edge.tone === "ok" ? 2 : 1.5}
        strokeDasharray={edge.dashed ? "5 4" : undefined}
        strokeLinejoin="round"
      />
      {headEnd && <ArrowHead from={beforeLast} tip={last} className={tone.fill} />}
      {headStart && <ArrowHead from={afterFirst} tip={first} className={tone.fill} />}
    </g>
  );
};

export const DiagramFigureBlock = ({ figure }: { figure: DiagramFigure }) => {
  const layout = layoutDiagram(figure);

  return (
    <SvgFrame view={layout.view} label={figure.caption}>
      {layout.groups.map((group, index) => {
        const source = figure.groups?.[index];
        const tone = source?.tone;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: 同じ見出しの囲みが並ぶことがあり、並べ替えない
          <g key={index}>
            <rect
              x={group.box.x}
              y={group.box.y}
              width={group.box.w}
              height={group.box.h}
              rx={10}
              className={
                tone && tone !== "muted"
                  ? `${NODE_TONE[tone].shape} [fill-opacity:0.5]`
                  : "fill-panel stroke-diagram-line"
              }
              strokeWidth={1.2}
              strokeDasharray="6 4"
            />
            <text
              x={group.labelBox.x + 2}
              y={group.labelBox.y + 11}
              fontSize={SMALL}
              fontWeight={700}
              className={tone ? NODE_TONE[tone].text : "fill-muted-soft"}
            >
              {source?.label}
            </text>
          </g>
        );
      })}

      {layout.edges.map((edge, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 同じ 2 つを結ぶ線が複数あり得る
        <EdgeLine key={index} layout={edge} />
      ))}

      {[...layout.nodes.values()].map((node) => (
        <g key={node.node.id}>
          <NodeShape layout={node} />
          {node.node.note && node.noteBox && (
            <SvgText
              text={node.node.note}
              x={node.node.notePlace === "right" ? node.noteBox.x : node.cx}
              y={node.noteBox.y + node.noteBox.h / 2}
              size={SMALL}
              line={SMALL_LINE}
              anchor={node.node.notePlace === "right" ? "start" : "middle"}
              className="fill-muted-soft"
            />
          )}
        </g>
      ))}

      {/* ポインタの起点の丸。部品の塗りに隠れないよう、部品の後に描く。 */}
      {layout.edges.map((edge, index) =>
        edge.edge.fromField !== undefined && edge.points[0] ? (
          <circle
            // biome-ignore lint/suspicious/noArrayIndexKey: 線と同じ並びで出す
            key={index}
            cx={edge.points[0].x}
            cy={edge.points[0].y}
            r={3.2}
            className={LINE_TONE[edge.edge.tone ?? "plain"].fill}
          />
        ) : null,
      )}

      {/* 線のラベル。裏に地の色の四角を敷いて、下を通る線（点線の隙間も）を隠す。 */}
      {layout.edges.map((edge, index) =>
        edge.edge.label && edge.labelBox ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: 線と同じ並びで出す
          <g key={index}>
            <rect
              x={edge.labelBox.x - 3}
              y={edge.labelBox.y - 1}
              width={edge.labelBox.w + 6}
              height={edge.labelBox.h + 2}
              rx={3}
              className="fill-surface"
            />
            <SvgText
              text={edge.edge.label}
              x={edge.labelAt.x}
              y={edge.labelAt.y}
              size={12}
              line={LINE}
              className={edge.edge.tone === "ng" ? "fill-ng" : "fill-ink-soft"}
            />
          </g>
        ) : null,
      )}

      {layout.edges.map((edge, index) =>
        edge.edge.blocked ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: 線と同じ並びで出す
          <BlockMark key={index} at={edge.blockAt} />
        ) : null,
      )}
    </SvgFrame>
  );
};
