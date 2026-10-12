import { expect, it } from "vitest";
import { isEmptyBackup, parseBackup } from "../backup/backup";
import { exportAll, exportSet, importBackup } from "../backup/restore";
import { LABS } from "./data/labs";
import { EMPTY_RECORD } from "./progress";
import { handsOnStore } from "./store";

const lab = LABS[0];
if (!lab) {
  throw new Error("演習データが必要です");
}

it("ハンズオンだけの記録も全体バックアップで保存・復元できる", () => {
  handsOnStore.set({
    version: 1,
    labs: {
      [lab.id]: {
        completed: [lab.steps[0].id],
        drafts: { [lab.steps[0].id]: lab.steps[0].answer },
        assisted: [],
      },
    },
  });
  const backup = exportAll();
  expect(isEmptyBackup(backup)).toBe(false);
  const parsed = parseBackup(JSON.parse(JSON.stringify(backup)));
  expect(parsed.ok).toBe(true);
  if (!parsed.ok) {
    return;
  }

  handsOnStore.set(EMPTY_RECORD);
  importBackup(parsed.backup);
  expect(handsOnStore.snapshot().record.labs[lab.id]?.completed).toEqual([lab.steps[0].id]);
});

it("個別バックアップと旧ファイルでは既存のハンズオン記録を変えない", () => {
  const progress = { completed: [], drafts: { [lab.steps[0].id]: "draft" }, assisted: [] };
  handsOnStore.set({ version: 1, labs: { [lab.id]: progress } });
  const all = exportAll();
  delete all.handsOn;
  importBackup(all);
  expect(handsOnStore.snapshot().record.labs[lab.id]).toEqual(progress);
  const set = exportSet({ id: "ace-mock-1", label: "ACE", questionIds: [] });
  expect(set.handsOn).toBeUndefined();
  importBackup(set);
  expect(handsOnStore.snapshot().record.labs[lab.id]).toEqual(progress);
});
