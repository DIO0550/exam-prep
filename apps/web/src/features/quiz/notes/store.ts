import { createLocalStore } from "../local-store";
import type { NoteRecord, Stroke } from "./note";
import { EMPTY_NOTES, withoutLastStroke, withoutStrokes, withStroke, withText } from "./note";
import { clearNotes, loadNotes, NOTES_KEY, saveNotes } from "./storage";

/**
 * 問題ごとのメモの入れ物。学習記録と同じく React の外に置いて useSyncExternalStore から読む。
 *
 * 書き込みは操作のたびに保存する（文章は 1 文字ごと）。メモは書いた直後にタブを閉じられても
 * 残っていてほしく、まとめ書きのために失う危険を取るほどの量ではないため。
 */

const store = createLocalStore<NoteRecord>({
  storageKey: NOTES_KEY,
  load: loadNotes,
  save: saveNotes,
  remove: clearNotes,
});

export const noteStore = {
  subscribe: store.subscribe,

  snapshot: store.snapshot,

  /** SSR と hydration のあいだに返す値。static export した HTML は誰のメモも持たない。 */
  serverSnapshot: (): NoteRecord => EMPTY_NOTES,

  /** 自由入力を差し替える。 */
  setText: (questionId: string, text: string): void => {
    store.set(withText(store.snapshot(), questionId, text));
  },

  /** 手書きのひと筆を足す。 */
  addStroke: (questionId: string, stroke: Stroke): void => {
    store.set(withStroke(store.snapshot(), questionId, stroke));
  },

  /** 手書きの最後のひと筆を取り消す。 */
  undoStroke: (questionId: string): void => {
    store.set(withoutLastStroke(store.snapshot(), questionId));
  },

  /** 手書きだけを全部消す。文章は残す。 */
  clearSketch: (questionId: string): void => {
    store.set(withoutStrokes(store.snapshot(), questionId));
  },

  /** メモをまるごと差し替える（書き出したファイルの取り込み）。 */
  replace: (record: NoteRecord): void => {
    store.set(record);
  },

  /** メモをすべて捨てる。 */
  clear: store.reset,
};
