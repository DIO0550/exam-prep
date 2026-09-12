import type { Question } from "../types";
import { AP_R03_HARU_AM } from "./ap-r03-haru-am";

/**
 * 収録している問題。
 *
 * 問題文・選択肢・図・正解は IPA の著作物で、MIT License の対象外。
 * 条件は docs/ipa-kakomon-usage-notes.md と public/questions/LICENSE.md を参照。
 */
export const QUESTIONS: [Question, ...Question[]] = AP_R03_HARU_AM;

/** 画面に出す収録範囲。網羅していると誤解させないため、範囲を明示する（docs 5）。 */
export const COVERAGE = "応用情報技術者試験 令和3年度 春期 午前 全80問";
