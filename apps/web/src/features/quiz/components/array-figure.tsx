import type { ArrayFigure } from "../types";

/**
 * 配列の中身が段階ごとにどう変わるかを見せる図。
 *
 * セルは同じ幅の箱で、段をそろえて縦に並べる。「どこが動いたか」を目で追うための図なので、
 * 幅は文字数ではなく `--cell` で固定する（段ごとに箱の位置がずれると追えなくなる）。
 * 文字サイズの設定で拡大できるよう、単位は em にしてある。
 */

/** セルの幅と間隔。SVG を使わず、同じグリッドを重ねて矢印を引くために共有する。 */
const CELL = "2.6em";
const GAP = "0.3em";

const gridStyle = (count: number) => ({
  gridTemplateColumns: `repeat(${count}, ${CELL})`,
  gap: GAP,
});

/**
 * 比べた 2 つのセルを結ぶ印。上から挟み込む形にして、どの 2 つを見比べたのかを示す。
 * セルと同じグリッドに置き、列をまたがせて幅を合わせる。
 */
const SwapBracket = ({ from, to }: { from: number; to: number }) => {
  const left = Math.min(from, to);
  const right = Math.max(from, to);

  return (
    <span
      className="relative block h-[0.9em] self-end border-accent border-t border-r border-l"
      style={{ gridColumn: `${left + 1} / ${right + 2}` }}
    >
      <span className="-bottom-[0.2em] -translate-x-1/2 absolute left-0 text-[0.6em] text-accent leading-none">
        ▼
      </span>
      <span className="-bottom-[0.2em] absolute right-0 translate-x-1/2 text-[0.6em] text-accent leading-none">
        ▼
      </span>
    </span>
  );
};

export const ArrayFigureBlock = ({ figure }: { figure: ArrayFigure }) => {
  const count = Math.max(...figure.rows.map((row) => row.cells.length));

  return (
    // 狭い画面では箱を潰さず横へ流す（潰すと段の対応が取れなくなる）。
    <div className="overflow-x-auto">
      <div className="flex w-max flex-col gap-1.5 text-read-sm">
        {figure.headers && (
          <div className="flex items-end gap-3">
            <span className="w-[7em] flex-none" />
            <div className="grid" style={gridStyle(count)}>
              {figure.headers.map((header) => (
                <span key={header} className="text-center text-read-xs text-muted-soft">
                  {header}
                </span>
              ))}
            </div>
          </div>
        )}

        {figure.rows.map((row, rowIndex) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: 同じ見出しの段が並ぶ（同じページを2回参照するなど）
            key={rowIndex}
            className="flex items-end gap-3"
          >
            <span className="w-[7em] flex-none text-right text-read-xs text-muted-soft">
              {row.label}
            </span>

            <div className="flex flex-col">
              {/* 比べた位置の印。無い段でも高さを空けておき、段の間隔をそろえる。 */}
              <div className="grid h-[1.1em] items-end" style={gridStyle(count)}>
                {row.swap && <SwapBracket from={row.swap[0]} to={row.swap[1]} />}
              </div>

              <div className="grid" style={gridStyle(count)}>
                {row.cells.map((cell, index) => {
                  const marked = row.marked?.includes(index);
                  return (
                    <span
                      // biome-ignore lint/suspicious/noArrayIndexKey: 同じ値が並ぶので中身はキーにできない
                      key={index}
                      className={`flex h-[2.1em] items-center justify-center rounded-[4px] border tabular-nums ${
                        marked
                          ? "border-accent bg-accent font-bold text-surface"
                          : "border-edge bg-surface text-ink"
                      }`}
                    >
                      {cell}
                    </span>
                  );
                })}
              </div>
            </div>

            {row.note && (
              <span className="max-w-[26em] text-read-xs text-muted-soft leading-[1.6]">
                {row.note}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
