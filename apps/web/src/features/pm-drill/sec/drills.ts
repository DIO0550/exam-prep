import type { PmDrill, SecTopic } from "../types";
import { SEC_DRILL_01 } from "./data/sec-drill-01";
import { SEC_DRILL_02 } from "./data/sec-drill-02";
import { SEC_DRILL_03 } from "./data/sec-drill-03";
import { SEC_DRILL_04 } from "./data/sec-drill-04";
import { SEC_DRILL_05 } from "./data/sec-drill-05";
import { SEC_DRILL_06 } from "./data/sec-drill-06";
import { SEC_DRILL_07 } from "./data/sec-drill-07";
import { SEC_DRILL_08 } from "./data/sec-drill-08";
import { SEC_DRILL_09 } from "./data/sec-drill-09";
import { SEC_DRILL_10 } from "./data/sec-drill-10";
import { SEC_DRILL_11 } from "./data/sec-drill-11";
import { SEC_DRILL_12 } from "./data/sec-drill-12";
import { SEC_DRILL_13 } from "./data/sec-drill-13";
import { SEC_DRILL_14 } from "./data/sec-drill-14";
import { SEC_DRILL_15 } from "./data/sec-drill-15";
import { SEC_DRILL_16 } from "./data/sec-drill-16";
import { SEC_DRILL_17 } from "./data/sec-drill-17";

/**
 * 一覧に並べる分野の順。午後 問1 で繰り返し出る順（認証 → Web アプリ → 暗号 → メールと DNS →
 * マルウェアとインシデント対応 → ネットワークの防御）の後に、管理策とゼロトラストを置く。
 */
export const SEC_TOPICS: SecTopic[] = [
  "認証とパスワード",
  "Web アプリケーションの脆弱性",
  "暗号と PKI",
  "メールと DNS の安全",
  "マルウェアとインシデント対応",
  "ネットワークの防御とログ",
  "管理策とリスク",
  "ゼロトラストとクラウド",
];

/** 書いた順の全問。ID の番号は書いた順で、一覧の並びとは関係しない。 */
const ALL_DRILLS: PmDrill<SecTopic>[] = [
  SEC_DRILL_01,
  SEC_DRILL_02,
  SEC_DRILL_03,
  SEC_DRILL_04,
  SEC_DRILL_05,
  SEC_DRILL_06,
  SEC_DRILL_07,
  SEC_DRILL_08,
  SEC_DRILL_09,
  SEC_DRILL_10,
  SEC_DRILL_11,
  SEC_DRILL_12,
  SEC_DRILL_13,
  SEC_DRILL_14,
  SEC_DRILL_15,
  SEC_DRILL_16,
  SEC_DRILL_17,
];

/** 情報セキュリティの穴埋めドリル。分野の順に並べる。 */
export const SEC_DRILLS: PmDrill<SecTopic>[] = SEC_TOPICS.flatMap((topic) =>
  ALL_DRILLS.filter((drill) => drill.topic === topic),
);
