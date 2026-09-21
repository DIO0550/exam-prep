import type { TreeFigure, TreeNode } from "../types";

/**
 * 2 分木。
 *
 * 節点は配列表現の添字（根が 1、左の子が 2i、右の子が 2i+1）で受け取り、そこから位置を決める。
 * 同じ深さの節点は同じ高さに、左から順に並ぶので、「配列の添字順にたどる＝幅優先」のような
 * 話がそのまま目で追える。
 */

/** 節点の色。既定は地の色で、注目させたいものにだけ付ける。 */
const TONE = {
  accent: { fill: "fill-accent-soft", stroke: "stroke-accent", text: "fill-accent-deep" },
  ok: { fill: "fill-ok-soft", stroke: "stroke-ok", text: "fill-ok" },
  ng: { fill: "fill-ng-soft", stroke: "stroke-ng", text: "fill-ng" },
  plain: { fill: "fill-surface", stroke: "stroke-edge-strong", text: "fill-ink" },
} as const;

/** 節点 1 つ分の大きさと、描く間隔。 */
const NODE_R = 17;
const ROW_H = 60;
const SIDE = 26;

/** 添字から深さ（0 始まり）を出す。1 が深さ 0、2〜3 が深さ 1、4〜7 が深さ 2。 */
const depthOf = (at: number): number => Math.floor(Math.log2(at));

export const TreeFigureBlock = ({ figure }: { figure: TreeFigure }) => {
  const maxDepth = Math.max(...figure.nodes.map((node) => depthOf(node.at)));
  const byIndex = new Map(figure.nodes.map((node) => [node.at, node]));

  /**
   * 横位置は、居る節点だけを通りがけ順（左→根→右）に並べた順で決める。
   * 添字の位置そのままに置くと、片側だけ深い木で空きが広がり、端まで見に行くことになる。
   */
  const columnOf = new Map<number, number>();
  const root = figure.nodes.reduce((min, node) => Math.min(min, node.at), Number.POSITIVE_INFINITY);
  const walk = (at: number): void => {
    if (!byIndex.has(at)) return;
    walk(at * 2);
    columnOf.set(at, columnOf.size);
    walk(at * 2 + 1);
  };
  walk(root);

  const columns = Math.max(1, columnOf.size);
  const width = columns * 52 + SIDE * 2;
  const height = (maxDepth + 1) * ROW_H;

  const xOf = (at: number): number => {
    const inner = width - SIDE * 2;
    return SIDE + (inner * ((columnOf.get(at) ?? 0) + 0.5)) / columns;
  };
  const yOf = (at: number): number => ROW_H * depthOf(at) + ROW_H / 2;
  const toneOf = (node: TreeNode) => TONE[node.tone ?? "plain"];

  return (
    // 木は横に広がるので、狭い画面では横へ流す（詰めると親子の線が読めなくなる）。
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="h-auto max-w-none"
        aria-hidden="true"
      >
        {/* 親子の線。子から親へ引く（親がいない根は引かない）。 */}
        {figure.nodes.map((node) => {
          const parent = byIndex.get(Math.floor(node.at / 2));
          if (!parent) return null;
          return (
            <line
              key={`edge-${node.at}`}
              x1={xOf(parent.at)}
              y1={yOf(parent.at) + NODE_R}
              x2={xOf(node.at)}
              y2={yOf(node.at) - NODE_R}
              className="stroke-edge-strong"
              strokeWidth={1.4}
            />
          );
        })}

        {figure.nodes.map((node) => {
          const tone = toneOf(node);
          return (
            <g key={node.at}>
              <circle
                cx={xOf(node.at)}
                cy={yOf(node.at)}
                r={NODE_R}
                className={`${tone.fill} ${tone.stroke}`}
                strokeWidth={1.6}
              />
              <text
                x={xOf(node.at)}
                y={yOf(node.at) + 4}
                textAnchor="middle"
                className={`${tone.text} font-bold`}
                fontSize="13"
              >
                {node.label}
              </text>
              {node.note && (
                <text
                  x={xOf(node.at)}
                  y={yOf(node.at) + NODE_R + 14}
                  textAnchor="middle"
                  className="fill-muted-soft"
                  fontSize="11"
                >
                  {node.note}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
