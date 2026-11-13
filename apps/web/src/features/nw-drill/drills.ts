import { NW_DRILL_01 } from "./data/nw-drill-01";
import { NW_DRILL_02 } from "./data/nw-drill-02";
import { NW_DRILL_03 } from "./data/nw-drill-03";
import { NW_DRILL_04 } from "./data/nw-drill-04";
import { NW_DRILL_05 } from "./data/nw-drill-05";
import { NW_DRILL_06 } from "./data/nw-drill-06";
import { NW_DRILL_07 } from "./data/nw-drill-07";
import { NW_DRILL_08 } from "./data/nw-drill-08";
import { NW_DRILL_09 } from "./data/nw-drill-09";
import { NW_DRILL_10 } from "./data/nw-drill-10";
import { NW_DRILL_11 } from "./data/nw-drill-11";
import { NW_DRILL_12 } from "./data/nw-drill-12";
import { NW_DRILL_13 } from "./data/nw-drill-13";
import { NW_DRILL_14 } from "./data/nw-drill-14";
import { NW_DRILL_15 } from "./data/nw-drill-15";
import { NW_DRILL_16 } from "./data/nw-drill-16";
import { NW_DRILL_17 } from "./data/nw-drill-17";
import { NW_DRILL_18 } from "./data/nw-drill-18";
import { NW_DRILL_19 } from "./data/nw-drill-19";
import { NW_DRILL_20 } from "./data/nw-drill-20";
import { NW_DRILL_21 } from "./data/nw-drill-21";
import { NW_DRILL_22 } from "./data/nw-drill-22";
import { NW_DRILL_23 } from "./data/nw-drill-23";
import { NW_DRILL_24 } from "./data/nw-drill-24";
import { NW_DRILL_25 } from "./data/nw-drill-25";
import { NW_DRILL_26 } from "./data/nw-drill-26";
import { NW_DRILL_27 } from "./data/nw-drill-27";
import { NW_DRILL_28 } from "./data/nw-drill-28";
import { NW_DRILL_29 } from "./data/nw-drill-29";
import { NW_DRILL_30 } from "./data/nw-drill-30";
import { NW_DRILL_31 } from "./data/nw-drill-31";
import { NW_DRILL_32 } from "./data/nw-drill-32";
import { NW_DRILL_33 } from "./data/nw-drill-33";
import { NW_DRILL_34 } from "./data/nw-drill-34";
import { NW_DRILL_35 } from "./data/nw-drill-35";
import { NW_DRILL_36 } from "./data/nw-drill-36";
import { NW_DRILL_37 } from "./data/nw-drill-37";
import { NW_DRILL_38 } from "./data/nw-drill-38";
import { NW_DRILL_39 } from "./data/nw-drill-39";
import { NW_DRILL_40 } from "./data/nw-drill-40";
import { NW_DRILL_41 } from "./data/nw-drill-41";
import { NW_DRILL_42 } from "./data/nw-drill-42";
import type { NwDrill, NwTopic } from "./types";

/**
 * 一覧に並べる分野の順。午後 問5 の事例でよく見る順（構成と経路 → アドレス設計 → LAN →
 * DHCP・DNS → FW → 冗長化）の後に、TCP/IP、無線 LAN と VPN、伝送時間の計算、IPv6 などを置き、
 * 最後に障害の切り分けと監視（ARP・SNMP・QoS）を置く。
 */
export const NW_TOPICS: NwTopic[] = [
  "構成と経路制御",
  "IP アドレスとサブネット",
  "LAN と VLAN",
  "DHCP と DNS",
  "NAT とファイアウォール",
  "冗長化と負荷分散",
  "TCP/IP とアプリケーション",
  "無線 LAN と VPN",
  "伝送時間と性能",
  "IPv6 と新しい技術",
  "運用管理と障害対応",
];

/** 書いた順の全問。ID の番号は書いた順で、一覧の並びとは関係しない。 */
const ALL_DRILLS: NwDrill[] = [
  NW_DRILL_01,
  NW_DRILL_02,
  NW_DRILL_03,
  NW_DRILL_04,
  NW_DRILL_05,
  NW_DRILL_06,
  NW_DRILL_07,
  NW_DRILL_08,
  NW_DRILL_09,
  NW_DRILL_10,
  NW_DRILL_11,
  NW_DRILL_12,
  NW_DRILL_13,
  NW_DRILL_14,
  NW_DRILL_15,
  NW_DRILL_16,
  NW_DRILL_17,
  NW_DRILL_18,
  NW_DRILL_19,
  NW_DRILL_20,
  NW_DRILL_21,
  NW_DRILL_22,
  NW_DRILL_23,
  NW_DRILL_24,
  NW_DRILL_25,
  NW_DRILL_26,
  NW_DRILL_27,
  NW_DRILL_28,
  NW_DRILL_29,
  NW_DRILL_30,
  NW_DRILL_31,
  NW_DRILL_32,
  NW_DRILL_33,
  NW_DRILL_34,
  NW_DRILL_35,
  NW_DRILL_36,
  NW_DRILL_37,
  NW_DRILL_38,
  NW_DRILL_39,
  NW_DRILL_40,
  NW_DRILL_41,
  NW_DRILL_42,
];

/**
 * ネットワークの穴埋めドリル。応用情報 午後 問5（ネットワーク）の空欄補充に慣れるため、
 * 本サイトで書き下ろしたもの（IPA の過去問題ではない）。過去問の型に限らず、
 * ネットワークの出題範囲を広く扱う。
 *
 * 一覧の分野の順に並べる。画面の「No.」と「次の問題へ」はこの順に従う。
 */
export const NW_DRILLS: NwDrill[] = NW_TOPICS.flatMap((topic) =>
  ALL_DRILLS.filter((drill) => drill.topic === topic),
);
