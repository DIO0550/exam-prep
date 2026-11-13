import { TextBlockView } from "@/features/fill-drill/components/drill-text";
import type { Marks } from "@/features/fill-drill/types";
import { networkDescription } from "@/features/nw-drill/figure-text";
import { ChartFigureBlock } from "@/features/quiz/components/chart-figure";
import { DiagramFigureBlock } from "@/features/quiz/components/diagram-figure";
import { SequenceFigureBlock } from "@/features/quiz/components/sequence-figure";

import type { PmBlock } from "../types";

type BodyFigure = Extract<PmBlock, { kind: "figure" }>["figure"];

/**
 * 本文の図（構成図・やり取りの順番・グラフ）。下に図番号付きの見出しを置く。
 * 構成図の代替テキストには、部品と注記、つながりを文で入れる（ネットワークのドリルと同じ）。
 */
const BodyFigureView = ({ figure }: { figure: BodyFigure }) => (
  <figure className="flex flex-col items-center gap-1.5 py-1">
    {/* SvgFrame は幅いっぱいに広がり、図の幅を上限に縮む。中央に寄せるため svg の左右を auto にする。 */}
    <div className="w-full overflow-x-auto rounded-md border border-edge bg-surface px-3 py-3 [&_svg]:mx-auto">
      <div>
        {figure.type === "diagram" && (
          <DiagramFigureBlock figure={{ ...figure, caption: networkDescription(figure) }} />
        )}
        {figure.type === "sequence" && <SequenceFigureBlock figure={figure} />}
        {figure.type === "chart" && <ChartFigureBlock figure={figure} />}
      </div>
    </div>
    <figcaption className="text-center text-read-sm text-ink">{figure.caption}</figcaption>
  </figure>
);

/** 午後の穴埋めドリルの本文 1 かたまり。図のほかは、穴埋めドリル共通の見た目で組む。 */
export const PmBlockView = ({ block, marks }: { block: PmBlock; marks: Marks }) =>
  block.kind === "figure" ? (
    <BodyFigureView figure={block.figure} />
  ) : (
    <TextBlockView block={block} marks={marks} />
  );
