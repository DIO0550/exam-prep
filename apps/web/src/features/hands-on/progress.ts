import type { HandsOnRecord, Lab, LabProgress } from "./types";

export const EMPTY_RECORD: HandsOnRecord = { version: 1, labs: {} };
export const EMPTY_PROGRESS: LabProgress = { completed: [], drafts: {}, assisted: [] };

export const progressOf = (record: HandsOnRecord, labId: string): LabProgress =>
  record.labs[labId] ?? EMPTY_PROGRESS;

/** 後続だけが完了の記録は受け入れず、先頭からの連続した進捗を復元する。 */
export const readRecord = (raw: string | null, labs: Lab[]): HandsOnRecord => {
  try {
    const value = JSON.parse(raw ?? "null");
    if (value?.version !== 1 || typeof value.labs !== "object" || value.labs === null) {
      return EMPTY_RECORD;
    }

    const entries = labs.map((lab): [string, LabProgress] => {
      const saved = value.labs[lab.id];
      const completed: string[] = [];
      for (const step of lab.steps) {
        if (!Array.isArray(saved?.completed) || !saved.completed.includes(step.id)) {
          break;
        }

        completed.push(step.id);
      }

      const drafts = Object.fromEntries(
        lab.steps.flatMap((step) => {
          const draft = saved?.drafts?.[step.id];
          if (typeof draft !== "string") {
            return [];
          }

          return [[step.id, draft.slice(0, 20000)]];
        }),
      );
      const assisted = completed.filter(
        (id) => Array.isArray(saved?.assisted) && saved.assisted.includes(id),
      );
      return [lab.id, { completed, drafts, assisted }];
    });

    return { version: 1, labs: Object.fromEntries(entries) };
  } catch {
    return EMPTY_RECORD;
  }
};

export const finishStep = (
  progress: LabProgress,
  lab: Lab,
  stepId: string,
  assisted: boolean,
): LabProgress => {
  if (lab.steps[progress.completed.length]?.id !== stepId) {
    return progress;
  }

  const next = { ...progress, completed: [...progress.completed, stepId] };
  if (assisted) {
    return { ...next, assisted: [...progress.assisted, stepId] };
  }

  return next;
};
