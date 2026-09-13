"use client";

import { useSyncExternalStore } from "react";

import type { NoteRecord } from "../notes/note";
import { noteStore } from "../notes/store";

/**
 * 保存された問題ごとのメモを読む。
 *
 * 学習記録（useProgress）と同じ作り。別タブで書いたメモや「学習記録を消す」にも追従する。
 */
export const useNotes = (): NoteRecord =>
  useSyncExternalStore(noteStore.subscribe, noteStore.snapshot, noteStore.serverSnapshot);
