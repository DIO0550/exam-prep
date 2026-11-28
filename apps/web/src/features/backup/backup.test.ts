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
  backupCounts,
  backupFileName,
  buildAllBackup,
  buildSetBackup,
  isEmptyBackup,
  parseBackup,
  scopeLabel,
} from "./backup";
import type { PmPastData } from "./pm-past";
import { emptyPmPast } from "./pm-past";

const ANSWERED: Attempt = {
  picked: 2,
  revealed: true,
  flagged: false,
  weak: false,
  excluded: [],
};

const NOW = new Date("2026-09-22T12:34:56Z");

const PM_A = "ap-r06-aki-pm-05";
const PM_B = "ap-r06-aki-pm-06";
const PM_OTHER_EXAM = "ap-r05-haru-pm-01";

/** 午後の過去問題を 2 回分（令和6年度秋期の問5・問6、令和5年度春期の問1）解いた記録。 */
const pmPast = (): PmPastData => ({
  attempts: {
    [PM_A]: { solvedOn: "2026-09-21", score: 70 },
    [PM_OTHER_EXAM]: { solvedOn: "2026-09-20" },
  },
  answers: { [PM_A]: { "設問1-a": "VLAN" }, [PM_B]: { 設問2: "冗長化" } },
  marks: { [PM_A]: { "設問1-a": "ok" } },
  markers: { [PM_A]: [{ start: 0, end: 2, text: "〔概", color: "yellow" }] },
});

/** 2 つの回に解答があり、メモと「あやふや」、午後の過去問題の記録も付いている記録。 */
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
  pm: pmPast(),
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

  it("午後の過去問題の記録も入れる。答えを全部消した問（空の欄）は入れない", () => {
    const current = records();
    current.pm.answers["ap-r06-aki-pm-01"] = {};
    const backup = buildAllBackup(current, NOW);

    expect(backup.pmPast).toEqual(pmPast());
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

  it("午前の回には午後の記録を持たせない（版 1 と同じ形のまま）", () => {
    expect(setBackup().pmPast).toBeUndefined();
  });

  it("午後の 1 回分は、その回の問の答え・○△×・点数・マーカーとメモを入れる", () => {
    const current = records();
    current.notes.notes[PM_B] = { text: "冗長化の目的", strokes: [] };
    const backup = buildSetBackup(current, {
      id: "ap-r06-aki-pm",
      label: "応用情報 午後 令和6年度 秋期",
      questionIds: [PM_A, PM_B, "ap-r06-aki-pm-01"],
    });

    expect(backup.attempts).toEqual({});
    expect(Object.keys(backup.notes)).toEqual([PM_B]);
    expect(backup.pmPast).toEqual({
      attempts: { [PM_A]: { solvedOn: "2026-09-21", score: 70 } },
      answers: pmPast().answers,
      marks: pmPast().marks,
      markers: pmPast().markers,
    });
  });

  it("午前と午後をまたいだ範囲も 1 つのファイルにできる", () => {
    const backup = buildSetBackup(records(), {
      id: "ap-past",
      label: "応用情報の過去問 午前・午後",
      questionIds: ["ap-r07-aki-am-01", PM_A, PM_B, PM_OTHER_EXAM],
    });

    expect(Object.keys(backup.attempts)).toEqual(["ap-r07-aki-am-01"]);
    expect(backup.pmPast).toEqual(pmPast());
    expect(backupCounts(backup)).toEqual({ attempts: 1, notes: 1, weak: 0, pm: 3 });
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

  it("午後の 1 回分のファイルも読める", () => {
    const backup = buildSetBackup(records(), {
      id: "ap-r06-aki-pm",
      label: "応用情報 午後 令和6年度 秋期",
      questionIds: [PM_A, PM_B],
    });

    expect(roundTrip(backup)).toEqual({ ok: true, backup });
  });

  it("版 1 のファイル（午後の記録が無い）も読める", () => {
    const parsed = parseBackup({
      kind: BACKUP_KIND,
      version: 1,
      exportedAt: NOW.toISOString(),
      scope: { type: "all" },
      attempts: { "ap-r07-aki-am-01": ANSWERED },
      notes: {},
      totals: { recent: [true], days: ["2026-09-22"] },
      settings: {},
      vocabWeak: [],
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.backup.pmPast).toBeUndefined();
    expect(Object.keys(parsed.backup.attempts)).toEqual(["ap-r07-aki-am-01"]);
  });

  it("午後の記録は崩れた項目だけを落とす。全体が崩れていたら断る", () => {
    const base = {
      kind: BACKUP_KIND,
      version: BACKUP_VERSION,
      exportedAt: NOW.toISOString(),
      scope: { type: "set", setId: "ap-r06-aki-pm", label: "応用情報 午後 令和6年度 秋期" },
      attempts: {},
      notes: {},
    };
    const parsed = parseBackup({
      ...base,
      pmPast: {
        attempts: { [PM_A]: { solvedOn: "2026-09-21", score: 70 }, [PM_B]: { solvedOn: 3 } },
        answers: { [PM_A]: { "設問1-a": "VLAN", "設問1-b": 4 } },
        marks: { [PM_A]: { "設問1-a": "maybe" } },
        markers: "壊れた値",
      },
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.backup.pmPast).toEqual({
      attempts: { [PM_A]: { solvedOn: "2026-09-21", score: 70 } },
      answers: { [PM_A]: { "設問1-a": "VLAN" } },
      marks: {},
      markers: {},
    });
    expect(parseBackup({ ...base, pmPast: [] }).ok).toBe(false);
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
    pm: {
      attempts: {
        [PM_A]: { solvedOn: "2026-09-01", score: 40 },
        "ap-r06-aki-pm-10": { solvedOn: "2026-09-02" },
      },
      answers: { [PM_A]: { "設問1-a": "古い答え", 設問3: "消える" } },
      marks: { [PM_A]: { "設問1-a": "ng", 設問3: "partial" } },
      markers: { [PM_A]: [{ start: 3, end: 5, text: "古い", color: "pink" }] },
    },
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
    expect(next.pm).toEqual(pmPast());
  });

  it("全体でも版 1 のファイルなら、午後の記録には触らない", () => {
    const { pmPast: _, ...v1 } = buildAllBackup(records(), NOW);
    const current = other();

    expect(applyBackup(v1, current).pm).toBe(current.pm);
  });

  it("午後の 1 回分は、入っている問を丸ごとそろえ、ほかの問はそのまま残す", () => {
    const backup = buildSetBackup(records(), {
      id: "ap-r06-aki-pm",
      label: "応用情報 午後 令和6年度 秋期",
      questionIds: [PM_A, PM_B, "ap-r06-aki-pm-10"],
    });
    const current = other();
    const next = applyBackup(backup, current);

    // 問5: 答え・○△×・点数・マーカーをファイルの内容にそろえる（古い欄の答えや印は残さない）。
    expect(next.pm.attempts[PM_A]).toEqual({ solvedOn: "2026-09-21", score: 70 });
    expect(next.pm.answers[PM_A]).toEqual({ "設問1-a": "VLAN" });
    expect(next.pm.marks[PM_A]).toEqual({ "設問1-a": "ok" });
    expect(next.pm.markers[PM_A]).toEqual(pmPast().markers[PM_A]);
    // 問6: 答えだけがある問。点数・印が無いのもファイルどおり。
    expect(next.pm.answers[PM_B]).toEqual({ 設問2: "冗長化" });
    expect(next.pm.attempts[PM_B]).toBeUndefined();
    // 問10: ファイルに入っていない問は消さない。
    expect(next.pm.attempts["ap-r06-aki-pm-10"]).toEqual({ solvedOn: "2026-09-02" });
    // 演習の記録には触らない。
    expect(next.record.attempts).toEqual(current.record.attempts);
  });

  it("午前の回の取り込みでは、午後の記録に触らない", () => {
    const backup = buildSetBackup(records(), {
      id: "ap-r07-aki-am",
      label: "令和7年 秋期",
      questionIds: ["ap-r07-aki-am-01"],
    });
    const current = other();

    expect(applyBackup(backup, current).pm).toBe(current.pm);
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
    const empty: RecordSet = {
      record: emptyRecord(),
      notes: emptyNotes(),
      weak: emptyWeak(),
      pm: emptyPmPast(),
    };

    expect(isEmptyBackup(buildAllBackup(empty, NOW))).toBe(true);
    expect(isEmptyBackup(buildAllBackup(records(), NOW))).toBe(false);
    // 午後の記録だけのファイルも、空ではない。
    expect(isEmptyBackup(buildAllBackup({ ...empty, pm: pmPast() }, NOW))).toBe(false);
  });
});

it("複数の解答と未確定の選択をJSONバックアップから復元する", () => {
  const current = records();
  current.record.attempts.multiple = { ...ANSWERED, picked: [2, 0] };
  current.record.attempts.draft = { ...ANSWERED, picked: [1], revealed: false };
  const parsed = parseBackup(JSON.parse(JSON.stringify(buildAllBackup(current, NOW))));
  expect(parsed.ok).toBe(true);
  if (!parsed.ok) {
    return;
  }
  const restored = applyBackup(parsed.backup, records());
  expect(restored.record.attempts.multiple).toEqual(current.record.attempts.multiple);
  expect(restored.record.attempts.draft).toEqual(current.record.attempts.draft);
});
