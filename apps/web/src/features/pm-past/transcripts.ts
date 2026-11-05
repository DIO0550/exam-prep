import { AP_R07_AKI_PM_01 } from "./data/ap-r07-aki-pm-01";
import type { PmTranscript } from "./types";

/** 書き起こした問題。キーは問題 ID（一覧の記録と同じ）。ここに無い問は PDF で解く。 */
export const PM_TRANSCRIPTS: Readonly<Record<string, PmTranscript>> = Object.fromEntries(
  [AP_R07_AKI_PM_01].map((transcript) => [transcript.id, transcript]),
);
