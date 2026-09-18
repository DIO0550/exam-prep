import type { BarTone, TimelineFigure } from "../types";

/**
 * 時間の流れに沿って、どの処理がいつ動いているかを見せる図（タイムチャート）。
 *
 * 1 列が 1 目盛りで、帯は「開始時刻」と「長さ」で置く。数字を読んで頭の中で並べ直さなくても、
 * 重なりと空きがそのまま見えるようにするための図なので、列幅は固定にして時間軸をそろえる。
 */

/** 帯の色。意味は持たず、隣と見分けるためのもの。 */
const BAR_TONE: Record<BarTone, string> = {
  1: "border-bar-1-line bg-bar-1 text-bar-1-ink",
  2: "border-bar-2-line bg-bar-2 text-bar-2-ink",
  3: "border-bar-3-line bg-bar-3 text-bar-3-ink",
  4: "border-bar-4-line bg-bar-4 text-bar-4-ink",
  5: "border-bar-5-line bg-bar-5 text-bar-5-ink",
};

/** 色を指定しなかった帯に順番に振る色。 */
const toneOf = (tone: BarTone | undefined, index: number): BarTone =>
  tone ?? (((index % 5) + 1) as BarTone);

/** 1 目盛りの幅と、左の見出し列の幅。 */
const TICK = "2.2em";
const LABEL = "7em";

export const TimelineFigureBlock = ({ figure }: { figure: TimelineFigure }) => {
  const gridStyle = {
    gridTemplateColumns: `${LABEL} repeat(${figure.span}, ${TICK})`,
  };

  return (
    // 目盛りを詰めると時間の長さが読めなくなるので、狭い画面では横へ流す。
    <div className="overflow-x-auto">
      <div className="flex w-max flex-col text-read-sm">
        {/* 目盛り。数字はその区間の終わりの時刻を指す。 */}
        <div className="grid items-end" style={gridStyle}>
          <span className="pr-2 text-right text-read-xs text-muted-soft">（{figure.unit}）</span>
          {Array.from({ length: figure.span }, (_, tick) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: 目盛りは並べ替わらない固定の目盛り
              key={tick}
              className="border-line-soft border-l pb-1 text-center text-read-xs text-muted-soft tabular-nums"
            >
              {tick + 1}
            </span>
          ))}
        </div>

        {figure.tracks.map((track) => (
          <div
            key={track.label}
            className="grid items-center border-line-softer border-t py-1"
            style={gridStyle}
          >
            <span className="pr-2 text-right text-read-xs text-ink">{track.label}</span>

            {/* 空の目盛り。帯が無いところにも薄い区切りを残して、時刻を数えられるようにする。 */}
            {Array.from({ length: figure.span }, (_, tick) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: 目盛りは並べ替わらない固定の目盛り
                key={tick}
                className="h-[2.2em] border-line-soft border-l"
                style={{ gridRow: 1, gridColumn: tick + 2 }}
              />
            ))}

            {track.bars.map((bar, index) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: 同じ名前の帯が並ぶので中身はキーにできない
                key={index}
                className={`flex h-[2.2em] items-center justify-center overflow-hidden rounded-[4px] border px-1 text-read-xs ${
                  BAR_TONE[toneOf(bar.tone, index)]
                }`}
                style={{ gridRow: 1, gridColumn: `${bar.start + 2} / span ${bar.length}` }}
              >
                {bar.label}
              </span>
            ))}
          </div>
        ))}

        {figure.marks && (
          <div className="grid border-line-softer border-t pt-1" style={gridStyle}>
            <span />
            {figure.marks.map((mark) => (
              <span
                key={mark.label}
                className="flex flex-col items-start text-read-xs text-muted-soft leading-none"
                style={{ gridRow: 1, gridColumn: mark.at + 2 }}
              >
                <span aria-hidden="true" className="-translate-x-1/2 text-accent">
                  ▲
                </span>
                <span className="-translate-x-1/2 mt-0.5 whitespace-nowrap [writing-mode:vertical-rl]">
                  {mark.label}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
