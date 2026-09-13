/**
 * localStorage に置いた 1 件の値を、React の外から購読できるようにする土台。
 *
 * 学習記録（progress/）と問題ごとのメモ（notes/）が同じ形を必要とするので、共通部分をここに置く。
 * どちらも「同期で読める（最初の描画でそのまま出せる）」「書いたらすぐ保存する」
 * 「別タブの更新に追従する」の 3 つが要る。
 *
 * 値の形・検証・保存先のキーは、使う側（progress/ と notes/）が持つ。
 */

type LocalStoreOptions<T> = {
  /** 見張る localStorage のキー。別タブからの更新を、このキーで絞る。 */
  storageKey: string;
  /** 保存されている値を読む。読めなければ空の値を返す。 */
  load: () => T;
  save: (value: T) => void;
  /** 保存先から消す。 */
  remove: () => void;
};

export type LocalStore<T> = {
  subscribe: (listener: () => void) => () => void;
  /** 読み出し。同じ内容なら同じ参照を返す（useSyncExternalStore が同一性で見るため）。 */
  snapshot: () => T;
  /** 新しい値を保存して、購読側に知らせる。 */
  set: (value: T) => void;
  /** 保存先ごと捨てる。次の読み出しで読み直す。 */
  reset: () => void;
};

export const createLocalStore = <T>({
  storageKey,
  load,
  save,
  remove,
}: LocalStoreOptions<T>): LocalStore<T> => {
  let cache: T | null = null;
  const listeners = new Set<() => void>();

  const emit = (): void => {
    for (const listener of listeners) listener();
  };

  /** 別タブでの更新を取り込む。storage イベントは自タブには来ないので、これで足りる。 */
  const handleStorage = (event: StorageEvent): void => {
    // key が null なのは clear() されたとき。どちらも読み直す。
    if (event.key !== null && event.key !== storageKey) return;
    cache = load();
    emit();
  };

  return {
    subscribe: (listener) => {
      if (listeners.size === 0) window.addEventListener("storage", handleStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", handleStorage);
      };
    },

    snapshot: () => {
      cache ??= load();
      return cache;
    },

    set: (value) => {
      cache = value;
      save(value);
      emit();
    },

    reset: () => {
      remove();
      cache = null;
      emit();
    },
  };
};
