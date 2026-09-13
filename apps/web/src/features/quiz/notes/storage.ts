import type { NoteRecord } from "./note";
import { emptyNotes, parseNotes } from "./note";

/**
 * メモの保存先。
 *
 * 学習記録（progress/storage.ts）とはキーを分けてある。メモは手書きを持つぶん大きく、
 * 伸び方も人によるので、容量を使い切ったときに巻き添えで解答履歴を落とさないため。
 * 読み書きで例外を握るのは学習記録と同じ理由（プライベートモードでは参照自体が投げる）。
 */

export const NOTES_KEY = "exam-prep:notes:v1";

export const loadNotes = (): NoteRecord => {
  if (typeof window === "undefined") return emptyNotes();
  try {
    const raw = window.localStorage.getItem(NOTES_KEY);
    return raw === null ? emptyNotes() : parseNotes(JSON.parse(raw));
  } catch {
    // 壊れた JSON、あるいは参照拒否。メモが無いものとして続ける。
    return emptyNotes();
  }
};

export const saveNotes = (record: NoteRecord): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NOTES_KEY, JSON.stringify(record));
  } catch {
    // 容量超過や書き込み拒否。この回のメモは画面の中だけで残る。
  }
};

export const clearNotes = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(NOTES_KEY);
  } catch {
    // 消せなくても画面側は空のメモで動く。
  }
};
