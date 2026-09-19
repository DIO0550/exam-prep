import type { TreeFigure } from "../types";
import { layoutTree, NODE_H, NODE_W } from "./tree-layout";

/**
 * 節と枝で描く木構造の図。
 *
 * 木の形そのものが答えになる問題（2 分探索木の削除、式木、AVL 木の回転）では、
 * 文章で「左部分木の最大値」と書くより、実際に枝を引いたほうが早い。
 *
 * SVG で描き、幅を文字サイズの倍率に合わせて伸ばす。狭い画面でははみ出すので横へ流す。
 */
export const TreeFigureBlock = ({ figure }: { figure: TreeFigure }) => {
  const layout = layoutTree(figure);
  if (layout.nodes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          width={layout.width}
          height={layout.height}
          style={{ width: `calc(${layout.width}px * var(--text-scale))`, height: "auto" }}
          role="img"
          aria-label={figure.caption}
        >
          {layout.edges.map((edge) => (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              className="stroke-edge-strong"
              strokeWidth={1.5}
            />
          ))}

          {layout.nodes.map((node) => (
            <g key={node.id}>
              <rect
                x={node.x - NODE_W / 2}
                y={node.y - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx={7}
                className={node.marked ? "fill-accent stroke-accent" : "fill-surface stroke-edge"}
                strokeWidth={1.5}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={14}
                className={node.marked ? "fill-surface font-bold" : "fill-ink"}
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {figure.footnote && (
        <div className="text-read-xs text-muted-soft leading-[1.6]">{figure.footnote}</div>
      )}
    </div>
  );
};
