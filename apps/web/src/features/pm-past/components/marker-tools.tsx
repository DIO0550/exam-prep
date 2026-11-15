"use client";

import type { RefObject } from "react";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

import type { Offsets } from "../marker-range";
import { rangeAt, rangeContainsPoint, selectedOffsets } from "../marker-range";
import type { MarkerColor, PmMarker } from "../markers";
import {
  eraseRange,
  MARKER_COLORS,
  paintRange,
  pmMarkerStore,
  resolveMarkers,
  usePmMarkers,
} from "../markers";

/** 持っている道具。色のマーカーか消しゴム。 */
export type MarkerTool = MarkerColor | "eraser";

const COLOR_LABEL: Record<MarkerColor, string> = {
  yellow: "黄",
  pink: "ピンク",
  green: "緑",
  blue: "青",
};

/** 色見本の塗り。マーカーの色（globals.css の --color-marker-*）と同じ。 */
const SWATCH: Record<MarkerColor, string> = {
  yellow: "bg-marker-yellow",
  pink: "bg-marker-pink",
  green: "bg-marker-green",
  blue: "bg-marker-blue",
};

/**
 * 道具を持っている間、なぞっている所（選んでいる所）をその色で見せる。
 * 引く前から、どこに引けるかが分かるようにするため。消しゴムは薄い灰色。
 */
const SELECTION: Record<MarkerTool, string> = {
  yellow: "selection:bg-marker-yellow",
  pink: "selection:bg-marker-pink",
  green: "selection:bg-marker-green",
  blue: "selection:bg-marker-blue",
  eraser: "selection:bg-ink/15",
};

/** CSS.highlights に登録する名前。下の HIGHLIGHT_CSS の ::highlight(...) と合わせる。 */
export const highlightName = (color: MarkerColor): string => `pm-marker-${color}`;

/**
 * 引いた所の色。globals.css に書くと、CSS の変換（Lightning CSS）が ::highlight を読めずに
 * 規則ごと落とすので、ここから <style> で入れる。色そのものは globals.css の --color-marker-*。
 */
const HIGHLIGHT_CSS = MARKER_COLORS.map(
  (color) =>
    `::highlight(${highlightName(color)}) { background-color: var(--color-marker-${color}); }`,
).join("\n");

/**
 * 要素を書き換えずに文字へ色を付ける仕組み（CSS Custom Highlight API）が使えるか。
 * 使えないブラウザでは、マーカーの道具を出さない（引いても見えないため）。
 */
const supportsHighlights = (): boolean =>
  typeof CSS !== "undefined" && "highlights" in CSS && typeof Highlight === "function";

const subscribeNothing = () => () => {};

/** 問題文の文字の並び。マーカーの位置はこれの何文字目かで数える（marker-range.ts）。 */
const areaText = (area: HTMLElement): string => area.textContent ?? "";

/** 保存したマーカーを、いまの問題文に合わせて読む。 */
const currentMarkers = (id: string, area: HTMLElement): PmMarker[] =>
  resolveMarkers(pmMarkerStore.snapshot()[id] ?? [], areaText(area));

/** なぞった所に、持っている道具で引く（消しゴムなら消す）。 */
const stroke = (id: string, area: HTMLElement, tool: MarkerTool, { start, end }: Offsets) => {
  const text = areaText(area);
  const markers = currentMarkers(id, area);
  pmMarkerStore.set(
    id,
    tool === "eraser"
      ? eraseRange(markers, start, end, text)
      : paintRange(markers, start, end, tool, text),
  );
};

/** (x, y) にあるマーカーを 1 本まるごと消す。消しゴムで引いた所を押したとき。 */
const eraseAt = (id: string, area: HTMLElement, x: number, y: number) => {
  const markers = currentMarkers(id, area);
  const hit = markers.find((marker) => {
    const range = rangeAt(area, marker.start, marker.end);
    return range !== null && rangeContainsPoint(range, x, y);
  });
  if (hit)
    pmMarkerStore.set(
      id,
      markers.filter((marker) => marker !== hit),
    );
};

const clearSelection = () => document.getSelection()?.removeAllRanges();

/**
 * 問題文（area）に引くマーカー。紙の問題冊子に蛍光ペンで引くのと同じく、文字をなぞると引ける。
 *
 * - マウス・ペン: なぞって離したところで引く
 * - 指: 長押しで選び、つまみで広げてから、ほかの所を押すと引く（指を離した時点では選び途中のことがあるため）
 * - 先に文字を選んでから「マーカー」や色を押しても、その所に引ける
 * - 消しゴム: なぞった所を消す。引いた所を押すと、その 1 本をまるごと消す
 *
 * 色は要素を書き換えずに付ける（CSS Custom Highlight API）。本文の下線や空欄の枠、
 * 「下線①」から飛ぶ先の仕組みには手を入れずに済む。
 */
export const useMarkerTool = (id: string, areaRef: RefObject<HTMLElement | null>) => {
  const stored = usePmMarkers()[id];
  const supported = useSyncExternalStore(subscribeNothing, supportsHighlights, () => false);
  const [tool, setTool] = useState<MarkerTool | null>(null);
  const [color, setColor] = useState<MarkerColor>("yellow");
  // 指で選んでいる途中の所。選びが解けたら（ほかの所を押したら）ここに引く。
  const pending = useRef<Offsets | null>(null);
  // 道具のボタンを押し始めた時点で選んでいた所。押すと選びが解けるブラウザがあるので、先に取っておく。
  const grabbed = useRef<Offsets | null>(null);

  // 描くたびに塗り直す。React が文字の節を作り直していても、範囲を作り直すので外れない。
  useLayoutEffect(() => {
    const area = areaRef.current;
    if (!area || !supported) return;
    const markers = resolveMarkers(stored ?? [], areaText(area));
    for (const markerColor of MARKER_COLORS) {
      const ranges = markers
        .filter((marker) => marker.color === markerColor)
        .flatMap((marker) => rangeAt(area, marker.start, marker.end) ?? []);
      CSS.highlights.set(highlightName(markerColor), new Highlight(...ranges));
    }
    return () => {
      for (const markerColor of MARKER_COLORS) CSS.highlights.delete(highlightName(markerColor));
    };
  });

  useEffect(() => {
    if (!tool) return;
    const onPointerUp = (event: PointerEvent) => {
      const area = areaRef.current;
      if (!area) return;
      const offsets = selectedOffsets(area);
      if (offsets) {
        // 指は、離した後もつまみで選び直せるので、ここでは引かない（選びが解けたときに引く）
        if (event.pointerType === "touch") return;
        pending.current = null;
        stroke(id, area, tool, offsets);
        clearSelection();
        return;
      }
      // 道具の枠など、問題文の外を押したときは消さない
      if (tool === "eraser" && event.target instanceof Node && area.contains(event.target)) {
        eraseAt(id, area, event.clientX, event.clientY);
      }
    };
    const onSelectionChange = () => {
      const area = areaRef.current;
      if (!area) return;
      const offsets = selectedOffsets(area);
      if (offsets) {
        pending.current = offsets;
        return;
      }
      const last = pending.current;
      pending.current = null;
      if (last) stroke(id, area, tool, last);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTool(null);
    };
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [tool, id, areaRef]);

  /** 道具のボタンを押し始めたときに、選んでいる所を取っておく。 */
  const grab = () => {
    grabbed.current = selectedOffsets(areaRef.current);
  };

  /** 道具のボタンを押す前に選んでいた所に、next で引く（消しゴムなら消す）。 */
  const applyToSelection = (next: MarkerTool) => {
    const area = areaRef.current;
    const offsets = grabbed.current ?? selectedOffsets(area);
    grabbed.current = null;
    pending.current = null;
    if (!area || !offsets) return;
    stroke(id, area, next, offsets);
    clearSelection();
  };

  /** 「マーカー」で持つ・置く。置くときも、選んでいた所には引いてから置く。 */
  const toggle = () => {
    const next = tool ?? color;
    applyToSelection(next);
    setTool(tool ? null : next);
  };

  const pick = (next: MarkerTool) => {
    applyToSelection(next);
    setTool(next);
    if (next !== "eraser") setColor(next);
  };

  return {
    supported,
    tool,
    color,
    count: stored?.length ?? 0,
    selectionClass: tool ? SELECTION[tool] : "",
    grab,
    toggle,
    pick,
    clear: () => pmMarkerStore.clearProblem(id),
  };
};

export type MarkerToolState = ReturnType<typeof useMarkerTool>;

const HINT: Record<"color" | "eraser", string> = {
  color: "問題文の文字をなぞると引けます（指なら長押しで選んで広げ、ほかの所を押すと引けます）。",
  eraser: "なぞった所が消えます。引いた所を押すと、その 1 本がまるごと消えます。",
};

/** 道具の枠の中の、文字のボタン（消しゴム・全部消す）。 */
const SMALL_BUTTON =
  "w-full cursor-pointer rounded-md border px-0.5 py-1 font-bold text-[10.5px] leading-[1.25]";

/**
 * この問のマーカーを全部消すボタン。押し間違いで消えないよう 2 段階にする（ConfirmClearButton と同じ考え）。
 * 道具の枠は細いので、確かめる 2 つのボタンは縦に並べる。
 */
const ClearAll = ({ onClear }: { onClear: () => void }) => {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <button
        type="button"
        aria-label="この問のマーカーを全部消す"
        title="この問のマーカーを全部消す"
        onClick={() => setArmed(true)}
        className={`${SMALL_BUTTON} border-transparent text-muted-soft hover:bg-hover`}
      >
        全部
        <br />
        消す
      </button>
    );
  }
  return (
    <>
      <button
        type="button"
        aria-label="この問のマーカーを全部消す（確定）"
        onClick={() => {
          setArmed(false);
          onClear();
        }}
        className={`${SMALL_BUTTON} border-ng-line bg-ng-soft text-ng hover:bg-ng-bg`}
      >
        消す
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className={`${SMALL_BUTTON} border-edge bg-surface text-ink hover:bg-hover`}
      >
        やめる
      </button>
    </>
  );
};

/**
 * 問題文の欄の右上（狭い画面では右下）に浮かせる「マーカー」と、持っている間に出す道具の枠。
 * メモのボタンと縦に並べ、広い画面では本文の横の余白に収まる細さにする（本文の文字に重ねない）。
 * 道具の枠は、広い画面ではボタンの下、狭い画面ではメモのボタンの上に出す（画面の下端に置いているため）。
 * 並べる親は縦の flex にしておく（狭い画面の並びは order で入れ替える）。
 */
export const MarkerTools = ({
  marker,
  floating,
}: {
  marker: MarkerToolState;
  /** 浮かせるボタンの見た目（影と角丸）。メモのボタンとそろえる。 */
  floating: string;
}) => {
  const { tool, color, count } = marker;
  const holding = tool !== null;
  const hint = HINT[tool === "eraser" ? "eraser" : "color"];
  return (
    <>
      {/* React が head へ移し、何度描いても 1 つにまとめる */}
      <style href="pm-past-markers" precedence="default">
        {HIGHLIGHT_CSS}
      </style>
      <button
        type="button"
        aria-pressed={holding}
        title={HINT.color}
        onPointerDown={marker.grab}
        onClick={marker.toggle}
        className={`${floating} flex cursor-pointer items-center gap-1.5 whitespace-nowrap border px-3 py-3 font-bold text-[12px] ${
          holding
            ? "border-accent bg-accent-soft text-accent"
            : "border-edge bg-surface text-muted-soft"
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block size-2.5 rounded-full border border-ink/20 ${
            tool === "eraser" ? "bg-surface" : SWATCH[color]
          }`}
        />
        マーカー
      </button>

      {holding && (
        <fieldset
          title={hint}
          className={`${floating} m-0 flex w-[60px] min-w-0 flex-col items-center gap-2 border border-line bg-surface p-2 max-md:order-first`}
        >
          <legend className="sr-only">マーカーの道具</legend>
          <p className="sr-only">{hint}</p>
          {MARKER_COLORS.map((option) => {
            const pressed = tool === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={pressed}
                aria-label={`${COLOR_LABEL[option]}のマーカー`}
                title={`${COLOR_LABEL[option]}のマーカー`}
                onPointerDown={marker.grab}
                onClick={() => marker.pick(option)}
                className={`size-7 flex-none cursor-pointer rounded-full border border-ink/15 ${SWATCH[option]} ${
                  pressed ? "ring-2 ring-accent ring-offset-2" : "hover:border-ink/40"
                }`}
              />
            );
          })}
          <span aria-hidden="true" className="h-px w-full flex-none bg-line" />
          <button
            type="button"
            aria-pressed={tool === "eraser"}
            title={HINT.eraser}
            onPointerDown={marker.grab}
            onClick={() => marker.pick("eraser")}
            className={`${SMALL_BUTTON} ${
              tool === "eraser"
                ? "border-accent bg-accent-soft text-accent"
                : "border-edge-strong bg-surface text-muted hover:bg-hover"
            }`}
          >
            消し
            <br />
            ゴム
          </button>
          {count > 0 && <ClearAll onClear={marker.clear} />}
        </fieldset>
      )}
    </>
  );
};
