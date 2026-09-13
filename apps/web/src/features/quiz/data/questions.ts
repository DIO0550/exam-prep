import type { Question } from "../types";
import { sourceId } from "../types";
import { AP_R03_AKI_AM } from "./ap-r03-aki-am";
import { AP_R03_HARU_AM } from "./ap-r03-haru-am";
import { AP_R04_AKI_AM } from "./ap-r04-aki-am";
import { AP_R04_HARU_AM } from "./ap-r04-haru-am";
import { AP_R05_AKI_AM } from "./ap-r05-aki-am";
import { AP_R05_HARU_AM } from "./ap-r05-haru-am";
import { AP_R06_AKI_AM } from "./ap-r06-aki-am";
import { AP_R06_HARU_AM } from "./ap-r06-haru-am";
import { AP_R07_AKI_AM } from "./ap-r07-aki-am";
import { AP_R07_HARU_AM } from "./ap-r07-haru-am";

/**
 * 収録している回。
 *
 * 問題文・選択肢・図・正解は IPA の著作物で、MIT License の対象外。
 * 条件は docs/ipa-kakomon-usage-notes.md と public/questions/LICENSE.md を参照。
 */
export type QuestionSet = {
  /** 出典の ID と同じ形。URL や React のキーに使う。 */
  id: string;
  /** 切り替え用の短い表記。 */
  label: string;
  questions: [Question, ...Question[]];
};

/** 新しい回を上に置く。 */
export const QUESTION_SETS: [QuestionSet, ...QuestionSet[]] = [
  { id: "ap-r07-aki-am", label: "令和7年 秋期", questions: AP_R07_AKI_AM },
  { id: "ap-r07-haru-am", label: "令和7年 春期", questions: AP_R07_HARU_AM },
  { id: "ap-r06-aki-am", label: "令和6年 秋期", questions: AP_R06_AKI_AM },
  { id: "ap-r06-haru-am", label: "令和6年 春期", questions: AP_R06_HARU_AM },
  { id: "ap-r05-aki-am", label: "令和5年 秋期", questions: AP_R05_AKI_AM },
  { id: "ap-r05-haru-am", label: "令和5年 春期", questions: AP_R05_HARU_AM },
  { id: "ap-r04-aki-am", label: "令和4年 秋期", questions: AP_R04_AKI_AM },
  { id: "ap-r04-haru-am", label: "令和4年 春期", questions: AP_R04_HARU_AM },
  { id: "ap-r03-aki-am", label: "令和3年 秋期", questions: AP_R03_AKI_AM },
  { id: "ap-r03-haru-am", label: "令和3年 春期", questions: AP_R03_HARU_AM },
];

/**
 * 問題 ID から問題を引く。
 *
 * 保存した解答状況は問題 ID しか持たない（回をまたいで 1 つの表に入れている）ので、
 * 分野別の集計をするときにここから分野と正解を引き直す。
 */
export const QUESTION_BY_ID: ReadonlyMap<string, Question> = new Map(
  QUESTION_SETS.flatMap((set) =>
    set.questions.map((question) => [sourceId(question.source), question] as const),
  ),
);

/** 画面に出す収録範囲。網羅していると誤解させないため、範囲を明示する（docs 5）。 */
export const COVERAGE = `応用情報技術者試験 午前 ${QUESTION_SETS.length}回分（令和3年度春期〜令和7年度秋期、各80問）`;
