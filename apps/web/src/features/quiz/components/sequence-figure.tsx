import type { SequenceFigure } from "../types";

/**
 * 登場人物の間のやり取りを、上から順に矢印で描く図（シーケンス図）。
 *
 * 列の幅をそろえ、矢印は列の中心から中心へ引く。誰から誰へ、どの順で流れるのかを
 * 文章を読まずに追えるようにするための図なので、矢印の向きと順番だけに絞って描く。
 */

/** 1 人ぶんの列幅。文字サイズの設定で伸びるよう em で持つ。 */
const COLUMN = "9.5em";

/**
 * 矢印は列の中心から中心へ引きたいが、グリッドの領域は列の端から端までになる。
 * またぐ列数で割った半列ぶんを左右から差し引いて、両端を中心にそろえる。
 */
const inset = (span: number) => `calc(50% / ${span})`;

type ArrowProps = {
  index: number;
  from: number;
  to: number;
  label: string;
  reply?: boolean;
};

const Arrow = ({ index, from, to, label, reply }: ArrowProps) => {
  const left = Math.min(from, to);
  const right = Math.max(from, to);
  const span = right - left + 1;
  const forward = to > from;

  return (
    <span
      className="relative flex flex-col justify-end"
      style={{
        gridRow: 1,
        gridColumn: `${left + 1} / ${right + 2}`,
        marginLeft: inset(span),
        marginRight: inset(span),
      }}
    >
      <span className="px-1 pb-1 text-center text-read-xs text-ink-soft leading-[1.5]">
        {index + 1}. {label}
      </span>
      <span
        className={`relative block border-accent ${reply ? "border-t border-dashed" : "border-t"}`}
      >
        <span
          aria-hidden="true"
          className={`-top-[0.42em] absolute text-[0.62em] text-accent leading-none ${
            forward ? "right-0" : "left-0"
          }`}
        >
          {forward ? "▶" : "◀"}
        </span>
      </span>
    </span>
  );
};

/** 相手のいないやり取り（その場での処理）。矢印にせず、その列に小さな箱で置く。 */
const SelfStep = ({ index, at, label }: { index: number; at: number; label: string }) => (
  <span className="flex justify-center px-1" style={{ gridRow: 1, gridColumn: at + 1 }}>
    <span className="self-center rounded-[6px] border border-accent/45 bg-accent-soft px-2 py-1 text-center text-read-xs text-accent-deep leading-[1.5]">
      {index + 1}. {label}
    </span>
  </span>
);

export const SequenceFigureBlock = ({ figure }: { figure: SequenceFigure }) => {
  // 列の幅を詰めると矢印の起点と終点がずれて読めなくなるので、狭い画面では横へ流す。
  const gridStyle = { gridTemplateColumns: `repeat(${figure.actors.length}, ${COLUMN})` };

  return (
    <div className="overflow-x-auto">
      <div className="flex w-max flex-col">
        <div className="grid" style={gridStyle}>
          {figure.actors.map((actor) => (
            <span key={actor} className="px-1">
              <span className="flex h-full items-center justify-center rounded-[7px] border border-figure-line bg-figure px-2 py-1.5 text-center font-bold text-accent text-read-xs leading-[1.4]">
                {actor}
              </span>
            </span>
          ))}
        </div>

        {figure.steps.map((step, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: 同じやり取りが繰り返されるので中身はキーにできない
            key={index}
            className="grid py-1.5"
            style={gridStyle}
          >
            {/* 生存線。矢印の下に敷いて、どの列の話かを追えるようにする。 */}
            {figure.actors.map((actor, column) => (
              <span
                key={actor}
                className="flex justify-center"
                style={{ gridRow: 1, gridColumn: column + 1 }}
              >
                <span className="w-px bg-edge" />
              </span>
            ))}

            {step.from === step.to ? (
              <SelfStep index={index} at={step.from} label={step.label} />
            ) : (
              <Arrow
                index={index}
                from={step.from}
                to={step.to}
                label={step.label}
                reply={step.reply}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
