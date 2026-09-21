"use client";

import { useSyncExternalStore } from "react";

import { weakStore } from "../weak/store";
import type { WeakRecord } from "../weak/weak";

/** 保存された「あやふや」を読む。別タブでの更新にも追従する。 */
export const useWeak = (): WeakRecord =>
  useSyncExternalStore(weakStore.subscribe, weakStore.snapshot, weakStore.serverSnapshot);
