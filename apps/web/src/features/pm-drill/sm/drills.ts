import type { PmDrill, SmTopic } from "../types";
import { SM_DRILL_01 } from "./data/sm-drill-01";
import { SM_DRILL_02 } from "./data/sm-drill-02";
import { SM_DRILL_03 } from "./data/sm-drill-03";
import { SM_DRILL_04 } from "./data/sm-drill-04";
import { SM_DRILL_05 } from "./data/sm-drill-05";
import { SM_DRILL_06 } from "./data/sm-drill-06";
import { SM_DRILL_07 } from "./data/sm-drill-07";
import { SM_DRILL_08 } from "./data/sm-drill-08";

export const SM_TOPICS: SmTopic[] = [
  "サービスレベル管理",
  "インシデント管理と問題管理",
  "変更管理とリリース",
  "キャパシティと可用性",
  "サービスデスクと財務",
];

const ALL_DRILLS: PmDrill<SmTopic>[] = [
  SM_DRILL_01,
  SM_DRILL_02,
  SM_DRILL_03,
  SM_DRILL_04,
  SM_DRILL_05,
  SM_DRILL_06,
  SM_DRILL_07,
  SM_DRILL_08,
];

export const SM_DRILLS: PmDrill<SmTopic>[] = SM_TOPICS.flatMap((topic) =>
  ALL_DRILLS.filter((drill) => drill.topic === topic),
);
