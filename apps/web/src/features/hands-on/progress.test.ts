import { expect, it } from "vitest";
import { LABS } from "./data/labs";
import { EMPTY_PROGRESS, EMPTY_RECORD, finishStep, progressOf, readRecord } from "./progress";

const lab = LABS[0];
if (!lab) {
  throw new Error("演習データが必要です");
}

it("前の手順が未完了なら後続を完了できない", () => {
  expect(finishStep(EMPTY_PROGRESS, lab, lab.steps[1]?.id ?? "", false)).toBe(EMPTY_PROGRESS);
  const first = finishStep(EMPTY_PROGRESS, lab, lab.steps[0].id, true);
  expect(first.completed).toEqual([lab.steps[0].id]);
  expect(first.assisted).toEqual([lab.steps[0].id]);
  expect(finishStep(first, lab, lab.steps[0].id, true)).toBe(first);
});

it("復元では不連続な完了と未知の演習・手順を除去する", () => {
  const first = lab.steps[0].id;
  const third = lab.steps[2]?.id ?? "";
  const record = readRecord(
    JSON.stringify({
      version: 1,
      labs: {
        [lab.id]: {
          completed: [first, third, "unknown"],
          drafts: { [first]: "draft", unknown: "drop" },
          assisted: [first, "unknown"],
        },
        unknown: { completed: ["x"] },
      },
    }),
    LABS,
  );
  expect(progressOf(record, lab.id)).toEqual({
    completed: [first],
    drafts: { [first]: "draft" },
    assisted: [first],
  });
  expect(record.labs.unknown).toBeUndefined();
});

it.each([null, "not-json", "null", '{"version":2,"labs":{}}', '{"version":1,"labs":null}'])(
  "壊れた保存内容でも空の進捗から開始できる: %s",
  (raw) => {
    expect(readRecord(raw, LABS)).toBe(EMPTY_RECORD);
  },
);
