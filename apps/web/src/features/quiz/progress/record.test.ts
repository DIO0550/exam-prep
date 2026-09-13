import { describe, expect, it } from "vitest";

import type { Attempt } from "../stats";
import {
  DAY_LIMIT,
  dayKey,
  emptyRecord,
  parseRecord,
  RECENT_LIMIT,
  RECORD_VERSION,
  streakOf,
  withAnswer,
  withAttempt,
  withRestart,
} from "./record";

const ANSWERED: Attempt = { picked: 1, revealed: true, flagged: true, weak: true, excluded: [0] };

describe("dayKey", () => {
  it("ローカル時刻で日を切る", () => {
    expect(dayKey(new Date(2026, 8, 13, 0, 30))).toBe("2026-09-13");
    expect(dayKey(new Date(2026, 8, 13, 23, 30))).toBe("2026-09-13");
  });
});

describe("streakOf", () => {
  it("記録が無ければ 0", () => {
    expect(streakOf([], "2026-09-13")).toEqual({ current: 0, longest: 0 });
  });

  it("今日まで続いていれば、その日数がそのまま連続になる", () => {
    expect(streakOf(["2026-09-11", "2026-09-12", "2026-09-13"], "2026-09-13")).toEqual({
      current: 3,
      longest: 3,
    });
  });

  it("前日で終わっていても連続は切らない（その日まだ解いていないだけなので）", () => {
    expect(streakOf(["2026-09-11", "2026-09-12"], "2026-09-13")).toEqual({
      current: 2,
      longest: 2,
    });
  });

  it("2 日以上空くと連続は 0 に戻り、最長記録は残る", () => {
    expect(streakOf(["2026-09-01", "2026-09-02", "2026-09-03"], "2026-09-13")).toEqual({
      current: 0,
      longest: 3,
    });
  });

  it("月をまたいでも連続として数える", () => {
    expect(streakOf(["2026-08-31", "2026-09-01"], "2026-09-01")).toEqual({
      current: 2,
      longest: 2,
    });
  });

  it("同じ日が二重に入っていても 1 日と数える", () => {
    expect(streakOf(["2026-09-12", "2026-09-12", "2026-09-13"], "2026-09-13")).toEqual({
      current: 2,
      longest: 2,
    });
  });
});

describe("withAnswer", () => {
  it("解答状況・直近の正誤・学習日をまとめて足す", () => {
    const record = withAnswer(emptyRecord(), "q1", ANSWERED, true, new Date(2026, 8, 13, 10));

    expect(record.attempts.q1).toEqual(ANSWERED);
    expect(record.recent).toEqual([true]);
    expect(record.days).toEqual(["2026-09-13"]);
  });

  it("同じ日に何問解いても学習日は 1 つ", () => {
    const first = withAnswer(emptyRecord(), "q1", ANSWERED, true, new Date(2026, 8, 13, 10));
    const second = withAnswer(first, "q2", ANSWERED, false, new Date(2026, 8, 13, 22));

    expect(second.days).toEqual(["2026-09-13"]);
    expect(second.recent).toEqual([true, false]);
  });

  it(`直近の正誤は ${RECENT_LIMIT} 件で打ち切り、古いほうから落とす`, () => {
    const full = { ...emptyRecord(), recent: Array.from({ length: RECENT_LIMIT }, () => false) };
    const record = withAnswer(full, "q1", ANSWERED, true, new Date());

    expect(record.recent).toHaveLength(RECENT_LIMIT);
    expect(record.recent.at(0)).toBe(false);
    expect(record.recent.at(-1)).toBe(true);
  });

  it(`学習日は ${DAY_LIMIT} 件で打ち切る`, () => {
    const days = Array.from({ length: DAY_LIMIT }, (_, i) => dayKey(new Date(2020, 0, 1 + i)));
    const record = withAnswer(
      { ...emptyRecord(), days },
      "q1",
      ANSWERED,
      true,
      new Date(2026, 8, 13),
    );

    expect(record.days).toHaveLength(DAY_LIMIT);
    expect(record.days.at(0)).toBe("2020-01-02");
    expect(record.days.at(-1)).toBe("2026-09-13");
  });
});

describe("withRestart", () => {
  it("解答は消すが、フラグと苦手登録は残す", () => {
    const record = withRestart(withAttempt(emptyRecord(), "q1", ANSWERED), ["q1"]);

    expect(record.attempts.q1).toEqual({
      picked: null,
      revealed: false,
      flagged: true,
      weak: true,
      excluded: [],
    });
  });

  it("指定していない問題には触らない", () => {
    const before = withAttempt(emptyRecord(), "q2", ANSWERED);

    expect(withRestart(before, ["q1"]).attempts.q2).toEqual(ANSWERED);
  });
});

describe("parseRecord", () => {
  const stored = {
    version: RECORD_VERSION,
    setId: "ap-r07-aki-am",
    attempts: { q1: ANSWERED },
    recent: [true, false],
    days: ["2026-09-13"],
  };

  it("保存した形をそのまま戻す", () => {
    expect(parseRecord(structuredClone(stored))).toEqual(stored);
  });

  it("版が違う記録は捨てる", () => {
    expect(parseRecord({ ...stored, version: RECORD_VERSION + 1 })).toEqual(emptyRecord());
  });

  it("解答状況の形が崩れていたら、部分的に読まずに捨てる", () => {
    const broken = { ...stored, attempts: { q1: { picked: 1 } } };

    expect(parseRecord(broken)).toEqual(emptyRecord());
  });

  it("記録ですらない値は捨てる", () => {
    expect(parseRecord(null)).toEqual(emptyRecord());
    expect(parseRecord("記録")).toEqual(emptyRecord());
    expect(parseRecord({ ...stored, days: [1, 2] })).toEqual(emptyRecord());
  });

  it("選んでいた回が文字列でなければ、選択なしとして読む", () => {
    expect(parseRecord({ ...stored, setId: 7 }).setId).toBeNull();
  });
});
