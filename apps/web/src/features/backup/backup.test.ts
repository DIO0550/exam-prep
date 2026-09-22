import { describe, expect, it } from "vitest";

import { emptyNotes } from "../quiz/notes/note";
import { emptyRecord } from "../quiz/progress/record";
import type { Attempt } from "../quiz/stats";
import { emptyWeak } from "../vocab/weak/weak";
import type { Backup, RecordSet } from "./backup";
import {
  applyBackup,
  BACKUP_KIND,
  BACKUP_VERSION,
  backupFileName,
  buildAllBackup,
  buildSetBackup,
  isEmptyBackup,
  parseBackup,
  scopeLabel,
} from "./backup";

const ANSWERED: Attempt = {
  picked: 2,
  revealed: true,
  flagged: false,
  weak: false,
  excluded: [],
};

const NOW = new Date("2026-09-22T12:34:56Z");

/** 2 つの回に解答があり、メモと「あやふや」も付いている記録。 */
const records = (): RecordSet => ({
  record: {
    ...emptyRecord(),
    setId: "ap-r07-aki-am",
    attempts: {
      "ap-r07-aki-am-01": ANSWERED,
      "gcp-cdl-scenario-1-01": { ...ANSWERED, picked: 1, flagged: true },
    },
    recent: [true, false],
    days: ["2026-09-21", "2026-09-22"],
    shuffle: true,
    shuffleSeed: 3,
  },
  notes: {
    ...emptyNotes(),
    notes: {
      "ap-r07-aki-am-01": { text: "桁あふれ", strokes: [[1, 2, 3, 4]] },
      "gcp-cdl-scenario-1-01": { text: "BigQuery", strokes: [] },
    },
  },
  weak: { ...emptyWeak(), ids: ["net-CPU"] },
});

/** JSON にして読み直す。ファイルを経由したときと同じ経路で確かめる。 */
const roundTrip = (backup: Backup) => parseBackup(JSON.parse(JSON.stringify(backup)));

describe("buildAllBackup", () => {
  it("解答・メモ・あやふや・設定をまとめて入れる", () => {
    const backup = buildAllBackup(records(), NOW);

    expect(backup.kind).toBe(BACKUP_KIND);
    expect(backup.version).toBe(BACKUP_VERSION);
    expect(backup.exportedAt).toBe(NOW.toISOString());
    expect(backup.scope).toEqual({ type: "all" });
    expect(Object.keys(backup.attempts)).toHaveLength(2);
    expect(Object.keys(backup.notes)).toHaveLength(2);
    expect(backup.totals).toEqual({ recent: [true, false], days: ["2026-09-21", "2026-09-22"] });
    expect(backup.settings).toMatchObject({
      setId: "ap-r07-aki-am",
      shuffle: true,
      shuffleSeed: 3,
    });
    expect(backup.vocabWeak).toEqual(["net-CPU"]);
  });
});

describe("buildSetBackup", () => {
  const setBackup = () =>
    buildSetBackup(records(), {
      id: "ap-r07-aki-am",
      label: "令和7年 秋期",
      questionIds: ["ap-r07-aki-am-01", "ap-r07-aki-am-02"],
    });

  it("渡した回の解答とメモだけを入れる", () => {
    const backup = setBackup();

    expect(Object.keys(backup.attempts)).toEqual(["ap-r07-aki-am-01"]);
    expect(Object.keys(backup.notes)).toEqual(["ap-r07-aki-am-01"]);
    expect(backup.scope).toEqual({ type: "set", setId: "ap-r07-aki-am", label: "令和7年 秋期" });
  });

  it("累計・設定・単語帳は入れない（回ごとに切り分けられないため）", () => {
    const backup = setBackup();

    expect(backup.totals).toBeUndefined();
    expect(backup.settings).toBeUndefined();
    expect(backup.vocabWeak).toBeUndefined();
  });
});

describe("parseBackup", () => {
  it("書き出したものをそのまま読める", () => {
    const backup = buildAllBackup(records(), NOW);
    const parsed = roundTrip(backup);

    expect(parsed).toEqual({ ok: true, backup });
  });

  it("個別のファイルも読める", () => {
    const backup = buildSetBackup(records(), {
      id: "gcp-cdl-scenario-1",
      label: "シナリオ問題1",
      questionIds: ["gcp-cdl-scenario-1-01"],
    });

    expect(roundTrip(backup)).toEqual({ ok: true, backup });
  });

  it("印が無いもの・別の版・壊れた解答は理由を付けて断る", () => {
    expect(parseBackup({ version: 1, attempts: {}, notes: {} }).ok).toBe(false);
    expect(parseBackup({ kind: BACKUP_KIND, version: 99 }).ok).toBe(false);
    expect(
      parseBackup({
        kind: BACKUP_KIND,
        version: BACKUP_VERSION,
        scope: { type: "all" },
        attempts: { "ap-r07-aki-am-01": { picked: "ア" } },
        notes: {},
      }).ok,
    ).toBe(false);
    expect(parseBackup("{}").ok).toBe(false);
  });

  it("個別のファイルに設定や単語帳が入っていても拾わない", () => {
    const parsed = parseBackup({
      kind: BACKUP_KIND,
      version: BACKUP_VERSION,
      exportedAt: NOW.toISOString(),
      scope: { type: "set", setId: "ap-r07-aki-am", label: "令和7年 秋期" },
      attempts: {},
      notes: {},
      settings: { shuffle: true, noteWidth: 700 },
      vocabWeak: ["net-CPU"],
      totals: { recent: [true], days: ["2026-09-22"] },
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.backup.settings).toBeUndefined();
    expect(parsed.backup.vocabWeak).toBeUndefined();
    expect(parsed.backup.totals).toBeUndefined();
  });

  it("壊れたメモだけを落とし、他の問題のメモは通す", () => {
    const parsed = parseBackup({
      kind: BACKUP_KIND,
      version: BACKUP_VERSION,
      exportedAt: NOW.toISOString(),
      scope: { type: "all" },
      attempts: {},
      notes: {
        "ap-r07-aki-am-01": { text: "残る", strokes: [] },
        "ap-r07-aki-am-02": { text: 3, strokes: [] },
      },
      totals: { recent: [], days: [] },
      settings: {},
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(Object.keys(parsed.backup.notes)).toEqual(["ap-r07-aki-am-01"]);
  });
});

describe("applyBackup", () => {
  /** 別の端末の記録。取り込み先として使う。 */
  const other = (): RecordSet => ({
    record: {
      ...emptyRecord(),
      setId: "gcp-cdl-scenario-1",
      attempts: { "gcp-cdl-service-1-01": ANSWERED },
      recent: [true],
      days: ["2026-09-20"],
      noteWidth: 700,
    },
    notes: { ...emptyNotes(), notes: { "gcp-cdl-service-1-01": { text: "元から", strokes: [] } } },
    weak: { ...emptyWeak(), ids: ["sec-WAF"] },
  });

  it("全体は置き換える", () => {
    const next = applyBackup(buildAllBackup(records(), NOW), other());

    expect(Object.keys(next.record.attempts).sort()).toEqual([
      "ap-r07-aki-am-01",
      "gcp-cdl-scenario-1-01",
    ]);
    expect(next.record.days).toEqual(["2026-09-21", "2026-09-22"]);
    expect(next.record.setId).toBe("ap-r07-aki-am");
    expect(next.record.shuffle).toBe(true);
    expect(Object.keys(next.notes.notes).sort()).toEqual([
      "ap-r07-aki-am-01",
      "gcp-cdl-scenario-1-01",
    ]);
    expect(next.weak.ids).toEqual(["net-CPU"]);
  });

  it("個別はその回だけを上書きし、他の回・累計・単語帳はそのまま残す", () => {
    const backup = buildSetBackup(records(), {
      id: "ap-r07-aki-am",
      label: "令和7年 秋期",
      questionIds: ["ap-r07-aki-am-01"],
    });
    const current = other();
    const next = applyBackup(backup, current);

    expect(Object.keys(next.record.attempts).sort()).toEqual([
      "ap-r07-aki-am-01",
      "gcp-cdl-service-1-01",
    ]);
    expect(next.record.days).toEqual(["2026-09-20"]);
    expect(next.record.setId).toBe("gcp-cdl-scenario-1");
    expect(next.record.noteWidth).toBe(700);
    expect(next.notes.notes["gcp-cdl-service-1-01"]?.text).toBe("元から");
    // 単語帳に触らないことは、同じ参照が返ることで示す（restore.ts はこれを見て書き込みを省く）。
    expect(next.weak).toBe(current.weak);
  });
});

describe("表示に出す文字", () => {
  it("範囲の表記", () => {
    expect(scopeLabel({ type: "all" })).toBe("全体");
    expect(scopeLabel({ type: "set", setId: "ap-r07-aki-am", label: "令和7年 秋期" })).toBe(
      "個別（令和7年 秋期）",
    );
  });

  it("ファイル名には範囲と日付が入る", () => {
    expect(backupFileName(buildAllBackup(records(), NOW), new Date(2026, 8, 22))).toBe(
      "exam-prep-all-20260922.json",
    );
  });

  it("何も入っていないファイルを見分ける", () => {
    const empty: RecordSet = { record: emptyRecord(), notes: emptyNotes(), weak: emptyWeak() };

    expect(isEmptyBackup(buildAllBackup(empty, NOW))).toBe(true);
    expect(isEmptyBackup(buildAllBackup(records(), NOW))).toBe(false);
  });
});
