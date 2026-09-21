import { createLocalStore } from "../local-store";
import type { Attempt } from "../stats";
import type { TextScale } from "../text-scale";
import type { ProgressRecord } from "./record";
import {
  attemptOf,
  EMPTY_RECORD,
  withAnswer,
  withAttempt,
  withNoteWidth,
  withRestart,
  withSetId,
  withShuffle,
  withTextScale,
} from "./record";
import { clearRecord, loadRecord, STORAGE_KEY, saveRecord } from "./storage";

/**
 * 学習記録の入れ物。React の外に置いて useSyncExternalStore から読む。
 *
 * 記録は画面をまたいで 1 つしか無く、書き換えるのは操作した瞬間だけなので、
 * コンポーネント階層で持ち回すより、購読できる 1 か所に置くほうが素直に収まる。
 */

const store = createLocalStore<ProgressRecord>({
  storageKey: STORAGE_KEY,
  load: loadRecord,
  save: saveRecord,
  remove: clearRecord,
});

const snapshot = store.snapshot;

export const progressStore = {
  subscribe: store.subscribe,

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
    store.set(withSetId(snapshot(), setId));
  },

  /** 選択肢をシャッフルして出すかを覚える。 */
  setShuffle: (shuffle: boolean): void => {
    if (snapshot().shuffle === shuffle) return;
    store.set(withShuffle(snapshot(), shuffle));
  },

  /** 問題文と解説の文字の大きさを覚える。 */
  setTextScale: (textScale: TextScale): void => {
    if (snapshot().textScale === textScale) return;
    store.set(withTextScale(snapshot(), textScale));
  },

  /** メモの枠の幅を覚える。ドラッグの途中ではなく、手を離したときに呼ぶ。 */
  setNoteWidth: (width: number): void => {
    const record = snapshot();
    const next = withNoteWidth(record, width);
    if (next.noteWidth === record.noteWidth) return;
    store.set(next);
  },

  /** 解答状況の一部を差し替える（フラグ・苦手登録・選択肢の消し込み）。 */
  patchAttempt: (questionId: string, patch: Partial<Attempt>): void => {
    const record = snapshot();
    store.set(withAttempt(record, questionId, { ...attemptOf(record, questionId), ...patch }));
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
    store.set(withAnswer(record, questionId, attempt, correct, now));
  },

  /** 指定した回の解答を消す。フラグ・苦手登録・累計の記録は残す。 */
  restart: (questionIds: string[]): void => {
    store.set(withRestart(snapshot(), questionIds));
  },

  /** 学習記録をすべて捨てる。 */
  clear: store.reset,
};
