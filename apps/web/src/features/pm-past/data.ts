import type { Era, IpaSource, Term } from "@/features/quiz/types";
import { formatSource, sourceId } from "@/features/quiz/types";

/**
 * 応用情報技術者試験 午後の過去問題の一覧。
 *
 * 午後は記述式で、1 問が数ページのスキャン画像なので、本文は書き起こさずに IPA の公開 PDF へリンクする。
 * ここに持つのは「どの回のどの問か」と PDF の URL だけで、問題文・解答例はリポジトリに含めない。
 *
 * URL は IPA の過去問題のページ（https://www.ipa.go.jp/shiken/mondai-kaiotu/index.html から
 * 年度ごとのページ）に載っているリンクをそのまま写したもの。途中のディレクトリ名（`…-att`）は
 * 年度ごとに不規則なので、組み立てずに 1 回ずつ持つ。
 */

export type PmExam = {
  /** 問題 ID の前半。例: "ap-r06-aki-pm"。 */
  id: string;
  era: Era;
  year: number;
  term: Term;
  /** 一覧に出す名前。例: "令和6年度 秋期"。 */
  label: string;
  /** IPA の年度ごとのページ。 */
  page: string;
  /** 問題冊子・解答例・採点講評の PDF。 */
  questionPdf: string;
  answerPdf: string;
  commentPdf: string;
};

const IPA = "https://www.ipa.go.jp/shiken/mondai-kaiotu";

/** 年度のページと、PDF の置き場所・ファイル名の前半から 1 回分を作る。 */
const exam = (
  era: Era,
  year: number,
  term: Term,
  page: string,
  dir: string,
  prefix: string,
): PmExam => {
  const base = `${IPA}/${dir}/${prefix}_ap_pm`;
  const termName = { haru: "春期", aki: "秋期", oct: "10月" }[term];
  return {
    id: sourceId({ exam: "AP", era, year, term, section: "pm", no: 1 }).replace(/-01$/, ""),
    era,
    year,
    term,
    label: `${era}${year === 1 ? "元" : year}年度 ${termName}`,
    page: `${IPA}/${page}`,
    questionPdf: `${base}_qs.pdf`,
    answerPdf: `${base}_ans.pdf`,
    commentPdf: `${base}_cmnt.pdf`,
  };
};

/** 新しい回を上に置く。令和2年度は春期の実施が取りやめになり、10月の回だけがある。 */
export const PM_EXAMS: PmExam[] = [
  exam("令和", 7, "aki", "2025r07.html", "nl10bi0000009lh8-att", "2025r07a"),
  exam("令和", 7, "haru", "2025r07.html", "nl10bi0000009lh8-att", "2025r07h"),
  exam("令和", 6, "aki", "2024r06.html", "m42obm000000afqx-att", "2024r06a"),
  exam("令和", 6, "haru", "2024r06.html", "m42obm000000afqx-att", "2024r06h"),
  exam("令和", 5, "aki", "2023r05.html", "ps6vr70000010d6y-att", "2023r05a"),
  exam("令和", 5, "haru", "2023r05.html", "ps6vr70000010d6y-att", "2023r05h"),
  exam("令和", 4, "aki", "2022r04.html", "gmcbt80000008smf-att", "2022r04a"),
  exam("令和", 4, "haru", "2022r04.html", "gmcbt80000009sgk-att", "2022r04h"),
  exam("令和", 3, "aki", "2021r03.html", "gmcbt8000000apad-att", "2021r03a"),
  exam("令和", 3, "haru", "2021r03.html", "gmcbt8000000d5ru-att", "2021r03h"),
  exam("令和", 2, "oct", "2020r02.html", "gmcbt8000000d05l-att", "2020r02o"),
  exam("令和", 1, "aki", "2019h31.html", "gmcbt8000000dict-att", "2019r01a"),
  exam("平成", 31, "haru", "2019h31.html", "gmcbt8000000ddiw-att", "2019h31h"),
];

export type PmProblem = {
  no: number;
  field: string;
  /** 必ず解答する問題か（問1 の情報セキュリティだけ）。 */
  required: boolean;
};

/**
 * 問番号と分野。平成31年度春期以降のどの回も同じ並びで、問1 が必須、問2〜11 から 4 問を選ぶ。
 */
export const PM_PROBLEMS: PmProblem[] = [
  { no: 1, field: "情報セキュリティ", required: true },
  { no: 2, field: "経営戦略", required: false },
  { no: 3, field: "プログラミング", required: false },
  { no: 4, field: "システムアーキテクチャ", required: false },
  { no: 5, field: "ネットワーク", required: false },
  { no: 6, field: "データベース", required: false },
  { no: 7, field: "組込みシステム開発", required: false },
  { no: 8, field: "情報システム開発", required: false },
  { no: 9, field: "プロジェクトマネジメント", required: false },
  { no: 10, field: "ITサービスマネジメント", required: false },
  { no: 11, field: "システム監査", required: false },
];

/** 1 回の 1 問を指す出典。問題 ID と出典表記はここから機械的に作る（docs 2.3）。 */
export const pmSource = (pmExam: PmExam, no: number): IpaSource => ({
  exam: "AP",
  era: pmExam.era,
  year: pmExam.year,
  term: pmExam.term,
  section: "pm",
  no,
});

/** 記録のキーにする問題 ID。例: "ap-r06-aki-pm-05"。 */
export const pmProblemId = (pmExam: PmExam, no: number): string => sourceId(pmSource(pmExam, no));

/** 出典表記。例: "令和6年度 秋期 応用情報技術者試験 午後 問5"。 */
export const pmSourceLabel = (pmExam: PmExam, no: number): string =>
  formatSource(pmSource(pmExam, no));
