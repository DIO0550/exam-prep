import type { AuditTopic, PmDrill } from "../types";
import { AUDIT_DRILL_01 } from "./data/audit-drill-01";
import { AUDIT_DRILL_02 } from "./data/audit-drill-02";
import { AUDIT_DRILL_03 } from "./data/audit-drill-03";
import { AUDIT_DRILL_04 } from "./data/audit-drill-04";
import { AUDIT_DRILL_05 } from "./data/audit-drill-05";
import { AUDIT_DRILL_06 } from "./data/audit-drill-06";
import { AUDIT_DRILL_07 } from "./data/audit-drill-07";
import { AUDIT_DRILL_08 } from "./data/audit-drill-08";

export const AUDIT_TOPICS: AuditTopic[] = [
  "監査の進め方",
  "監査手続と監査証拠",
  "アクセス管理と職務の分離",
  "入力・処理・インタフェースの統制",
  "運用・委託・継続性",
];

const ALL_DRILLS: PmDrill<AuditTopic>[] = [
  AUDIT_DRILL_01,
  AUDIT_DRILL_02,
  AUDIT_DRILL_03,
  AUDIT_DRILL_04,
  AUDIT_DRILL_05,
  AUDIT_DRILL_06,
  AUDIT_DRILL_07,
  AUDIT_DRILL_08,
];

export const AUDIT_DRILLS: PmDrill<AuditTopic>[] = AUDIT_TOPICS.flatMap((topic) =>
  ALL_DRILLS.filter((drill) => drill.topic === topic),
);
