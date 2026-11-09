"use client";

import { createFillDrillStore } from "@/features/fill-drill/store";

export const DB_DRILL_KEY = "exam-prep:db-drill:v1";

/** SQL・表の穴埋めドリルの記録（書いた答えと、最後の答え合わせの結果）。 */
export const dbDrillStore = createFillDrillStore(DB_DRILL_KEY);
