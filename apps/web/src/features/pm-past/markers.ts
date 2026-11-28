"use client";

import { useSyncExternalStore } from "react";

import { createLocalStore } from "@/features/quiz/local-store";

/**
 * 書き起こした午後の問題文に引いたマーカー（蛍光ペン）。問題 ID → 引いた所の並び。
 *
 * 場所は、問題文と設問を 1 本につないだ文字列の何文字目から何文字目までかで持つ
 * （画面の要素の作りに依らないようにするため。数え方は marker-range.ts）。
 * 引いた文字列そのものも持っておき、書き起こしを直して文字の位置がずれたときは、
 * 同じ文字列のいちばん近い所へ付け直す（resolveMarkers）。
 *
 * 書いた答え・○△× の印とは別のキーに置く。答えを消して解き直しても、マーカーは消さない
 * （メモと同じ。消すときはマーカーの道具の「全部消す」）。
 */
export const MARKER_COLORS = ["yellow", "pink", "green", "blue"] as const;

export type MarkerColor = (typeof MARKER_COLORS)[number];

export type PmMarker = {
  /** 何文字目から（0 始まり、UTF-16 の単位）。 */
  start: number;
  /** 何文字目の手前まで。 */
  end: number;
  /** 引いた文字列。位置がずれたときに付け直す手がかり。 */
  text: string;
  color: MarkerColor;
};

export type PmMarkers = Record<string, PmMarker[]>;

export const PM_MARKERS_KEY = "exam-prep:pm-past-markers:v1";

const EMPTY: PmMarkers = {};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isColor = (value: unknown): value is MarkerColor =>
  MARKER_COLORS.some((color) => color === value);

const isMarker = (value: unknown): value is PmMarker => {
  if (!isObject(value)) return false;
  const { start, end, text, color } = value;
  return (
    Number.isInteger(start) &&
    Number.isInteger(end) &&
    (start as number) >= 0 &&
    (end as number) > (start as number) &&
    typeof text === "string" &&
    text.length === (end as number) - (start as number) &&
    isColor(color)
  );
};

/** 保存された値を読む。形の合わない項目は捨てる。 */
export const parsePmMarkers = (raw: unknown): PmMarkers => {
  if (!isObject(raw)) return {};
  const markers: PmMarkers = {};
  for (const [id, list] of Object.entries(raw)) {
    if (!Array.isArray(list)) continue;
    const kept = list.filter(isMarker).map(({ start, end, text, color }) => ({
      start,
      end,
      text,
      color,
    }));
    if (kept.length > 0) markers[id] = kept;
  }
  return markers;
};

/** text の中で needle が出てくる所のうち、near にいちばん近い位置。無ければ -1。 */
const nearestIndex = (text: string, needle: string, near: number): number => {
  let best = -1;
  for (let i = text.indexOf(needle); i !== -1; i = text.indexOf(needle, i + 1)) {
    if (best === -1 || Math.abs(i - near) < Math.abs(best - near)) best = i;
  }
  return best;
};

/**
 * 保存したマーカーを、いまの問題文（text）の位置に合わせる。
 * 位置の文字列が変わっていたら、同じ文字列のいちばん近い所へ移す。見つからないものは外す。
 */
export const resolveMarkers = (markers: readonly PmMarker[], text: string): PmMarker[] =>
  markers.flatMap((marker) => {
    if (text.slice(marker.start, marker.end) === marker.text) return [marker];
    const start = nearestIndex(text, marker.text, marker.start);
    return start === -1 ? [] : [{ ...marker, start, end: start + marker.text.length }];
  });

/** [start, end) に掛かる所を切り取る。はみ出した前後は残す。 */
const cut = (markers: readonly PmMarker[], start: number, end: number): PmMarker[] =>
  markers.flatMap((marker) => {
    if (marker.end <= start || end <= marker.start) return [marker];
    const pieces: PmMarker[] = [];
    if (marker.start < start) pieces.push({ ...marker, end: start });
    if (end < marker.end) pieces.push({ ...marker, start: end });
    return pieces;
  });

/** 位置の順に並べ、同じ色で重なる・接する所を 1 つにまとめ、文字列を付け直す。 */
const tidy = (markers: readonly PmMarker[], text: string): PmMarker[] => {
  const sorted = [...markers].sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: PmMarker[] = [];
  for (const marker of sorted) {
    const last = merged.at(-1);
    if (last && last.color === marker.color && marker.start <= last.end) {
      merged[merged.length - 1] = { ...last, end: Math.max(last.end, marker.end) };
    } else {
      merged.push(marker);
    }
  }
  return merged
    .filter((marker) => marker.start < marker.end)
    .map((marker) => ({ ...marker, text: text.slice(marker.start, marker.end) }));
};

const isSpace = (char: string | undefined): boolean => char !== undefined && /\s/.test(char);

/**
 * [start, end) に color のマーカーを引く。前後の空白は引かない。
 * 違う色の上から引いたときは、その所だけ新しい色に塗り替える（紙の蛍光ペンを重ねたときと同じく、後が勝つ）。
 */
export const paintRange = (
  markers: readonly PmMarker[],
  start: number,
  end: number,
  color: MarkerColor,
  text: string,
): PmMarker[] => {
  let from = Math.max(0, start);
  let to = Math.min(text.length, end);
  while (from < to && isSpace(text[from])) from += 1;
  while (from < to && isSpace(text[to - 1])) to -= 1;
  if (from >= to) return [...markers];
  return tidy([...cut(markers, from, to), { start: from, end: to, text: "", color }], text);
};

/** [start, end) に掛かるマーカーを消す（消しゴムでなぞった所だけ）。 */
export const eraseRange = (
  markers: readonly PmMarker[],
  start: number,
  end: number,
  text: string,
): PmMarker[] => tidy(cut(markers, start, end), text);

const load = (): PmMarkers => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PM_MARKERS_KEY);
    return raw === null ? {} : parsePmMarkers(JSON.parse(raw));
  } catch {
    // 壊れた JSON、あるいは参照拒否。マーカーが無いものとして続ける。
    return {};
  }
};

const save = (markers: PmMarkers): void => {
  try {
    window.localStorage.setItem(PM_MARKERS_KEY, JSON.stringify(markers));
  } catch {
    // 容量超過や書き込み拒否。この回のあいだは画面の中だけで残る。
  }
};

const remove = (): void => {
  try {
    window.localStorage.removeItem(PM_MARKERS_KEY);
  } catch {
    // 消せなくても画面側は空として動く。
  }
};

const store = createLocalStore<PmMarkers>({ storageKey: PM_MARKERS_KEY, load, save, remove });

/** 1 問分を置き換える。空にしたら問ごと外す。 */
const withMarkers = (all: PmMarkers, id: string, markers: PmMarker[]): PmMarkers => {
  const { [id]: _, ...rest } = all;
  return markers.length === 0 ? rest : { ...rest, [id]: markers };
};

export const pmMarkerStore = {
  subscribe: store.subscribe,
  snapshot: store.snapshot,
  serverSnapshot: (): PmMarkers => EMPTY,
  set: (id: string, markers: PmMarker[]): void =>
    store.set(withMarkers(store.snapshot(), id, markers)),
  clearProblem: (id: string): void => store.set(withMarkers(store.snapshot(), id, [])),
  /** マーカーをまるごと差し替える（書き出したファイルの取り込み）。 */
  replace: (markers: PmMarkers): void => store.set(markers),
  clear: store.reset,
};

export const usePmMarkers = (): PmMarkers =>
  useSyncExternalStore(
    pmMarkerStore.subscribe,
    pmMarkerStore.snapshot,
    pmMarkerStore.serverSnapshot,
  );
