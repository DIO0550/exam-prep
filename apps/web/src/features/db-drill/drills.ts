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
import type { DbDrill, DbTopic } from "./types";

/** 一覧に並べる分野の順。午後 問6 で問われる順（設計 → 問合せ → 更新 → 結果の読取り）。 */
export const DB_TOPICS: DbTopic[] = [
  "表の設計",
  "SELECT と結合",
  "集約と副問合せ",
  "更新と制約",
  "実行結果",
];

/**
 * SQL・表の穴埋めドリル。応用情報 午後 問6（データベース）の空欄補充に慣れるため、
 * 本サイトで書き下ろしたもの（IPA の過去問題ではない）。
 */
export const DB_DRILLS: DbDrill[] = [
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
];
