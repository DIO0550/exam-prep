import type { BarTone, TimelineFigure, TimelineGroup, TimelineTrack } from "../types";
import { timelineGroups } from "../types";

/**
 * 時間の流れに沿って、どの処理がいつ動いているかを見せる図（タイムチャート）。
 *
 * 1 列が 1 目盛りで、帯は「開始時刻」と「長さ」で置く。数字を読んで頭の中で並べ直さなくても、
 * 重なりと空きがそのまま見えるようにするための図なので、列幅は固定にして時間軸をそろえる。
 *
 * 選択肢ごとに並べる（groups）ときは、同じ時間軸のまま段を積み、締切の縦線と、
 * 締切までに終わらなかった分を添える。「どれなら間に合うか」を、数えずに見て決められるようにする。
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

type GridStyle = { gridTemplateColumns: string };

type TrackRowProps = {
  track: TrackWithTone;
  span: number;
  gridStyle: GridStyle;
  group: TimelineGroup;
};

/** 段ごとに色を決めておく。同じ処理が段をまたいでも同じ色で出す。 */
type TrackWithTone = TimelineTrack & { tone: BarTone };

const withTone = (tracks: TimelineTrack[]): TrackWithTone[] =>
  tracks.map((track, index) => ({ ...track, tone: toneOf(track.bars[0]?.tone, index) }));

const TrackRow = ({ track, span, gridStyle, group }: TrackRowProps) => {
  const missed = group.missed?.track === track.label ? group.missed : undefined;

  return (
    <div className="grid items-center border-line-softer border-t py-1" style={gridStyle}>
      <span className="pr-2 text-right text-read-xs text-ink">{track.label}</span>

      {/* 空の目盛り。帯が無いところにも薄い区切りを残して、時刻を数えられるようにする。 */}
      {Array.from({ length: span }, (_, tick) => (
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
            BAR_TONE[toneOf(bar.tone ?? track.tone, index)]
          }`}
          style={{ gridRow: 1, gridColumn: `${bar.start + 2} / span ${bar.length}` }}
        >
          {bar.label}
        </span>
      ))}

      {/* 締切までに終わらなかった分。中身は同じでも、間に合っていないことが分かるよう点線で出す。 */}
      {missed && (
        <span
          className="h-[2.2em] rounded-[4px] border border-ng border-dashed"
          style={{ gridRow: 1, gridColumn: `${missed.start + 2} / span ${missed.length}` }}
        />
      )}

      {/* 締切の縦線。段をまたいで同じ位置に立てる。 */}
      {group.deadline && (
        <span
          aria-hidden="true"
          className="-ml-px h-[2.6em] border-ng border-l border-dashed"
          style={{ gridRow: 1, gridColumn: group.deadline.at + 2 }}
        />
      )}
    </div>
  );
};

/** 図の下に出す凡例。何の帯か、点線が何を指すかを言葉で残す。 */
const Legend = ({ tracks, hasDeadline }: { tracks: TrackWithTone[]; hasDeadline: boolean }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 text-read-xs text-muted-soft">
    {tracks.map((track) => (
      <span key={track.label} className="flex items-center gap-1.5">
        <span className={`inline-block h-3 w-6 rounded-[3px] border ${BAR_TONE[track.tone]}`} />
        {track.label}
      </span>
    ))}
    {hasDeadline && (
      <>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-0 border-ng border-l border-dashed" />
          締切
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded-[3px] border border-ng border-dashed" />
          締切までに終わらなかった分
        </span>
      </>
    )}
  </div>
);

export const TimelineFigureBlock = ({ figure }: { figure: TimelineFigure }) => {
  const gridStyle: GridStyle = {
    gridTemplateColumns: `${LABEL} repeat(${figure.span}, ${TICK})`,
  };
  const groups = timelineGroups(figure);
  const hasDeadline = groups.some((group) => group.deadline !== undefined);
  // 凡例の色は、その段の帯が実際に使っている色に合わせる。帯が 1 本も無い段（ずっと待っている
  // タスクなど）は、ほかのまとまりの同じ段から色を拾う。
  const legendTracks = withTone(groups[0]?.tracks ?? []).map((track) => {
    if (track.bars.length > 0) return track;
    for (const group of groups) {
      const same = group.tracks.find((candidate) => candidate.label === track.label);
      const tone = same?.bars[0]?.tone;
      if (tone) return { ...track, tone };
    }
    return track;
  });
  // 見出しのあるまとまりが 1 つでもあれば、凡例を出す（帯の色が何を指すか言葉で残す）。
  const labelled = groups.some((group) => group.label !== "");

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

        {groups.map((group) => (
          <div key={group.label} className="flex flex-col">
            {group.label !== "" && (
              <div className="flex flex-wrap items-baseline gap-2.5 pt-3.5 pb-0.5">
                <span
                  className={`font-bold text-read-sm ${
                    group.verdict === "ok"
                      ? "text-ok"
                      : group.verdict === "ng"
                        ? "text-ng"
                        : "text-ink"
                  }`}
                >
                  {group.label}
                </span>
                {group.note && <span className="text-read-xs text-muted">{group.note}</span>}
              </div>
            )}

            {withTone(group.tracks).map((track) => (
              <TrackRow
                key={track.label}
                track={track}
                span={figure.span}
                gridStyle={gridStyle}
                group={group}
              />
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

        {labelled && <Legend tracks={legendTracks} hasDeadline={hasDeadline} />}
      </div>
    </div>
  );
};
