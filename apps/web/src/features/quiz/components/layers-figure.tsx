import type { LayersFigure } from "../types";
import { BAR_TONE, toneOf } from "./bar-tone";

/**
 * 積み重なった層を描く図。
 *
 * 上下の関係そのものが答えになる話（OSI 基本参照モデル、3 層スキーマ、仮想化の構成）では、
 * 表で並べるより実際に積んだほうが速い。段の色は隣と見分けるためだけに振る。
 */
export const LayersFigureBlock = ({ figure }: { figure: LayersFigure }) => {
  return (
    <div className="flex max-w-[46em] flex-col gap-1.5">
      {figure.layers.map((layer, index) => (
        <div
          key={layer.name}
          className={`flex flex-wrap items-baseline gap-x-3.5 gap-y-1 rounded-[7px] border px-3.5 py-2.5 ${
            BAR_TONE[toneOf(layer.tone, index)]
          }`}
        >
          <span className="flex-[0_0_10em] font-bold text-read-sm">{layer.name}</span>
          {layer.note && (
            <span className="min-w-[12em] flex-1 text-pretty text-read-xs leading-[1.6]">
              {layer.note}
            </span>
          )}
        </div>
      ))}

      {figure.footnote && (
        <div className="text-read-xs text-muted-soft leading-[1.6]">{figure.footnote}</div>
      )}
    </div>
  );
};
