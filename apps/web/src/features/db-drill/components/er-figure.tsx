import type { Marks } from "@/features/fill-drill/types";
import { ArrowHead, LINE_TONE, SvgFrame, shorten } from "@/features/quiz/components/figure-svg";
import type { Box } from "@/features/quiz/figure-layout";
import { FONT, textWidth } from "@/features/quiz/figure-layout";

import {
  ATTR_H,
  BLANK_H,
  BLANK_W,
  BOX_PAD_X,
  blankName,
  erDescription,
  layoutEr,
  NAME_H,
} from "../er-layout";
import type { DbColumn, DbEntity, DbRelation } from "../types";

const BLANK_TONE = {
  none: { rect: "fill-surface stroke-ink", text: "fill-ink" },
  ok: { rect: "fill-ok-soft stroke-ok", text: "fill-ok" },
  ng: { rect: "fill-ng-soft stroke-ng", text: "fill-ng" },
} as const;

/** 空欄の枠。答え合わせの後は正誤で色を付ける。 */
const BlankBox = ({ box, name, marks }: { box: Box; name: string; marks: Marks }) => {
  const mark = marks?.[name];
  const tone = BLANK_TONE[mark === undefined ? "none" : mark ? "ok" : "ng"];
  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        className={tone.rect}
        strokeWidth={1.3}
      />
      <text
        x={box.x + box.w / 2}
        y={box.y + box.h / 2 + 4.5}
        textAnchor="middle"
        fontWeight={700}
        className={tone.text}
      >
        {name}
      </text>
    </g>
  );
};

/** 属性の行に置く空欄の枠の高さ（行の高さに収め、下線を引く余地を残す）。 */
const ATTR_BLANK_H = 17;

/** 属性 1 行。主キーは実線、外部キーは破線の下線を引く。 */
const Attr = ({ attr, x, y, marks }: { attr: DbColumn; x: number; y: number; marks: Marks }) => {
  const blank = blankName(attr.name);
  const width = blank !== undefined ? BLANK_W : textWidth(attr.name, FONT);
  // y は行の中ほど。下線は字の少し下に引く。
  const underlineY = y + (blank !== undefined ? ATTR_BLANK_H / 2 + 2.5 : 8);
  return (
    <g>
      {blank !== undefined ? (
        <BlankBox
          box={{ x, y: y - ATTR_BLANK_H / 2, w: BLANK_W, h: ATTR_BLANK_H }}
          name={blank}
          marks={marks}
        />
      ) : (
        <text x={x} y={y + 4.5} className="fill-ink">
          {attr.name}
        </text>
      )}
      {attr.key && (
        <line
          x1={x}
          x2={x + width}
          y1={underlineY}
          y2={underlineY}
          className="stroke-ink"
          strokeWidth={1}
          strokeDasharray={attr.key === "fk" ? "4 3" : undefined}
        />
      )}
    </g>
  );
};

const Entity = ({ entity, box, marks }: { entity: DbEntity; box: Box; marks: Marks }) => {
  const blank = blankName(entity.name);
  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        className="fill-surface stroke-diagram-line"
        strokeWidth={1.4}
      />
      {blank !== undefined ? (
        <BlankBox
          box={{ x: box.x + (box.w - BLANK_W) / 2, y: box.y + 4, w: BLANK_W, h: BLANK_H }}
          name={blank}
          marks={marks}
        />
      ) : (
        <text
          x={box.x + box.w / 2}
          y={box.y + NAME_H / 2 + 4.5}
          textAnchor="middle"
          fontWeight={700}
          className="fill-ink"
        >
          {entity.name}
        </text>
      )}
      {entity.attrs.length > 0 && (
        <line
          x1={box.x}
          x2={box.x + box.w}
          y1={box.y + NAME_H}
          y2={box.y + NAME_H}
          className="stroke-diagram-line"
          strokeWidth={1}
        />
      )}
      {entity.attrs.map((attr, i) => (
        <Attr
          key={attr.name}
          attr={attr}
          x={box.x + BOX_PAD_X}
          y={box.y + NAME_H + 4 + ATTR_H * i + ATTR_H / 2}
          marks={marks}
        />
      ))}
    </g>
  );
};

type ErFigureProps = {
  caption: string;
  entities: DbEntity[];
  relations: DbRelation[];
  marks: Marks;
};

/**
 * E-R 図。本試験の書き方にそろえる：エンティティは箱（上に名前、下に属性）、関連は線
 * （1 対 1）・矢印（1 対多、矢印の先が多）・両矢印（多対多）。空欄の関連は線を引かずに枠を置く。
 */
export const ErFigure = ({ caption, entities, relations, marks }: ErFigureProps) => {
  const layout = layoutEr(entities, relations);
  const line = LINE_TONE.plain;
  return (
    <figure className="flex flex-col items-center gap-1.5 py-1">
      {/* SvgFrame は幅いっぱいに広がり、図の幅を上限に縮む。中央に寄せるため svg の左右を auto にする。 */}
      <div className="w-full rounded-md border border-edge bg-surface px-3 py-3 [&_svg]:mx-auto">
        <div>
          <SvgFrame view={layout.view} label={erDescription(caption, entities, relations)}>
            {layout.relations.map(({ relation, start, end, blankBox }) => {
              const key = `${relation.from}-${relation.to}`;
              if (blankBox && "blank" in relation) {
                return <BlankBox key={key} box={blankBox} name={relation.blank} marks={marks} />;
              }
              if ("blank" in relation) return null;
              const headAtEnd = relation.kind !== "1:1";
              const headAtStart = relation.kind === "N:M";
              const a = headAtStart ? shorten(end, start) : start;
              const b = headAtEnd ? shorten(start, end) : end;
              return (
                <g key={key}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    className={line.stroke}
                    strokeWidth={1.4}
                  />
                  {headAtEnd && <ArrowHead from={start} tip={end} className={line.fill} />}
                  {headAtStart && <ArrowHead from={end} tip={start} className={line.fill} />}
                </g>
              );
            })}
            {layout.entities.map(({ entity, box }) => (
              <Entity key={entity.id} entity={entity} box={box} marks={marks} />
            ))}
          </SvgFrame>
        </div>
      </div>
      <figcaption className="text-center text-read-sm text-ink">{caption}</figcaption>
      <p className="text-center text-read-xs text-muted leading-[1.7]">
        凡例：線は 1 対 1、矢印は 1
        対多（矢印の先が多）、両矢印は多対多。属性名の実線の下線は主キー、破線の下線は外部キーを表す（主キーの一部である外部キーには破線を付けない）。
      </p>
    </figure>
  );
};
