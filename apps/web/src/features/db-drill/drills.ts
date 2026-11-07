import { DB_DRILL_01 } from "./data/db-drill-01";
import { DB_DRILL_02 } from "./data/db-drill-02";
import { DB_DRILL_03 } from "./data/db-drill-03";
import { DB_DRILL_04 } from "./data/db-drill-04";
import { DB_DRILL_05 } from "./data/db-drill-05";
import { DB_DRILL_06 } from "./data/db-drill-06";
import { DB_DRILL_07 } from "./data/db-drill-07";
import { DB_DRILL_08 } from "./data/db-drill-08";
import { DB_DRILL_09 } from "./data/db-drill-09";
import { DB_DRILL_10 } from "./data/db-drill-10";
import { DB_DRILL_11 } from "./data/db-drill-11";
import { DB_DRILL_12 } from "./data/db-drill-12";
import { DB_DRILL_13 } from "./data/db-drill-13";
import { DB_DRILL_14 } from "./data/db-drill-14";
import { DB_DRILL_15 } from "./data/db-drill-15";
import { DB_DRILL_16 } from "./data/db-drill-16";
import { DB_DRILL_17 } from "./data/db-drill-17";
import { DB_DRILL_18 } from "./data/db-drill-18";
import { DB_DRILL_19 } from "./data/db-drill-19";
import { DB_DRILL_20 } from "./data/db-drill-20";
import { DB_DRILL_21 } from "./data/db-drill-21";
import { DB_DRILL_22 } from "./data/db-drill-22";
import { DB_DRILL_23 } from "./data/db-drill-23";
import { DB_DRILL_24 } from "./data/db-drill-24";
import { DB_DRILL_25 } from "./data/db-drill-25";
import { DB_DRILL_26 } from "./data/db-drill-26";
import { DB_DRILL_27 } from "./data/db-drill-27";
import { DB_DRILL_28 } from "./data/db-drill-28";
import { DB_DRILL_29 } from "./data/db-drill-29";
import { DB_DRILL_30 } from "./data/db-drill-30";
import { DB_DRILL_31 } from "./data/db-drill-31";
import { DB_DRILL_32 } from "./data/db-drill-32";
import { DB_DRILL_33 } from "./data/db-drill-33";
import { DB_DRILL_34 } from "./data/db-drill-34";
import { DB_DRILL_35 } from "./data/db-drill-35";
import { DB_DRILL_36 } from "./data/db-drill-36";
import { DB_DRILL_37 } from "./data/db-drill-37";
import { DB_DRILL_38 } from "./data/db-drill-38";
import { DB_DRILL_39 } from "./data/db-drill-39";
import { DB_DRILL_40 } from "./data/db-drill-40";
import { DB_DRILL_41 } from "./data/db-drill-41";
import { DB_DRILL_42 } from "./data/db-drill-42";
import { DB_DRILL_43 } from "./data/db-drill-43";
import { DB_DRILL_44 } from "./data/db-drill-44";
import { DB_DRILL_45 } from "./data/db-drill-45";
import { DB_DRILL_46 } from "./data/db-drill-46";
import type { DbDrill, DbTopic } from "./types";

/**
 * 一覧に並べる分野の順。午後 問6 で問われる順（設計 → 問合せ → 更新 → 結果の読取り）の後に、
 * 関係代数・トランザクションと障害回復・DB の方式と応用を置く。
 */
export const DB_TOPICS: DbTopic[] = [
  "E-R 図",
  "表の設計",
  "SELECT と結合",
  "集約と副問合せ",
  "更新と制約",
  "実行結果",
  "関係代数",
  "トランザクションと障害回復",
  "DB の方式と応用",
];

/** 書いた順の全問。ID の番号は書いた順で、一覧の並びとは関係しない。 */
const ALL_DRILLS: DbDrill[] = [
  DB_DRILL_01,
  DB_DRILL_02,
  DB_DRILL_03,
  DB_DRILL_04,
  DB_DRILL_05,
  DB_DRILL_06,
  DB_DRILL_07,
  DB_DRILL_08,
  DB_DRILL_09,
  DB_DRILL_10,
  DB_DRILL_11,
  DB_DRILL_12,
  DB_DRILL_13,
  DB_DRILL_14,
  DB_DRILL_15,
  DB_DRILL_16,
  DB_DRILL_17,
  DB_DRILL_18,
  DB_DRILL_19,
  DB_DRILL_20,
  DB_DRILL_21,
  DB_DRILL_22,
  DB_DRILL_23,
  DB_DRILL_24,
  DB_DRILL_25,
  DB_DRILL_26,
  DB_DRILL_27,
  DB_DRILL_28,
  DB_DRILL_29,
  DB_DRILL_30,
  DB_DRILL_31,
  DB_DRILL_32,
  DB_DRILL_33,
  DB_DRILL_34,
  DB_DRILL_35,
  DB_DRILL_36,
  DB_DRILL_37,
  DB_DRILL_38,
  DB_DRILL_39,
  DB_DRILL_40,
  DB_DRILL_41,
  DB_DRILL_42,
  DB_DRILL_43,
  DB_DRILL_44,
  DB_DRILL_45,
  DB_DRILL_46,
];

/**
 * SQL・表の穴埋めドリル。応用情報 午後 問6（データベース）の空欄補充に慣れるため、
 * 本サイトで書き下ろしたもの（IPA の過去問題ではない）。過去問の型に限らず、SQL と
 * データベース設計の基本を広く扱う。
 *
 * 一覧の分野の順に並べる。画面の「No.」と「次の問題へ」はこの順に従う。
 */
export const DB_DRILLS: DbDrill[] = DB_TOPICS.flatMap((topic) =>
  ALL_DRILLS.filter((drill) => drill.topic === topic),
);
