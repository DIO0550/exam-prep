import type { FillDrill, TextBlock } from "@/features/fill-drill/types";
import type { DiagramFigure } from "@/features/quiz/types";

/**
 * 応用情報 午後 問5（ネットワーク）向けの穴埋めドリルの形。
 * 段落・表（経路表・FW のルール・変換表など）・等幅の行（設定やコマンドの出力）と空欄の形は
 * 穴埋めドリル共通（fill-drill/types.ts）で、ここではネットワーク構成図を足す。
 *
 * 構成図は解説の図と同じ diagram の形で書き、空欄は置かない（空欄は本文・表・等幅の行に置く）。
 */
export type NwBlock =
  /** ネットワーク構成図。部品を格子に置き、線で結ぶ。囲みで DMZ や拠点を示せる。 */
  { kind: "figure"; figure: DiagramFigure } | TextBlock;

/** ドリルの分野。一覧の絞り込みに使う。 */
export type NwTopic =
  | "構成と経路制御"
  | "IP アドレスとサブネット"
  | "LAN と VLAN"
  | "DHCP と DNS"
  | "NAT とファイアウォール"
  | "冗長化と負荷分散"
  | "TCP/IP とアプリケーション"
  | "無線 LAN と VPN"
  | "伝送時間と性能"
  | "IPv6 と新しい技術";

/** ドリル 1 問。 */
export type NwDrill = FillDrill<NwTopic, NwBlock>;
