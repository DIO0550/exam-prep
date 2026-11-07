import { AP_R06_AKI_PM_01 } from "./data/ap-r06-aki-pm-01";
import { AP_R06_AKI_PM_04 } from "./data/ap-r06-aki-pm-04";
import { AP_R07_AKI_PM_01 } from "./data/ap-r07-aki-pm-01";
import { AP_R07_AKI_PM_04 } from "./data/ap-r07-aki-pm-04";
import { AP_R07_AKI_PM_05 } from "./data/ap-r07-aki-pm-05";
import { AP_R07_AKI_PM_06 } from "./data/ap-r07-aki-pm-06";
import { AP_R07_AKI_PM_10 } from "./data/ap-r07-aki-pm-10";
import { AP_R07_AKI_PM_11 } from "./data/ap-r07-aki-pm-11";
import { AP_R07_HARU_PM_01 } from "./data/ap-r07-haru-pm-01";
import { AP_R07_HARU_PM_04 } from "./data/ap-r07-haru-pm-04";
import { AP_R07_HARU_PM_05 } from "./data/ap-r07-haru-pm-05";
import { AP_R07_HARU_PM_06 } from "./data/ap-r07-haru-pm-06";
import { AP_R07_HARU_PM_10 } from "./data/ap-r07-haru-pm-10";
import { AP_R07_HARU_PM_11 } from "./data/ap-r07-haru-pm-11";
import type { PmTranscript } from "./types";

/** 書き起こした問題。キーは問題 ID（一覧の記録と同じ）。ここに無い問は PDF で解く。 */
export const PM_TRANSCRIPTS: Readonly<Record<string, PmTranscript>> = Object.fromEntries(
  [
    AP_R07_AKI_PM_01,
    AP_R07_AKI_PM_04,
    AP_R07_AKI_PM_05,
    AP_R07_AKI_PM_06,
    AP_R07_AKI_PM_10,
    AP_R07_AKI_PM_11,
    AP_R07_HARU_PM_01,
    AP_R07_HARU_PM_04,
    AP_R07_HARU_PM_05,
    AP_R07_HARU_PM_06,
    AP_R07_HARU_PM_10,
    AP_R07_HARU_PM_11,
    AP_R06_AKI_PM_01,
    AP_R06_AKI_PM_04,
  ].map((transcript) => [transcript.id, transcript]),
);
