import type { PmAnswers } from "../pm-past/answers";
import { parsePmAnswers } from "../pm-past/answers";
import type { PmMarkers } from "../pm-past/markers";
import { parsePmMarkers } from "../pm-past/markers";
import type { PmMarks } from "../pm-past/marks";
import { parsePmMarks } from "../pm-past/marks";
import type { PmAttempt } from "../pm-past/record";
import { parsePmRecord } from "../pm-past/record";

/**
 * 書き出しに入れる、応用情報 午後の過去問題の記録。
 *
 * 保存先は 4 つに分かれている（解いた日と点数・書いた答え・○△×・マーカー）が、どれも問題 ID
 * （ap-r06-aki-pm-05 など）ごとなので、ファイルでは 1 つにまとめて持つ。
 * メモは演習と同じ保存先（notes）にあるので、ここではなく Backup の notes に入る。
 */
export type PmPastData = {
  attempts: Record<string, PmAttempt>;
  answers: PmAnswers;
  marks: PmMarks;
  markers: PmMarkers;
};

export const emptyPmPast = (): PmPastData => ({
  attempts: {},
  answers: {},
  marks: {},
  markers: {},
});

/**
 * 中身のある項目か。答えをすべて消した問は `{}` のまま残ることがあるので、空は無いものとみなす
 * （書き出しに空の問を入れると、読み込んだ先でその問の記録を消してしまう）。
 */
const filled = (value: object | undefined): boolean =>
  value !== undefined && Object.keys(value).length > 0;

/** 渡した ID のうち、中身のあるものだけを取り出す。 */
const pick = <T extends object>(
  map: Record<string, T>,
  ids: Iterable<string>,
): Record<string, T> => {
  const picked: Record<string, T> = {};
  for (const id of ids) {
    const value = map[id];
    if (value !== undefined && filled(value)) picked[id] = value;
  }
  return picked;
};

/** 渡した問題 ID の分だけを取り出す。空の項目は落とす。 */
export const pickPmPast = (data: PmPastData, ids: readonly string[]): PmPastData => ({
  attempts: pick(data.attempts, ids),
  answers: pick(data.answers, ids),
  marks: pick(data.marks, ids),
  markers: pick(data.markers, ids),
});

/** 何か 1 つでも記録のある問題 ID。 */
export const pmPastIds = (data: PmPastData): string[] => {
  const ids = new Set<string>();
  for (const map of [data.attempts, data.answers, data.marks, data.markers]) {
    for (const [id, value] of Object.entries(map)) {
      if (filled(value)) ids.add(id);
    }
  }
  return [...ids];
};

/** すべての記録。空の項目だけを落とす。 */
export const compactPmPast = (data: PmPastData): PmPastData => pickPmPast(data, pmPastIds(data));

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * ファイルから読む。形の合わない項目は落とし、読めたものは通す（保存先から読むときと同じ扱い。
 * 1 問の答えが崩れていても、ほかの問の記録まで捨てない）。全体が object でなければ null。
 */
export const parsePmPast = (raw: unknown): PmPastData | null => {
  if (!isObject(raw)) return null;
  return compactPmPast({
    attempts: parsePmRecord({ attempts: raw.attempts }).attempts,
    answers: parsePmAnswers(raw.answers),
    marks: parsePmMarks(raw.marks),
    markers: parsePmMarkers(raw.markers),
  });
};

/** current の ids の分を incoming の内容にそろえる。incoming に無ければ current からも外す。 */
const overlay = <T>(
  current: Record<string, T>,
  incoming: Record<string, T>,
  ids: readonly string[],
): Record<string, T> => {
  const next = { ...current };
  for (const id of ids) {
    const value = incoming[id];
    if (value === undefined) {
      delete next[id];
    } else {
      next[id] = value;
    }
  }
  return next;
};

/**
 * 個別の取り込み。ファイルに入っている問だけを、ファイルの内容にそろえる。
 *
 * 1 問は 4 つの記録をまとめて 1 つと見る。書いた答えだけを差し替えて ○△× を元のまま残すと、
 * 新しい答えに古い採点が付いて見えてしまうため。ファイルに入っていない問には触らない。
 * 入っている問が無ければ、同じ参照を返す（保存先への書き込みを省けるように）。
 */
export const mergePmPast = (current: PmPastData, incoming: PmPastData): PmPastData => {
  const ids = pmPastIds(incoming);
  if (ids.length === 0) return current;
  return {
    attempts: overlay(current.attempts, incoming.attempts, ids),
    answers: overlay(current.answers, incoming.answers, ids),
    marks: overlay(current.marks, incoming.marks, ids),
    markers: overlay(current.markers, incoming.markers, ids),
  };
};
