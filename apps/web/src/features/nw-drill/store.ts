"use client";

import { createFillDrillStore } from "@/features/fill-drill/store";

export const NW_DRILL_KEY = "exam-prep:nw-drill:v1";

/** ネットワークの穴埋めドリルの記録（書いた答えと、最後の答え合わせの結果）。 */
export const nwDrillStore = createFillDrillStore(NW_DRILL_KEY);
