import type { ReactNode } from "react";

import type { SketchFigure, SketchName } from "../types";

/**
 * 図の見本。
 *
 * 「連関図はどれか」のように、選択肢が図の名前や言葉の説明だけで並ぶ設問は、
 * 形を知らないと選べない。ここに各図の形だけを描いておき、並べて見比べられるようにする。
 *
 * 線は currentColor、塗りは親から渡す色に寄せてある。中身は「その図らしさ」が分かる
 * 最小限だけで、正確な記法の再現は狙っていない（記法そのものを問う設問には原本の図を使う）。
 */

const BOX = "fill-surface stroke-current";
const FILL = "fill-accent-soft stroke-current";
const INK = "fill-current";

/** どの見本も同じ大きさの枠に描く。 */
const Frame = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 200 120"
    className="h-auto w-full text-muted"
    strokeWidth={1.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

/** 矢印の先端。角度は使う側で transform を付けて合わせる。 */
const Arrow = ({ x, y, angle = 0 }: { x: number; y: number; angle?: number }) => (
  <path
    d="M0 0 L-6 -3 L-6 3 Z"
    className={INK}
    stroke="none"
    transform={`translate(${x} ${y}) rotate(${angle})`}
  />
);

const SKETCHES: Record<SketchName, ReactNode> = {
  連関図: (
    <Frame>
      <title>連関図</title>
      <ellipse cx="100" cy="60" rx="30" ry="16" className={FILL} />
      <circle cx="30" cy="26" r="12" className={BOX} />
      <circle cx="170" cy="26" r="12" className={BOX} />
      <circle cx="26" cy="96" r="12" className={BOX} />
      <circle cx="172" cy="96" r="12" className={BOX} />
      <circle cx="100" cy="14" r="10" className={BOX} />
      <path d="M40 32 L72 52" className="stroke-current" fill="none" />
      <path d="M160 32 L130 52" className="stroke-current" fill="none" />
      <path d="M36 90 L74 70" className="stroke-current" fill="none" />
      <path d="M162 90 L128 70" className="stroke-current" fill="none" />
      <path d="M100 24 L100 42" className="stroke-current" fill="none" />
      <path d="M42 26 L158 26" className="stroke-current" strokeDasharray="4 4" fill="none" />
      <Arrow x={74} y={53} angle={32} />
      <Arrow x={128} y={53} angle={148} />
      <Arrow x={100} y={44} angle={90} />
    </Frame>
  ),

  親和図: (
    <Frame>
      <title>親和図</title>
      {[8, 72, 136].map((x, group) => (
        <g key={x}>
          <rect x={x} y="10" width="56" height="14" rx="3" className={FILL} />
          {[32, 52, 72].slice(0, group === 1 ? 2 : 3).map((y) => (
            <rect key={y} x={x + 4} y={y} width="48" height="14" rx="2" className={BOX} />
          ))}
          <rect
            x={x - 2}
            y="4"
            width="64"
            height={group === 1 ? 70 : 90}
            rx="6"
            className="fill-none stroke-current"
            strokeDasharray="5 4"
          />
        </g>
      ))}
    </Frame>
  ),

  系統図: (
    <Frame>
      <title>系統図</title>
      <rect x="6" y="48" width="44" height="22" rx="3" className={FILL} />
      {[14, 50, 86].map((y) => (
        <rect key={y} x="78" y={y} width="42" height="18" rx="3" className={BOX} />
      ))}
      {[6, 30, 66, 90].map((y) => (
        <rect key={y} x="146" y={y} width="46" height="14" rx="3" className={BOX} />
      ))}
      <path
        d="M50 59 H64 M64 23 V95 M64 23 H78 M64 59 H78 M64 95 H78 M120 23 H134 M134 13 V37 M134 13 H146 M134 37 H146 M120 95 H134 M134 73 V97 M134 73 H146 M134 97 H146"
        className="stroke-current"
        fill="none"
      />
    </Frame>
  ),

  特性要因図: (
    <Frame>
      <title>特性要因図</title>
      <path d="M8 60 H160" className="stroke-current" fill="none" strokeWidth={2} />
      <rect x="160" y="48" width="34" height="24" rx="3" className={FILL} />
      <path
        d="M36 22 L58 60 M76 22 L98 60 M116 22 L138 60 M30 98 L52 60 M70 98 L92 60 M110 98 L132 60"
        className="stroke-current"
        fill="none"
      />
      <path
        d="M44 34 L52 34 M84 34 L92 34 M124 34 L132 34 M40 86 L48 86 M80 86 L88 86"
        className="stroke-current"
        fill="none"
      />
      <Arrow x={160} y={60} angle={180} />
    </Frame>
  ),

  パレート図: (
    <Frame>
      <title>パレート図</title>
      <path d="M18 8 V102 H190" className="stroke-current" fill="none" />
      {(
        [
          [28, 30],
          [54, 46],
          [80, 62],
          [106, 74],
          [132, 84],
          [158, 92],
        ] as const
      ).map(([x, y]) => (
        <rect key={x} x={x} y={y} width="20" height={102 - y} className={FILL} />
      ))}
      <path
        d="M38 74 L64 52 L90 36 L116 26 L142 18 L168 12"
        className="stroke-current"
        fill="none"
        strokeWidth={1.8}
      />
      {(
        [
          [38, 74],
          [90, 36],
          [168, 12],
        ] as const
      ).map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="2.6" className={INK} stroke="none" />
      ))}
    </Frame>
  ),

  マトリックス図: (
    <Frame>
      <title>マトリックス図</title>
      <rect x="10" y="10" width="180" height="100" rx="3" className={BOX} />
      <path
        d="M10 34 H190 M46 10 V110 M82 10 V110 M118 10 V110 M154 10 V110 M10 60 H190 M10 86 H190"
        className="stroke-current"
        fill="none"
      />
      <rect x="10" y="10" width="36" height="24" className={FILL} />
      <rect x="46" y="10" width="144" height="24" className={FILL} />
      {(
        [
          [64, 48],
          [136, 48],
          [100, 74],
          [172, 74],
          [64, 100],
        ] as const
      ).map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y - 1} r="6" className="fill-none stroke-current" />
      ))}
      <circle cx="100" cy="47" r="3" className={INK} stroke="none" />
    </Frame>
  ),

  アローダイアグラム: (
    <Frame>
      <title>アローダイアグラム</title>
      {(
        [
          [20, 60],
          [78, 26],
          [78, 94],
          [136, 60],
          [186, 60],
        ] as const
      ).map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="11" className={BOX} />
      ))}
      <path
        d="M30 54 L66 32 M30 66 L66 88 M88 32 L126 54 M88 88 L126 66 M147 60 H174"
        className="stroke-current"
        fill="none"
      />
      <path d="M78 37 V83" className="stroke-current" strokeDasharray="4 4" fill="none" />
      <Arrow x={67} y={32} angle={-31} />
      <Arrow x={67} y={88} angle={31} />
      <Arrow x={127} y={54} angle={149} />
      <Arrow x={127} y={66} angle={211} />
      <Arrow x={175} y={60} angle={0} />
    </Frame>
  ),

  クラス図: (
    <Frame>
      <title>クラス図</title>
      {[10, 116].map((x) => (
        <g key={x}>
          <rect x={x} y="18" width="74" height="70" rx="3" className={BOX} />
          <rect x={x} y="18" width="74" height="20" rx="3" className={FILL} />
          <path d={`M${x} 62 H${x + 74}`} className="stroke-current" fill="none" />
          <path
            d={`M${x + 10} 48 H${x + 50} M${x + 10} 74 H${x + 56}`}
            className="stroke-current"
            fill="none"
            strokeDasharray="3 3"
          />
        </g>
      ))}
      <path d="M84 53 H116" className="stroke-current" fill="none" />
      <text x="90" y="48" className={INK} stroke="none" fontSize="10">
        1..*
      </text>
    </Frame>
  ),

  オブジェクト図: (
    <Frame>
      <title>オブジェクト図</title>
      {[10, 116].map((x) => (
        <g key={x}>
          <rect x={x} y="24" width="74" height="60" rx="3" className={BOX} />
          <rect x={x} y="24" width="74" height="22" rx="3" className={FILL} />
          {/* インスタンス名は下線付きで書く、が見分けの要点。 */}
          <path
            d={`M${x + 12} 40 H${x + 62}`}
            className="stroke-current"
            fill="none"
            strokeWidth={1.8}
          />
          <path
            d={`M${x + 10} 60 H${x + 54} M${x + 10} 72 H${x + 46}`}
            className="stroke-current"
            fill="none"
            strokeDasharray="3 3"
          />
        </g>
      ))}
      <path d="M84 56 H116" className="stroke-current" fill="none" />
    </Frame>
  ),

  アクティビティ図: (
    <Frame>
      <title>アクティビティ図</title>
      <circle cx="100" cy="12" r="6" className={INK} stroke="none" />
      <path d="M100 18 V28" className="stroke-current" fill="none" />
      <rect x="66" y="28" width="68" height="18" rx="9" className={FILL} />
      <path d="M100 46 V54" className="stroke-current" fill="none" />
      <path d="M100 54 L114 66 L100 78 L86 66 Z" className={BOX} />
      <path d="M86 66 H40 V88 M114 66 H160 V88" className="stroke-current" fill="none" />
      <rect x="12" y="88" width="56" height="16" rx="8" className={BOX} />
      <rect x="132" y="88" width="56" height="16" rx="8" className={BOX} />
      <Arrow x={100} y={29} angle={90} />
      <Arrow x={40} y={89} angle={90} />
      <Arrow x={160} y={89} angle={90} />
    </Frame>
  ),

  状態マシン図: (
    <Frame>
      <title>状態マシン図</title>
      <circle cx="16" cy="60" r="6" className={INK} stroke="none" />
      <rect x="34" y="42" width="56" height="34" rx="16" className={FILL} />
      <rect x="118" y="42" width="56" height="34" rx="16" className={BOX} />
      <path d="M90 52 H118 M118 66 H90" className="stroke-current" fill="none" />
      <path d="M22 60 H34" className="stroke-current" fill="none" />
      <Arrow x={118} y={52} angle={0} />
      <Arrow x={90} y={66} angle={180} />
      <Arrow x={34} y={60} angle={0} />
      <path d="M146 42 C146 20 186 20 180 46" className="stroke-current" fill="none" />
      <Arrow x={179} y={46} angle={100} />
    </Frame>
  ),

  シーケンス図: (
    <Frame>
      <title>シーケンス図</title>
      {[30, 100, 170].map((x) => (
        <g key={x}>
          <rect x={x - 26} y="6" width="52" height="16" rx="3" className={FILL} />
          <path d={`M${x} 22 V112`} className="stroke-current" strokeDasharray="4 4" fill="none" />
          <rect x={x - 5} y="34" width="10" height="56" className={BOX} />
        </g>
      ))}
      <path
        d="M35 42 H95 M105 58 H165 M165 74 H105 M95 90 H35"
        className="stroke-current"
        fill="none"
      />
      <Arrow x={96} y={42} angle={0} />
      <Arrow x={166} y={58} angle={0} />
      <Arrow x={104} y={74} angle={180} />
      <Arrow x={34} y={90} angle={180} />
    </Frame>
  ),

  ユースケース図: (
    <Frame>
      <title>ユースケース図</title>
      <circle cx="24" cy="30" r="7" className={BOX} />
      <path
        d="M24 37 V60 M12 46 H36 M24 60 L14 78 M24 60 L34 78"
        className="stroke-current"
        fill="none"
      />
      <rect x="62" y="8" width="130" height="104" rx="4" className="fill-none stroke-current" />
      {[26, 60, 94].map((y) => (
        <ellipse key={y} cx="127" cy={y} rx="46" ry="14" className={y === 26 ? FILL : BOX} />
      ))}
      <path d="M40 46 L81 30 M40 52 L81 60 M40 58 L81 90" className="stroke-current" fill="none" />
    </Frame>
  ),

  DFD: (
    <Frame>
      <title>DFD（データフロー図）</title>
      <rect x="6" y="44" width="44" height="30" className={BOX} />
      <circle cx="100" cy="59" r="24" className={FILL} />
      <path d="M142 34 H194 M142 34 V52 M142 52 H194" className="stroke-current" fill="none" />
      <path d="M142 82 H194 M142 82 V100 M142 100 H194" className="stroke-current" fill="none" />
      <path d="M50 59 H72 M124 50 L142 43 M124 68 L142 84" className="stroke-current" fill="none" />
      <Arrow x={74} y={59} angle={0} />
      <Arrow x={143} y={43} angle={-21} />
      <Arrow x={143} y={84} angle={41} />
    </Frame>
  ),

  "E-R図": (
    <Frame>
      <title>E-R図</title>
      <rect x="8" y="42" width="56" height="34" rx="3" className={FILL} />
      <rect x="136" y="42" width="56" height="34" rx="3" className={FILL} />
      <path d="M100 40 L124 59 L100 78 L76 59 Z" className={BOX} />
      <path d="M64 59 H76 M124 59 H136" className="stroke-current" fill="none" />
      <path d="M136 59 L146 50 M136 59 L146 68" className="stroke-current" fill="none" />
      <text x="26" y="24" className={INK} stroke="none" fontSize="10">
        1
      </text>
      <text x="166" y="24" className={INK} stroke="none" fontSize="10">
        多
      </text>
    </Frame>
  ),

  "CRUD マトリクス": (
    <Frame>
      <title>CRUD マトリクス</title>
      <rect x="10" y="10" width="180" height="100" rx="3" className={BOX} />
      <path
        d="M10 36 H190 M64 10 V110 M106 10 V110 M148 10 V110 M10 61 H190 M10 86 H190"
        className="stroke-current"
        fill="none"
      />
      <rect x="10" y="10" width="180" height="26" className={FILL} />
      {(
        [
          ["C", 78, 54],
          ["R", 120, 54],
          ["R", 78, 79],
          ["U", 162, 79],
          ["D", 120, 104],
        ] as const
      ).map(([label, x, y]) => (
        <text
          key={`${label}-${x}`}
          x={x}
          y={y}
          className={INK}
          stroke="none"
          fontSize="13"
          fontWeight="700"
          textAnchor="middle"
        >
          {label}
        </text>
      ))}
    </Frame>
  ),

  バーンダウンチャート: (
    <Frame>
      <title>バーンダウンチャート</title>
      <path d="M18 8 V102 H190" className="stroke-current" fill="none" />
      <path d="M22 16 L186 100" className="stroke-current" strokeDasharray="5 4" fill="none" />
      <path
        d="M22 16 L60 40 L98 40 L136 70 L174 96"
        className="stroke-accent"
        fill="none"
        strokeWidth={2}
      />
      <text x="24" y="112" className={INK} stroke="none" fontSize="9">
        残作業量は 0 へ向かう
      </text>
    </Frame>
  ),

  信頼度成長曲線: (
    <Frame>
      <title>信頼度成長曲線</title>
      <path d="M18 8 V102 H190" className="stroke-current" fill="none" />
      <path
        d="M22 98 C60 96 70 40 110 28 C140 19 160 16 186 14"
        className="stroke-accent"
        fill="none"
        strokeWidth={2}
      />
      <path d="M22 14 H186" className="stroke-current" strokeDasharray="4 4" fill="none" />
      <text x="24" y="112" className={INK} stroke="none" fontSize="9">
        累積バグ数が上限へ近づく
      </text>
    </Frame>
  ),
};

type SketchFigureBlockProps = {
  figure: SketchFigure;
};

export const SketchFigureBlock = ({ figure }: SketchFigureBlockProps) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
      {figure.items.map((item) => (
        <div
          key={item.name}
          className="flex flex-col gap-2 rounded-xl border border-figure-line bg-figure p-3.5"
        >
          <div className="rounded-lg bg-surface px-2.5 py-2">{SKETCHES[item.name]}</div>
          <span className="font-bold text-read-sm text-ink">{item.name}</span>
          <span className="text-pretty text-read-xs text-muted-soft leading-[1.7]">
            {item.note}
          </span>
        </div>
      ))}
    </div>
  );
};
