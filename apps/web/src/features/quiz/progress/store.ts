import type { Attempt } from "../stats";
import type { ProgressRecord } from "./record";
import {
  attemptOf,
  EMPTY_RECORD,
  withAnswer,
  withAttempt,
  withRestart,
  withSetId,
  withShuffle,
} from "./record";
import { clearRecord, loadRecord, STORAGE_KEY, saveRecord } from "./storage";

/**
 * 学習記録の入れ物。React の外に置いて useSyncExternalStore から読む。
 *
 * 記録は画面をまたいで 1 つしか無く、書き換えるのは操作した瞬間だけなので、
 * コンポーネント階層で持ち回すより、購読できる 1 か所に置くほうが素直に収まる。
 */

let cache: ProgressRecord | null = null;
const listeners = new Set<() => void>();

const emit = (): void => {
  for (const listener of listeners) listener();
};

/** 読み出し。同じ内容なら同じ参照を返す（再描画の判定に使われるため）。 */
const snapshot = (): ProgressRecord => {
  cache ??= loadRecord();
  return cache;
};

const update = (next: ProgressRecord): void => {
  cache = next;
  saveRecord(next);
  emit();
};

/** 別タブでの更新を取り込む。storage イベントは自タブには来ないので、これで足りる。 */
const handleStorage = (event: StorageEvent): void => {
  // key が null なのは clear() されたとき。どちらも読み直す。
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  cache = loadRecord();
  emit();
};

export const progressStore = {
  subscribe: (listener: () => void): (() => void) => {
    if (listeners.size === 0) window.addEventListener("storage", handleStorage);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", handleStorage);
    };
  },

  snapshot,

  /**
   * SSR と hydration のあいだに返す値。
   *
   * static export した HTML は誰の記録も持たないので、そこは空の記録で描く。
   * hydration が済んだ時点で React が snapshot() を読み直し、保存されていた値に差し替わる。
   */
  serverSnapshot: (): ProgressRecord => EMPTY_RECORD,

  /** 選んでいる回を覚える。 */
  selectSet: (setId: string): void => {
    if (snapshot().setId === setId) return;
    update(withSetId(snapshot(), setId));
  },

  /** 選択肢をシャッフルして出すかを覚える。 */
  setShuffle: (shuffle: boolean): void => {
    if (snapshot().shuffle === shuffle) return;
    update(withShuffle(snapshot(), shuffle));
  },

  /** 解答状況の一部を差し替える（フラグ・苦手登録・選択肢の消し込み）。 */
  patchAttempt: (questionId: string, patch: Partial<Attempt>): void => {
    const record = snapshot();
    update(withAttempt(record, questionId, { ...attemptOf(record, questionId), ...patch }));
  },

  /** 解答を記録する。累計正答率と連続学習日数もここで伸びる。 */
  answer: (questionId: string, choice: number, correct: boolean, now = new Date()): void => {
    const record = snapshot();
    const attempt: Attempt = {
      ...attemptOf(record, questionId),
      picked: choice,
      revealed: true,
      // 間違えた問題は苦手登録に入る。一度付いた登録は正解しても自動では外さない。
      weak: attemptOf(record, questionId).weak || !correct,
    };
    update(withAnswer(record, questionId, attempt, correct, now));
  },

  /** 指定した回の解答を消す。フラグ・苦手登録・累計の記録は残す。 */
  restart: (questionIds: string[]): void => {
    update(withRestart(snapshot(), questionIds));
  },

  /** 学習記録をすべて捨てる。 */
  clear: (): void => {
    clearRecord();
    // 次の読み出しで localStorage から取り直す。消したあとに別タブが書いた値も拾える。
    cache = null;
    emit();
  },
};
