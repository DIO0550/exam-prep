import type { ArchTopic, PmDrill } from "../types";

export const ARCH_TOPICS: ArchTopic[] = [
  "稼働率と信頼性",
  "性能と容量の見積り",
  "クラウドと仮想化",
  "Web システムと IoT の方式",
];

const ALL_DRILLS: PmDrill<ArchTopic>[] = [];

export const ARCH_DRILLS: PmDrill<ArchTopic>[] = ARCH_TOPICS.flatMap((topic) =>
  ALL_DRILLS.filter((drill) => drill.topic === topic),
);
