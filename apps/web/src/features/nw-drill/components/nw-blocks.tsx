import { TextBlockView } from "@/features/fill-drill/components/drill-text";
import type { Marks } from "@/features/fill-drill/types";
import { DiagramFigureBlock } from "@/features/quiz/components/diagram-figure";
import type { DiagramFigure } from "@/features/quiz/types";

import { networkDescription } from "../figure-text";
import type { NwBlock } from "../types";

/**
 * ネットワーク構成図。解説の図と同じ部品（箱・雲・囲み）で描き、下に図番号付きの見出しを置く。
 * 図の代替テキストには、機器とアドレス、つながりを文で入れる。
 */
const NetworkFigure = ({ figure }: { figure: DiagramFigure }) => (
  <figure className="flex flex-col items-center gap-1.5 py-1">
    {/* SvgFrame は幅いっぱいに広がり、図の幅を上限に縮む。中央に寄せるため svg の左右を auto にする。 */}
    <div className="w-full rounded-md border border-edge bg-surface px-3 py-3 [&_svg]:mx-auto">
      <div>
        <DiagramFigureBlock figure={{ ...figure, caption: networkDescription(figure) }} />
      </div>
    </div>
    <figcaption className="text-center text-read-sm text-ink">{figure.caption}</figcaption>
  </figure>
);

/** ネットワークのドリルの本文 1 かたまり。構成図のほかは、穴埋めドリル共通の見た目で組む。 */
export const NwBlockView = ({ block, marks }: { block: NwBlock; marks: Marks }) =>
  block.kind === "figure" ? (
    <NetworkFigure figure={block.figure} />
  ) : (
    <TextBlockView block={block} marks={marks} />
  );
