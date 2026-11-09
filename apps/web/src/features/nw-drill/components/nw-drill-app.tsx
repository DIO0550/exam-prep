"use client";

import type { ReactNode } from "react";

import { FillDrillApp } from "@/features/fill-drill/components/fill-drill-app";

import { NW_DRILLS, NW_TOPICS } from "../drills";
import { nwDrillStore } from "../store";
import { NwBlockView } from "./nw-blocks";

/**
 * 応用情報 午後 問5（ネットワーク）向けの穴埋めドリル。
 * 一覧から 1 問を開くと、左に問題文（構成図・経路表・設定など）・右に解答欄の画面で解ける。
 */
export const NwDrillApp = ({ sidebar }: { sidebar?: ReactNode }) => (
  <FillDrillApp
    sidebar={sidebar}
    drills={NW_DRILLS}
    topics={NW_TOPICS}
    store={nwDrillStore}
    eyebrow="午後 問5 対策"
    title="ネットワークの穴埋めドリル"
    intro={
      <>
        応用情報 午後のネットワークの問で出る、構成図・経路表・ファイアウォールのルール・NAPT
        の変換表・DNS のレコードなどの空欄を埋める練習です。サブネットの計算、VLAN、DHCP・DNS、
        冗長化と負荷分散、TCP/IP、無線 LAN と VPN、伝送時間の計算、IPv6
        まで出題範囲を広く扱います。IP
        アドレス・数値・プロトコル名は自分で書き、用語や仕組みは選んで答えます。
      </>
    }
    renderBlock={(block, marks) => <NwBlockView block={block} marks={marks} />}
  />
);
