import type { NwDrill } from "../types";

/** DHCP と DNS：別の VLAN にある DHCP サーバと、DHCP リレーエージェント（giaddr）。 */
export const NW_DRILL_11: NwDrill = {
  id: "nw-drill-11",
  topic: "DHCP と DNS",
  title: "別の VLAN の DHCP サーバにリレーする",
  body: [
    {
      kind: "p",
      text: "K 社では，DHCP サーバ（192.168.100.10）をサーバ用の VLAN 100 に 1 台だけ置き，VLAN 10 と VLAN 20 の PC にアドレスを配る（図 1）。L3SW の各 VLAN のインタフェースのアドレスを表 1 に示す。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　K 社の LAN の構成",
        nodes: [
          {
            id: "dhcp",
            label: "DHCP サーバ",
            col: 1.5,
            row: 0,
            note: "192.168.100.10",
            notePlace: "right",
          },
          { id: "l3", label: "L3SW", col: 1.5, row: 1.3 },
          {
            id: "pc10",
            label: "VLAN 10 の PC",
            col: 0.4,
            row: 2.6,
            note: "192.168.10.0/24",
          },
          {
            id: "pc20",
            label: "VLAN 20 の PC",
            col: 2.6,
            row: 2.6,
            note: "192.168.20.0/24",
          },
        ],
        edges: [
          { from: "dhcp", to: "l3", arrow: "none", label: "VLAN 100" },
          { from: "l3", to: "pc10", arrow: "none" },
          { from: "l3", to: "pc20", arrow: "none" },
        ],
      },
    },
    {
      kind: "table",
      caption: "表 1　L3SW のインタフェース",
      headers: ["VLAN", "IP アドレス"],
      rows: [
        ["10", "192.168.10.254/24"],
        ["20", "192.168.20.254/24"],
        ["100", "192.168.100.254/24"],
      ],
    },
    {
      kind: "p",
      text: "PC が最初に送る DHCPDISCOVER は {{a}} なので，L3SW を越えて VLAN 100 へは転送されない。",
    },
    {
      kind: "p",
      text: "そこで L3SW に {{b}} を設定する。L3SW は，VLAN 10 や VLAN 20 で受け取った DHCP のメッセージを，DHCP サーバ宛てのユニキャストにして転送する。",
    },
    {
      kind: "p",
      text: "転送するとき L3SW は，メッセージを受け取ったインタフェースの IP アドレスを，メッセージの giaddr という欄に入れる。VLAN 10 の PC からの要求なら，giaddr は {{c}} になる。",
    },
    {
      kind: "p",
      text: "VLAN 20 の PC からの要求では giaddr が 192.168.20.254 になり，DHCP サーバは表 2 の {{d}} から貸し出すアドレスを選ぶ。",
    },
    {
      kind: "table",
      caption: "表 2　DHCP サーバのスコープ",
      headers: ["スコープ", "貸し出す範囲", "配るデフォルトゲートウェイ"],
      rows: [
        ["VLAN 10 用", "192.168.10.1〜192.168.10.200", "192.168.10.254"],
        ["VLAN 20 用", "192.168.20.1〜192.168.20.200", "{{e}}"],
      ],
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: [
        { key: "ア", text: "ブロードキャスト" },
        { key: "イ", text: "ユニキャスト" },
        { key: "ウ", text: "TCP の通信" },
        { key: "エ", text: "暗号化された通信" },
      ],
      answer: "ア",
      explain:
        "ブロードキャストは同じ VLAN（ブロードキャストドメイン）の中にしか届かず、ルータや L3SW は転送しない。",
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        { key: "ア", text: "DHCP リレーエージェント" },
        { key: "イ", text: "NAPT" },
        { key: "ウ", text: "プロキシ ARP" },
        { key: "エ", text: "VRRP" },
      ],
      answer: "ア",
      explain:
        "DHCP リレーエージェントは、受け取った DHCP のブロードキャストを、設定した DHCP サーバ宛てのユニキャストにして中継する。サーバの返事も PC へ取り次ぐ。",
    },
    {
      key: "c",
      hint: "IP アドレス",
      answer: "192.168.10.254",
      explain:
        "VLAN 10 の PC の要求は、L3SW の VLAN 10 のインタフェースで受け取る。そのアドレス 192.168.10.254 が giaddr に入る。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "VLAN 10 用のスコープ" },
        { key: "イ", text: "VLAN 20 用のスコープ" },
        { key: "ウ", text: "サーバ自身のサブネットのスコープ" },
        { key: "エ", text: "全てのスコープから順番に" },
      ],
      answer: "イ",
      explain:
        "giaddr が 192.168.20.254 なら、要求は 192.168.20.0/24 から来たと分かる。そのサブネットのスコープ（VLAN 20 用）から貸し出す。",
    },
    {
      key: "e",
      hint: "IP アドレス",
      answer: "192.168.20.254",
      explain:
        "VLAN 20 の PC が他のサブネットへ送るときの出口は、L3SW の VLAN 20 のインタフェース 192.168.20.254。",
    },
  ],
  points: [
    "ブロードキャストはルータ・L3SW を越えない。DHCP サーバを別の VLAN に置くなら、DHCP リレーエージェントが要る。",
    "リレーエージェントは受信したインタフェースのアドレスを giaddr に入れてユニキャストで転送する。サーバは giaddr でどのサブネットのスコープかを決める。",
    "配るデフォルトゲートウェイは、その VLAN の L3SW のインタフェースのアドレス。",
  ],
};
