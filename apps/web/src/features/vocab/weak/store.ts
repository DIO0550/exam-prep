import { createLocalStore } from "../../quiz/local-store";
import { clearWeak, loadWeak, saveWeak, WEAK_KEY } from "./storage";
import type { WeakRecord } from "./weak";
import { EMPTY_WEAK, withWeak } from "./weak";

/**
 * 「あやふや」の入れ物。学習記録やメモと同じく React の外に置いて useSyncExternalStore から読む。
 */

const store = createLocalStore<WeakRecord>({
  storageKey: WEAK_KEY,
  load: loadWeak,
  save: saveWeak,
  remove: clearWeak,
});

export const weakStore = {
  subscribe: store.subscribe,

  snapshot: store.snapshot,

  /** SSR と hydration のあいだに返す値。static export した HTML は誰の記録も持たない。 */
  serverSnapshot: (): WeakRecord => EMPTY_WEAK,

  /** 「あやふや」を付ける・外す。 */
  mark: (id: string, weak: boolean): void => {
    store.set(withWeak(store.snapshot(), id, weak));
  },

  /** まるごと差し替える（書き出したファイルの取り込み）。 */
  replace: (record: WeakRecord): void => {
    store.set(record);
  },

  clear: store.reset,
};
