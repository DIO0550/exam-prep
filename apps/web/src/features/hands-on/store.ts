import { useSyncExternalStore } from "react";

import { LABS } from "./data/labs";
import { EMPTY_RECORD, readRecord } from "./progress";
import type { HandsOnRecord } from "./types";

export const HANDS_ON_KEY = "exam-prep:hands-on:v1";
type Snapshot = { record: HandsOnRecord; storageFailed: boolean };
const SERVER: Snapshot = { record: EMPTY_RECORD, storageFailed: false };
let cache: Snapshot | null = null;
const listeners = new Set<() => void>();

const load = (): Snapshot => {
  try {
    return {
      record: readRecord(window.localStorage.getItem(HANDS_ON_KEY), LABS),
      storageFailed: false,
    };
  } catch {
    return { record: EMPTY_RECORD, storageFailed: true };
  }
};

const emit = () => {
  for (const listener of listeners) {
    listener();
  }
};

const onStorage = (event: StorageEvent) => {
  if (event.key !== null && event.key !== HANDS_ON_KEY) {
    return;
  }

  cache = load();
  emit();
};

export const handsOnStore = {
  snapshot: (): Snapshot => {
    cache ??= load();
    return cache;
  },
  subscribe: (listener: () => void) => {
    if (listeners.size === 0) {
      window.addEventListener("storage", onStorage);
    }

    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        window.removeEventListener("storage", onStorage);
      }
    };
  },
  set: (record: HandsOnRecord) => {
    cache = { record, storageFailed: false };
    try {
      window.localStorage.setItem(HANDS_ON_KEY, JSON.stringify(record));
    } catch {
      cache = { record, storageFailed: true };
    }

    emit();
  },
  reset: () => {
    cache = null;
    emit();
  },
};

export const useHandsOnRecord = () =>
  useSyncExternalStore(handsOnStore.subscribe, handsOnStore.snapshot, () => SERVER);
