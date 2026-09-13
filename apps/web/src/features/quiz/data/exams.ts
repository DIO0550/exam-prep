import type { Exam } from "../types";

/** サイドバーに並べる試験。group の値で見出しにまとめる。1 件目が初期選択。 */
export const EXAMS: [Exam, ...Exam[]] = [
  {
    code: "AP",
    name: "応用情報技術者試験",
    sub: "午前 ・ 全80問形式",
    group: "IPA 情報処理技術者試験",
  },
  {
    code: "SG",
    name: "情報セキュリティマネジメント",
    sub: "科目A ・ 全48問形式",
    group: "IPA 情報処理技術者試験",
  },
  {
    code: "FE",
    name: "基本情報技術者試験",
    sub: "科目A ・ 全60問形式",
    group: "IPA 情報処理技術者試験",
  },
  {
    code: "GCP",
    name: "Google Cloud 認定 ACE",
    sub: "Associate Cloud Engineer",
    group: "クラウド認定",
  },
  { code: "AWS", name: "AWS SAA", sub: "Solutions Architect Associate", group: "クラウド認定" },
  {
    code: "G検",
    name: "G検定（JDLA）",
    sub: "ディープラーニング ジェネラリスト",
    group: "AI・データ",
  },
  { code: "DS", name: "統計検定 2級", sub: "大学基礎統計学レベル", group: "AI・データ" },
];

/** 見出しの並び順。EXAMS の group と対応する。 */
export const EXAM_GROUPS = ["IPA 情報処理技術者試験", "クラウド認定", "AI・データ"];
