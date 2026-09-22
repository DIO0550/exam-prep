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
import { GAIP_CH1 } from "./gaip-ch1";
import { GAIP_CH2 } from "./gaip-ch2";
import { GAIP_CH3 } from "./gaip-ch3";
import { GAIP_CH4 } from "./gaip-ch4";
import { GCP_CDL_SCENARIO_1 } from "./gcp-cdl-scenario-1";
import { GCP_CDL_SCENARIO_2 } from "./gcp-cdl-scenario-2";
import { GCP_CDL_SCENARIO_3 } from "./gcp-cdl-scenario-3";
import { GCP_CDL_SCENARIO_4 } from "./gcp-cdl-scenario-4";
import { GCP_CDL_SERVICE_1 } from "./gcp-cdl-service-1";
import { GCP_CDL_SERVICE_2 } from "./gcp-cdl-service-2";
import { GCP_CDL_SERVICE_3 } from "./gcp-cdl-service-3";
import { GCP_CDL_SERVICE_4 } from "./gcp-cdl-service-4";

/**
 * 収録している問題集。
 *
 * IPA の回（exam: "AP"）は、問題文・選択肢・図・正解が IPA の著作物で、MIT License の
 * 対象外。条件は docs/ipa-kakomon-usage-notes.md と public/questions/LICENSE.md を参照。
 * Google Cloud 向けの問題集（exam: "CDL"）は本サイトで書き下ろしたもので、こちらは
 * リポジトリの LICENSE（MIT）に含まれる。
 */
export type QuestionSet = {
  /** 出典の ID と同じ形。URL や React のキーに使う。 */
  id: string;
  /** どの試験のものか。EXAMS の code と対応する。左の一覧の選択と連動させる。 */
  exam: string;
  /** 切り替え用の短い表記。 */
  label: string;
  questions: [Question, ...Question[]];
};

/** 試験ごとにまとめ、その中では新しい回・若い番号を上に置く。 */
export const QUESTION_SETS: [QuestionSet, ...QuestionSet[]] = [
  { id: "ap-r07-aki-am", exam: "AP", label: "令和7年 秋期", questions: AP_R07_AKI_AM },
  { id: "ap-r07-haru-am", exam: "AP", label: "令和7年 春期", questions: AP_R07_HARU_AM },
  { id: "ap-r06-aki-am", exam: "AP", label: "令和6年 秋期", questions: AP_R06_AKI_AM },
  { id: "ap-r06-haru-am", exam: "AP", label: "令和6年 春期", questions: AP_R06_HARU_AM },
  { id: "ap-r05-aki-am", exam: "AP", label: "令和5年 秋期", questions: AP_R05_AKI_AM },
  { id: "ap-r05-haru-am", exam: "AP", label: "令和5年 春期", questions: AP_R05_HARU_AM },
  { id: "ap-r04-aki-am", exam: "AP", label: "令和4年 秋期", questions: AP_R04_AKI_AM },
  { id: "ap-r04-haru-am", exam: "AP", label: "令和4年 春期", questions: AP_R04_HARU_AM },
  { id: "ap-r03-aki-am", exam: "AP", label: "令和3年 秋期", questions: AP_R03_AKI_AM },
  { id: "ap-r03-haru-am", exam: "AP", label: "令和3年 春期", questions: AP_R03_HARU_AM },
  { id: "gcp-cdl-scenario-1", exam: "CDL", label: "シナリオ問題1", questions: GCP_CDL_SCENARIO_1 },
  { id: "gcp-cdl-scenario-2", exam: "CDL", label: "シナリオ問題2", questions: GCP_CDL_SCENARIO_2 },
  {
    id: "gcp-cdl-scenario-3",
    exam: "CDL",
    label: "シナリオ問題3",
    questions: GCP_CDL_SCENARIO_3,
  },
  {
    id: "gcp-cdl-scenario-4",
    exam: "CDL",
    label: "シナリオ問題4",
    questions: GCP_CDL_SCENARIO_4,
  },
  {
    id: "gcp-cdl-service-1",
    exam: "CDL",
    label: "サービス確認問題1",
    questions: GCP_CDL_SERVICE_1,
  },
  {
    id: "gcp-cdl-service-2",
    exam: "CDL",
    label: "サービス確認問題2",
    questions: GCP_CDL_SERVICE_2,
  },
  {
    id: "gcp-cdl-service-3",
    exam: "CDL",
    label: "サービス確認問題3",
    questions: GCP_CDL_SERVICE_3,
  },
  {
    id: "gcp-cdl-service-4",
    exam: "CDL",
    label: "サービス確認問題4",
    questions: GCP_CDL_SERVICE_4,
  },
  { id: "gaip-ch1", exam: "GAIP", label: "第1章 AI（人工知能）", questions: GAIP_CH1 },
  { id: "gaip-ch2", exam: "GAIP", label: "第2章 生成AI", questions: GAIP_CH2 },
  { id: "gaip-ch3", exam: "GAIP", label: "第3章 生成AIの動向", questions: GAIP_CH3 },
  { id: "gaip-ch4", exam: "GAIP", label: "第4章 リテラシーと権利", questions: GAIP_CH4 },
];

/** ある試験に属する問題集だけを取り出す。左の一覧と「出題する回」を連動させるのに使う。 */
export const questionSetsOf = (examCode: string): QuestionSet[] =>
  QUESTION_SETS.filter((set) => set.exam === examCode);

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
const CDL_COUNT = questionSetsOf("CDL").reduce((sum, set) => sum + set.questions.length, 0);

export const COVERAGE = [
  `応用情報技術者試験 午前 ${questionSetsOf("AP").length}回分（令和3年度春期〜令和7年度秋期、各80問）`,
  `Google Cloud Digital Leader 対策 ${CDL_COUNT}問（本サイト作成。公式の問題ではありません）`,
].join(" ／ ");
