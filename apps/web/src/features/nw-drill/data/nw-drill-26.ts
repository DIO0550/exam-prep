import type { NwDrill } from "../types";

/** 無線 LAN と VPN：IPsec VPN で拠点をつなぐ（トンネルモード・外側と内側のヘッダ・ESP・IKE）。 */
export const NW_DRILL_26: NwDrill = {
  id: "nw-drill-26",
  topic: "無線 LAN と VPN",
  title: "IPsec VPN で本社と支店をつなぐ",
  body: [
    {
      kind: "p",
      text: "AB 社は，本社と支店の LAN を，インターネット経由の IPsec VPN でつなぐ（図 1）。本社の PC（10.1.0.25）から支店のサーバ（10.2.0.30）へのパケットは，VPN 装置 A で暗号化され，インターネットを通って VPN 装置 B で元に戻される。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　AB 社の拠点間の接続",
        cell: { w: 125 },
        nodes: [
          { id: "lanH", label: "本社 LAN", col: 0, row: 0, note: "10.1.0.0/16" },
          { id: "vpnA", label: "VPN 装置 A", col: 1.5, row: 0, note: "203.0.113.1" },
          { id: "inet", label: "インターネット", col: 3, row: 0, shape: "cloud" },
          { id: "vpnB", label: "VPN 装置 B", col: 4.5, row: 0, note: "198.51.100.1" },
          { id: "lanB", label: "支店 LAN", col: 6, row: 0, note: "10.2.0.0/16" },
        ],
        edges: [
          { from: "lanH", to: "vpnA", arrow: "none" },
          { from: "vpnA", to: "inet", arrow: "none" },
          { from: "inet", to: "vpnB", arrow: "none" },
          { from: "vpnB", to: "lanB", arrow: "none" },
        ],
      },
    },
    {
      kind: "p",
      text: "拠点の間をつなぐ IPsec では，元の IP パケット全体を暗号化し，新しい IP ヘッダを付けて送る {{a}} モードを使う。",
    },
    {
      kind: "p",
      text: "インターネットを通る間，外側の IP ヘッダの宛先アドレスは {{b}} で，内側（暗号化された元のパケット）の宛先アドレスは {{c}} のままである。",
    },
    {
      kind: "p",
      text: "IPsec で，データの暗号化と改ざんの検知を行うのは {{d}} である。暗号化に使う鍵は，VPN 装置どうしが {{e}} で安全に取り決める。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: [
        { key: "ア", text: "トンネル" },
        { key: "イ", text: "トランスポート" },
        { key: "ウ", text: "パッシブ" },
        { key: "エ", text: "アグレッシブ" },
      ],
      answer: "ア",
      explain:
        "トンネルモードは元のパケットをヘッダごと包むので、プライベートアドレスのパケットもインターネットを通せる。トランスポートモードは元のヘッダを残して中身だけを守り、端末どうしの通信に使う。アグレッシブは IKE の手順の名前。",
    },
    {
      key: "b",
      hint: "IP アドレス",
      answer: "198.51.100.1",
      explain:
        "外側のヘッダは VPN 装置どうしの通信なので、宛先は VPN 装置 B のインターネット側のアドレス。送信元は VPN 装置 A の 203.0.113.1。",
    },
    {
      key: "c",
      hint: "IP アドレス",
      answer: "10.2.0.30",
      explain:
        "内側は元のパケットそのもので、宛先は支店のサーバ。VPN 装置 B が外側を外して復号し、支店 LAN へ送る。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "ESP" },
        { key: "イ", text: "AH" },
        { key: "ウ", text: "IKE" },
        { key: "エ", text: "L2TP" },
      ],
      answer: "ア",
      explain:
        "ESP は暗号化と認証（改ざん検知）を行う。AH は認証だけで暗号化しない。L2TP はトンネルを作るだけで、暗号化は IPsec と組み合わせる。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "IKE" },
        { key: "イ", text: "ESP" },
        { key: "ウ", text: "RADIUS" },
        { key: "エ", text: "DHCP" },
      ],
      answer: "ア",
      explain:
        "IKE（Internet Key Exchange）で互いを認証し、ESP で使う暗号の方式と鍵を取り決める（SA を作る）。",
    },
  ],
  points: [
    "拠点間 VPN はトンネルモード（元のパケットごと包む）、端末どうしの直接通信はトランスポートモード。",
    "ESP は暗号化＋認証、AH は認証（改ざん検知）だけ。鍵交換は IKE。",
    "外側のヘッダは VPN 装置どうしのグローバルアドレス、内側は元の宛先（プライベートアドレス）。",
  ],
};
