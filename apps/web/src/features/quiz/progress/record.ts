import type { Attempt } from "../stats";
import type { TextScale } from "../text-scale";
import { DEFAULT_TEXT_SCALE, isTextScale } from "../text-scale";

/**
 * 保存する学習記録の形と、その上の純粋な操作。
 *
 * 保存先（localStorage）とは分けてある。ここは JSON にできる値だけを扱い、
 * 読み込んだ値の検証（parseRecord）もここに置く。
 */

/** 保存形式の版。形を変えたら上げる。読めない版は捨てて作り直す。 */
export const RECORD_VERSION = 4;

/**
 * 読める版。版 1 は選択肢シャッフル、版 2 は文字サイズ、版 3 はメモの幅を
 * 持たないだけなので、既定値を足して読む。ここで捨てると、設定が 1 つ増えただけで
 * 学習記録が消えてしまうため。
 */
const READABLE_VERSIONS: readonly number[] = [1, 2, 3, RECORD_VERSION];

/** メモの枠の幅（px）。狭すぎると書けず、広すぎると問題文が読めなくなるので両端を決めておく。 */
export const NOTE_WIDTH_MIN = 300;
export const NOTE_WIDTH_MAX = 760;
export const DEFAULT_NOTE_WIDTH = 380;

/** 保存された幅を、端に収める。 */
export const clampNoteWidth = (width: number): number =>
  Math.min(NOTE_WIDTH_MAX, Math.max(NOTE_WIDTH_MIN, Math.round(width)));

/** 累計正答率の母数。直近この件数までを見る。 */
export const RECENT_LIMIT = 200;

/** 学習日の保持件数。連続記録を出すのに使うだけなので、古い日から落とす。 */
export const DAY_LIMIT = 400;

/** 1 日を表すキー。ローカル時刻の YYYY-MM-DD。 */
export type DayKey = string;

export type ProgressRecord = {
  version: number;
  /** 最後に選んでいた回。次に開いたときここから始める。 */
  setId: string | null;
  /** 問題 ID ごとの解答状況。触れた問題だけを持つ。 */
  attempts: Record<string, Attempt>;
  /** 直近の正誤。古い順に並び、RECENT_LIMIT 件で打ち切る。 */
  recent: boolean[];
  /** 解答した日。古い順・重複なしで、DAY_LIMIT 件で打ち切る。 */
  days: DayKey[];
  /** 選択肢をシャッフルして出すか。 */
  shuffle: boolean;
  /** シャッフルの並びを決める種。解き直すたびに進めて、前と違う並びにする。 */
  shuffleSeed: number;
  /** 問題文と解説を出す文字の大きさ。 */
  textScale: TextScale;
  /** メモの枠の幅（px）。ドラッグで変えた幅を次に開いたときも使う。 */
  noteWidth: number;
};

/** まだ触れていない問題の解答状況。共有するので、更新は必ず新しい値を作る。 */
export const FRESH_ATTEMPT: Attempt = Object.freeze({
  picked: null,
  revealed: false,
  flagged: false,
  weak: false,
  excluded: Object.freeze([]) as unknown as number[],
});

export const emptyRecord = (): ProgressRecord => ({
  version: RECORD_VERSION,
  setId: null,
  attempts: {},
  recent: [],
  days: [],
  shuffle: false,
  shuffleSeed: 0,
  textScale: DEFAULT_TEXT_SCALE,
  noteWidth: DEFAULT_NOTE_WIDTH,
});

/** 記録が空のときに返す値。参照を固定する（useSyncExternalStore が同一性で見るため）。 */
export const EMPTY_RECORD: ProgressRecord = Object.freeze(emptyRecord());

export const attemptOf = (record: ProgressRecord, questionId: string): Attempt =>
  record.attempts[questionId] ?? FRESH_ATTEMPT;

const pad = (value: number): string => String(value).padStart(2, "0");

/** ローカル時刻での日付キー。UTC で切ると日本時間の朝が前日に落ちるので、ローカルで切る。 */
export const dayKey = (date: Date): DayKey =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** 日付キーを通算日数に直す。差が 1 かどうかで「連続した日」を判定する。 */
const dayNumber = (key: DayKey): number => {
  const [year = 0, month = 1, day = 1] = key.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
};

export type Streak = { current: number; longest: number };

/**
 * 連続学習日数。current は今日（または前日）で終わっている連続、longest は記録全体での最長。
 *
 * 前日で終わっていても current を切らないのは、今日まだ解いていないだけの状態を
 * 「途切れた」と出すと、その日の 1 問目を解いた瞬間に数字が跳ねて見えるため。
 */
export const streakOf = (days: DayKey[], today: DayKey): Streak => {
  const numbers = [...new Set(days)].map(dayNumber).sort((a, b) => a - b);

  let longest = 0;
  let run = 0;
  let prev: number | null = null;
  for (const number of numbers) {
    run = prev !== null && number === prev + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = number;
  }

  const last = numbers.at(-1);
  const current = last !== undefined && last >= dayNumber(today) - 1 ? run : 0;
  return { current, longest };
};

/** 解答した日を足す。同じ日は増やさない。 */
const withDay = (days: DayKey[], key: DayKey): DayKey[] =>
  days.at(-1) === key ? days : [...days, key].slice(-DAY_LIMIT);

export const withSetId = (record: ProgressRecord, setId: string): ProgressRecord => ({
  ...record,
  setId,
});

/** 選択肢をシャッフルするかを切り替える。並びの種は変えない（解答済みのラベルを動かさないため）。 */
export const withShuffle = (record: ProgressRecord, shuffle: boolean): ProgressRecord => ({
  ...record,
  shuffle,
});

/** 問題文と解説の文字の大きさを覚える。 */
export const withTextScale = (record: ProgressRecord, textScale: TextScale): ProgressRecord => ({
  ...record,
  textScale,
});

/** メモの枠の幅を覚える。端は clampNoteWidth で押さえる。 */
export const withNoteWidth = (record: ProgressRecord, noteWidth: number): ProgressRecord => ({
  ...record,
  noteWidth: clampNoteWidth(noteWidth),
});

export const withAttempt = (
  record: ProgressRecord,
  questionId: string,
  attempt: Attempt,
): ProgressRecord => ({
  ...record,
  attempts: { ...record.attempts, [questionId]: attempt },
});

/** 解答を 1 件記録する。解答状況・直近の正誤・学習日をまとめて更新する。 */
export const withAnswer = (
  record: ProgressRecord,
  questionId: string,
  attempt: Attempt,
  correct: boolean,
  now: Date,
): ProgressRecord => ({
  ...withAttempt(record, questionId, attempt),
  recent: [...record.recent, correct].slice(-RECENT_LIMIT),
  days: withDay(record.days, dayKey(now)),
});

/** 解答を取り消すのに要る、解答する前の値。取り消せるのは最後に記録した 1 件だけ。 */
export type AnswerUndo = {
  questionId: string;
  /** 解答する前の苦手登録。間違えて自動で付いた登録を外すのに使う。 */
  weak: boolean;
  /** 解答する前の学習日。その日の 1 問目だったなら、取り消すと日も消える。 */
  days: DayKey[];
};

/**
 * 押し間違えた解答を取り消す。解答状況を未解答に戻し、直近の正誤からも 1 件抜く。
 * フラグと消し込みは解答とは別に付けたものなので残す。
 */
export const withUndoAnswer = (record: ProgressRecord, undo: AnswerUndo): ProgressRecord => ({
  ...withAttempt(record, undo.questionId, {
    ...attemptOf(record, undo.questionId),
    picked: null,
    revealed: false,
    weak: undo.weak,
  }),
  recent: record.recent.slice(0, -1),
  days: undo.days,
});

/** 指定した問題の解答だけを消す。フラグと苦手登録は学習記録なので残す。 */
export const withRestart = (record: ProgressRecord, questionIds: string[]): ProgressRecord => {
  const attempts = { ...record.attempts };
  for (const id of questionIds) {
    const attempt = attempts[id];
    if (!attempt) continue;
    attempts[id] = { ...attempt, picked: null, revealed: false, excluded: [] };
  }
  // 種を進めて、シャッフル中なら前回と違う並びで出す。種は回をまたいで 1 つなので他の回の
  // 並びも変わるが、解答は原本の添字で持っているので、どれを選んだかは変わらない。
  return { ...record, attempts, shuffleSeed: record.shuffleSeed + 1 };
};

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === "number");

/** 1 件の解答状況として読めるか。読み込み（parseRecord）と取り込み（backup/）が使う。 */
export const isAttempt = (value: unknown): value is Attempt => {
  if (typeof value !== "object" || value === null) return false;
  const attempt = value as Record<string, unknown>;
  return (
    (attempt.picked === null || typeof attempt.picked === "number") &&
    typeof attempt.revealed === "boolean" &&
    typeof attempt.flagged === "boolean" &&
    typeof attempt.weak === "boolean" &&
    isNumberArray(attempt.excluded)
  );
};

/**
 * 保存されていた値を記録に戻す。
 *
 * localStorage の中身は他のスクリプトや古いバージョンの本サイトが書いた可能性があるので、
 * 形を見て通す。1 か所でも崩れていたら空の記録として扱う（部分的に壊れた記録で
 * 集計を出すと、原因の分からない数字になるため）。
 */
export const parseRecord = (raw: unknown): ProgressRecord => {
  if (typeof raw !== "object" || raw === null) return emptyRecord();
  const value = raw as Record<string, unknown>;
  if (typeof value.version !== "number" || !READABLE_VERSIONS.includes(value.version)) {
    return emptyRecord();
  }

  const { setId, attempts, recent, days, shuffle, shuffleSeed, textScale, noteWidth } = value;
  if (typeof attempts !== "object" || attempts === null) return emptyRecord();
  if (!Array.isArray(recent) || !recent.every((item) => typeof item === "boolean")) {
    return emptyRecord();
  }
  if (!Array.isArray(days) || !days.every((item) => typeof item === "string")) {
    return emptyRecord();
  }

  const parsed: Record<string, Attempt> = {};
  for (const [id, attempt] of Object.entries(attempts)) {
    if (!isAttempt(attempt)) return emptyRecord();
    parsed[id] = attempt;
  }

  return {
    version: RECORD_VERSION,
    setId: typeof setId === "string" ? setId : null,
    attempts: parsed,
    recent: recent.slice(-RECENT_LIMIT),
    days: days.slice(-DAY_LIMIT),
    shuffle: shuffle === true,
    shuffleSeed: typeof shuffleSeed === "number" && Number.isFinite(shuffleSeed) ? shuffleSeed : 0,
    textScale: isTextScale(textScale) ? textScale : DEFAULT_TEXT_SCALE,
    noteWidth:
      typeof noteWidth === "number" && Number.isFinite(noteWidth)
        ? clampNoteWidth(noteWidth)
        : DEFAULT_NOTE_WIDTH,
  };
};
