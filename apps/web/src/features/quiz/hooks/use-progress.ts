"use client";

import { useSyncExternalStore } from "react";

import type { ProgressRecord } from "../progress/record";
import { progressStore } from "../progress/store";

/**
 * 保存された学習記録を読む。
 *
 * 記録を書き換えた瞬間だけでなく、別タブでの更新や「記録を消す」にも追従する。
 * static export した HTML には誰の記録も入らないので、hydration までは空の記録で描く。
 */
export const useProgress = (): ProgressRecord =>
  useSyncExternalStore(
    progressStore.subscribe,
    progressStore.snapshot,
    progressStore.serverSnapshot,
  );
