import type { Note, NoteRecord } from "../quiz/notes/note";
import { isBlankNote, NOTE_VERSION, parseNote } from "../quiz/notes/note";
import type { DayKey, ProgressRecord } from "../quiz/progress/record";
import {
  clampNoteWidth,
  DAY_LIMIT,
  DEFAULT_NOTE_WIDTH,
  isAttempt,
  RECENT_LIMIT,
  RECORD_VERSION,
} from "../quiz/progress/record";
import type { Attempt } from "../quiz/stats";
import type { TextScale } from "../quiz/text-scale";
import { DEFAULT_TEXT_SCALE, isTextScale } from "../quiz/text-scale";
import type { WeakRecord } from "../vocab/weak/weak";
import { WEAK_VERSION } from "../vocab/weak/weak";

/**
 * 学習記録の持ち出しと取り込み。
 *
 * このサイトは static export でサーバを持たないので、記録はブラウザの localStorage にしか無い。
 * 別の端末で続けたい・サイトデータを消す前に残したい、という場面のために JSON 1 ファイルで
 * 出し入れできるようにする。
 *
 * 範囲は 2 つ。
 * - **全体**: 解答・メモ・単語帳の「あやふや」・設定をすべて。別の端末へ丸ごと移すためのもので、
 *   取り込むと今の記録は置き換わる。
 * - **個別**: 選んでいる回の解答とメモだけ。取り込むとその回の分だけが上書きされ、
 *   他の回の記録はそのまま残る。連続学習日数や直近の正答率のような積み上げの数字は、
 *   回ごとに切り分けられない（どの回で解いた 1 件かを持っていない）ので個別には入れない。
 *   入れてしまうと、同じ日を二重に数えた連続日数になる。
 *
 * ここは JSON にできる値だけを扱う。ファイルの読み書き（transfer.ts）と
 * 保存先への反映（restore.ts）は分けてある。
 */

export const BACKUP_KIND = "exam-prep:backup";

/** ファイル形式の版。形を変えたら上げる。読めない版は取り込まない。 */
export const BACKUP_VERSION = 1;

/** 書き出した範囲。個別は回の ID と、画面に出す表記を持つ。 */
export type BackupScope = { type: "all" } | { type: "set"; setId: string; label: string };

/** 回をまたぐ設定。全体のときだけ持つ。 */
export type BackupSettings = {
  setId: string | null;
  shuffle: boolean;
  shuffleSeed: number;
  textScale: TextScale;
  noteWidth: number;
};

/** 回ごとに切り分けられない積み上げ。全体のときだけ持つ。 */
export type BackupTotals = {
  recent: boolean[];
  days: DayKey[];
};

export type Backup = {
  /** 他の JSON を読み込んだときに気付けるようにする印。 */
  kind: typeof BACKUP_KIND;
  version: number;
  /** 書き出した時刻（ISO 8601）。取り込む前に、いつの記録かを画面に出す。 */
  exportedAt: string;
  scope: BackupScope;
  attempts: Record<string, Attempt>;
  notes: Record<string, Note>;
  totals?: BackupTotals;
  settings?: BackupSettings;
  /** 単語帳で「あやふや」を付けた札の ID。 */
  vocabWeak?: string[];
};

/** 記録のまとまり。書き出す元も、取り込んだ先も同じ 3 つ。 */
export type RecordSet = {
  record: ProgressRecord;
  notes: NoteRecord;
  weak: WeakRecord;
};

/** 全体の書き出し。設定と積み上げ、単語帳まで含める。 */
export const buildAllBackup = (
  { record, notes, weak }: RecordSet,
  now: Date = new Date(),
): Backup => ({
  kind: BACKUP_KIND,
  version: BACKUP_VERSION,
  exportedAt: now.toISOString(),
  scope: { type: "all" },
  attempts: { ...record.attempts },
  notes: { ...notes.notes },
  totals: { recent: [...record.recent], days: [...record.days] },
  settings: {
    setId: record.setId,
    shuffle: record.shuffle,
    shuffleSeed: record.shuffleSeed,
    textScale: record.textScale,
    noteWidth: record.noteWidth,
  },
  vocabWeak: [...weak.ids],
});

/** 個別の書き出し。渡した問題 ID の解答とメモだけを入れる。 */
export const buildSetBackup = (
  { record, notes }: Pick<RecordSet, "record" | "notes">,
  set: { id: string; label: string; questionIds: readonly string[] },
  now: Date = new Date(),
): Backup => {
  const attempts: Record<string, Attempt> = {};
  const picked: Record<string, Note> = {};
  for (const id of set.questionIds) {
    const attempt = record.attempts[id];
    if (attempt) attempts[id] = attempt;
    const note = notes.notes[id];
    if (note) picked[id] = note;
  }

  return {
    kind: BACKUP_KIND,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    scope: { type: "set", setId: set.id, label: set.label },
    attempts,
    notes: picked,
  };
};

/** 中身の件数。取り込む前の確認と、済んだあとの知らせに出す。 */
export type BackupCounts = { attempts: number; notes: number; weak: number };

export const backupCounts = (backup: Backup): BackupCounts => ({
  attempts: Object.keys(backup.attempts).length,
  notes: Object.keys(backup.notes).length,
  weak: backup.vocabWeak?.length ?? 0,
});

/** 何も入っていないファイルか。取り込んでも何も起きないので、押す前に伝える。 */
export const isEmptyBackup = (backup: Backup): boolean => {
  const counts = backupCounts(backup);
  return counts.attempts === 0 && counts.notes === 0 && counts.weak === 0;
};

/** 範囲の表記。「全体」か「個別（令和7年 秋期）」。 */
export const scopeLabel = (scope: BackupScope): string =>
  scope.type === "all" ? "全体" : `個別（${scope.label}）`;

const pad = (value: number): string => String(value).padStart(2, "0");

/** 書き出すファイル名。日付を入れて、何度か出しても上書きにならないようにする。 */
export const backupFileName = (backup: Backup, now: Date = new Date()): string => {
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const scope = backup.scope.type === "all" ? "all" : backup.scope.setId;
  return `exam-prep-${scope}-${date}.json`;
};

/** 取り込みの入口。読めないものは理由を付けて返す（黙って空の記録にしない）。 */
export type BackupParse = { ok: true; backup: Backup } | { ok: false; reason: string };

const fail = (reason: string): BackupParse => ({ ok: false, reason });

const parseScope = (value: unknown): BackupScope | null => {
  if (typeof value !== "object" || value === null) return null;
  const scope = value as Record<string, unknown>;
  if (scope.type === "all") return { type: "all" };
  if (scope.type === "set" && typeof scope.setId === "string") {
    return {
      type: "set",
      setId: scope.setId,
      label: typeof scope.label === "string" ? scope.label : scope.setId,
    };
  }
  return null;
};

const parseAttempts = (value: unknown): Record<string, Attempt> | null => {
  if (typeof value !== "object" || value === null) return null;
  const attempts: Record<string, Attempt> = {};
  for (const [id, attempt] of Object.entries(value)) {
    if (!isAttempt(attempt)) return null;
    attempts[id] = attempt;
  }
  return attempts;
};

/**
 * メモは崩れている問題だけを落とす。書いたものが 1 問でも読めれば、他の問題のメモは通す
 * （note.ts の parseNotes と同じ扱い）。解答は集計の母数になるので、崩れていたら取り込まない。
 */
const parseNotesMap = (value: unknown): Record<string, Note> | null => {
  if (typeof value !== "object" || value === null) return null;
  const notes: Record<string, Note> = {};
  for (const [id, note] of Object.entries(value)) {
    const parsed = parseNote(note);
    if (parsed) notes[id] = parsed;
  }
  return notes;
};

const parseTotals = (value: unknown): BackupTotals | null => {
  if (typeof value !== "object" || value === null) return null;
  const totals = value as Record<string, unknown>;
  const { recent, days } = totals;
  if (!Array.isArray(recent) || !recent.every((item) => typeof item === "boolean")) return null;
  if (!Array.isArray(days) || !days.every((item) => typeof item === "string")) return null;
  return { recent: recent.slice(-RECENT_LIMIT), days: days.slice(-DAY_LIMIT) };
};

/** 設定は欠けていても既定値で読む。設定 1 つのために記録ごと落とさない。 */
const parseSettings = (value: unknown): BackupSettings => {
  const settings = (typeof value === "object" && value !== null ? value : {}) as Record<
    string,
    unknown
  >;
  const { setId, shuffle, shuffleSeed, textScale, noteWidth } = settings;
  return {
    setId: typeof setId === "string" ? setId : null,
    shuffle: shuffle === true,
    shuffleSeed: typeof shuffleSeed === "number" && Number.isFinite(shuffleSeed) ? shuffleSeed : 0,
    textScale: isTextScale(textScale) ? textScale : DEFAULT_TEXT_SCALE,
    noteWidth:
      typeof noteWidth === "number" && Number.isFinite(noteWidth)
        ? clampNoteWidth(noteWidth)
        : DEFAULT_NOTE_WIDTH,
  };
};

/** 読み込んだ JSON を取り込める形に戻す。 */
export const parseBackup = (raw: unknown): BackupParse => {
  if (typeof raw !== "object" || raw === null) {
    return fail("学習記録のファイルではありません。");
  }
  const value = raw as Record<string, unknown>;
  if (value.kind !== BACKUP_KIND) {
    return fail("このサイトで書き出したファイルではありません。");
  }
  if (value.version !== BACKUP_VERSION) {
    return fail(`読めない版のファイルです（版 ${String(value.version)}）。`);
  }

  const scope = parseScope(value.scope);
  if (!scope) return fail("書き出した範囲が読み取れません。");

  const attempts = parseAttempts(value.attempts);
  if (!attempts) return fail("解答の記録が壊れています。");

  const notes = parseNotesMap(value.notes);
  if (!notes) return fail("メモが壊れています。");

  const backup: Backup = {
    kind: BACKUP_KIND,
    version: BACKUP_VERSION,
    exportedAt: typeof value.exportedAt === "string" ? value.exportedAt : "",
    scope,
    attempts,
    notes,
  };

  // 全体のファイルだけが設定・積み上げ・単語帳を持つ。個別に入っていても使わない
  // （個別を取り込んだだけで設定や連続日数が置き換わるのは、頼んでいない変更になる）。
  if (scope.type === "all") {
    const totals = parseTotals(value.totals ?? { recent: [], days: [] });
    if (!totals) return fail("累計の記録が壊れています。");
    backup.totals = totals;
    backup.settings = parseSettings(value.settings);
    backup.vocabWeak = Array.isArray(value.vocabWeak)
      ? value.vocabWeak.filter((id): id is string => typeof id === "string")
      : [];
  }

  return { ok: true, backup };
};

/** メモを差し替える。空のメモは持たない（note.ts の withNote と同じ扱い）。 */
const mergeNotes = (current: Record<string, Note>, incoming: Record<string, Note>): NoteRecord => {
  const notes = { ...current };
  for (const [id, note] of Object.entries(incoming)) {
    if (isBlankNote(note)) {
      delete notes[id];
    } else {
      notes[id] = note;
    }
  }
  return { version: NOTE_VERSION, notes };
};

/**
 * 取り込んだ内容を記録に反映する。
 *
 * 全体は置き換え、個別は重ね合わせ。個別で他の回の解答まで消してしまうと、
 * 「この回だけ移したい」という元の意図と合わなくなる。
 */
export const applyBackup = (backup: Backup, current: RecordSet): RecordSet => {
  if (backup.scope.type === "set") {
    return {
      record: {
        ...current.record,
        attempts: { ...current.record.attempts, ...backup.attempts },
      },
      notes: mergeNotes(current.notes.notes, backup.notes),
      weak: current.weak,
    };
  }

  const settings = backup.settings ?? parseSettings(undefined);
  const totals = backup.totals ?? { recent: [], days: [] };
  return {
    record: {
      version: RECORD_VERSION,
      setId: settings.setId,
      attempts: { ...backup.attempts },
      recent: [...totals.recent],
      days: [...totals.days],
      shuffle: settings.shuffle,
      shuffleSeed: settings.shuffleSeed,
      textScale: settings.textScale,
      noteWidth: settings.noteWidth,
    },
    notes: mergeNotes({}, backup.notes),
    weak: { version: WEAK_VERSION, ids: backup.vocabWeak ?? [] },
  };
};
