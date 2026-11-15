"use client";

import type { FillDrillStore } from "@/features/fill-drill/store";
import { createFillDrillStore } from "@/features/fill-drill/store";

import type { PmDrillBookId } from "./types";

/** ドリルごとの記録のキー。SQL・表、ネットワークのドリルとも別のキーに置く。 */
export const PM_DRILL_KEYS: Record<PmDrillBookId, string> = {
  sec: "exam-prep:sec-drill:v1",
  arch: "exam-prep:arch-drill:v1",
  sm: "exam-prep:sm-drill:v1",
  audit: "exam-prep:audit-drill:v1",
};

/** 情報セキュリティ・アーキテクチャ・サービスマネジメント・監査の穴埋めドリルの記録。 */
export const pmDrillStores: Record<PmDrillBookId, FillDrillStore> = {
  sec: createFillDrillStore(PM_DRILL_KEYS.sec),
  arch: createFillDrillStore(PM_DRILL_KEYS.arch),
  sm: createFillDrillStore(PM_DRILL_KEYS.sm),
  audit: createFillDrillStore(PM_DRILL_KEYS.audit),
};
