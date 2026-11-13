import type { AuditTopic, PmDrill } from "../types";

export const AUDIT_TOPICS: AuditTopic[] = [
  "監査の進め方",
  "監査手続と監査証拠",
  "アクセス管理と職務の分離",
  "入力・処理・インタフェースの統制",
  "運用・委託・継続性",
];

const ALL_DRILLS: PmDrill<AuditTopic>[] = [];

export const AUDIT_DRILLS: PmDrill<AuditTopic>[] = AUDIT_TOPICS.flatMap((topic) =>
  ALL_DRILLS.filter((drill) => drill.topic === topic),
);
