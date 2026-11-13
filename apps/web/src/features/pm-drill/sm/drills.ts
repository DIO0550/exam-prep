import type { PmDrill, SmTopic } from "../types";

export const SM_TOPICS: SmTopic[] = [
  "サービスレベル管理",
  "インシデント管理と問題管理",
  "変更管理とリリース",
  "キャパシティと可用性",
  "サービスデスクと財務",
];

const ALL_DRILLS: PmDrill<SmTopic>[] = [];

export const SM_DRILLS: PmDrill<SmTopic>[] = SM_TOPICS.flatMap((topic) =>
  ALL_DRILLS.filter((drill) => drill.topic === topic),
);
