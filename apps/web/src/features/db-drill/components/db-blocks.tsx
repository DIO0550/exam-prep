import { DrillText, TextBlockView } from "@/features/fill-drill/components/drill-text";
import type { Marks } from "@/features/fill-drill/types";

import type { DbBlock, DbColumn } from "../types";
import { ErFigure } from "./er-figure";

/** 列名。主キーは実線、外部キーは破線の下線（本試験の関係スキーマの書き方）。 */
// 文字の下線（text-decoration）は空欄の枠（inline-block）の下に引かれないので、下の枠線で引く。
const Column = ({ column, marks }: { column: DbColumn; marks: Marks }) => (
  <span
    className={
      column.key === "pk"
        ? "inline-block border-ink-soft border-b pb-0.5 leading-[1.6]"
        : column.key === "fk"
          ? "inline-block border-ink-soft border-b border-dashed pb-0.5 leading-[1.6]"
          : undefined
    }
  >
    <DrillText text={column.name} marks={marks} />
  </span>
);

/** SQL・表のドリルの本文 1 かたまり。E-R 図と関係スキーマのほかは、穴埋めドリル共通の見た目で組む。 */
export const DbBlockView = ({ block, marks }: { block: DbBlock; marks: Marks }) => {
  switch (block.kind) {
    case "er":
      return (
        <ErFigure
          caption={block.caption}
          entities={block.entities}
          relations={block.relations}
          marks={marks}
        />
      );
    case "schema":
      return (
        <figure className="flex flex-col gap-1.5 py-1">
          <div className="flex flex-col gap-1.5 rounded-md border border-edge bg-panel px-4 py-3 text-read-md text-ink-soft leading-[2.1]">
            {block.schemas.map((schema) => (
              <p key={schema.name}>
                {schema.name}（
                {schema.columns.map((column, i) => (
                  <span key={column.name}>
                    {i > 0 && "，"}
                    <Column column={column} marks={marks} />
                  </span>
                ))}
                ）
              </p>
            ))}
          </div>
          <figcaption className="text-center text-read-sm text-ink">{block.caption}</figcaption>
          <p className="text-center text-read-xs text-muted">
            実線の下線は主キー，破線の下線は外部キーを表す。主キーの一部である外部キーには破線を付けない。
          </p>
        </figure>
      );
    default:
      return <TextBlockView block={block} marks={marks} />;
  }
};
