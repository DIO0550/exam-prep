import type { ArchTopic, PmDrill } from "../types";
import { ARCH_DRILL_01 } from "./data/arch-drill-01";
import { ARCH_DRILL_02 } from "./data/arch-drill-02";
import { ARCH_DRILL_03 } from "./data/arch-drill-03";
import { ARCH_DRILL_04 } from "./data/arch-drill-04";
import { ARCH_DRILL_05 } from "./data/arch-drill-05";
import { ARCH_DRILL_06 } from "./data/arch-drill-06";
import { ARCH_DRILL_07 } from "./data/arch-drill-07";
import { ARCH_DRILL_08 } from "./data/arch-drill-08";

export const ARCH_TOPICS: ArchTopic[] = [
  "稼働率と信頼性",
  "性能と容量の見積り",
  "クラウドと仮想化",
  "Web システムと IoT の方式",
];

const ALL_DRILLS: PmDrill<ArchTopic>[] = [
  ARCH_DRILL_01,
  ARCH_DRILL_02,
  ARCH_DRILL_03,
  ARCH_DRILL_04,
  ARCH_DRILL_05,
  ARCH_DRILL_06,
  ARCH_DRILL_07,
  ARCH_DRILL_08,
];

export const ARCH_DRILLS: PmDrill<ArchTopic>[] = ARCH_TOPICS.flatMap((topic) =>
  ALL_DRILLS.filter((drill) => drill.topic === topic),
);
