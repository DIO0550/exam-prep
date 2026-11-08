import type { NwDrill } from "../types";

/** IPv6 と新しい技術：SDN と OpenFlow、NFV、CDN、LPWA。 */
export const NW_DRILL_30: NwDrill = {
  id: "nw-drill-30",
  topic: "IPv6 と新しい技術",
  title: "SDN・NFV・CDN・LPWA を見分ける",
  body: [
    {
      kind: "p",
      text: "従来のネットワーク機器は，経路などを決める制御の機能と，パケットを送り出す転送の機能を 1 台ずつ持っていた。AF 社では，この 2 つを分け，コントローラから多くのスイッチの転送の仕方をソフトウェアでまとめて設定する {{a}} を取り入れた（図 1）。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　コントローラとスイッチ",
        nodes: [
          { id: "ctrl", label: "コントローラ", col: 1.5, row: 0 },
          { id: "sw1", label: "スイッチ 1", col: 0, row: 1.4 },
          { id: "sw2", label: "スイッチ 2", col: 1.5, row: 1.4 },
          { id: "sw3", label: "スイッチ 3", col: 3, row: 1.4 },
        ],
        edges: [
          { from: "ctrl", to: "sw1", dashed: true },
          { from: "ctrl", to: "sw2", dashed: true },
          { from: "ctrl", to: "sw3", dashed: true },
          { from: "sw1", to: "sw2", arrow: "none" },
          { from: "sw2", to: "sw3", arrow: "none" },
        ],
      },
    },
    {
      kind: "p",
      text: "その代表的なプロトコルである {{b}} では，コントローラが各スイッチへ，どのパケットをどう扱うかの規則（フローエントリ）を配る。",
    },
    {
      kind: "p",
      text: "また，ルータや FW の機能を，専用の機器ではなく汎用サーバ上の仮想マシンのソフトウェアとして動かすことを {{c}} という。",
    },
    {
      kind: "p",
      text: "動画などの大きなコンテンツを，利用者に近い場所に置いたキャッシュサーバから配り，元のサーバと回線の負荷を減らす仕組みを {{d}} という。",
    },
    {
      kind: "p",
      text: "センサなどの IoT 機器向けに，通信速度は低いが，電池で何年も動き，数 km 以上の広い範囲をカバーする無線通信を {{e}} という。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: [
        { key: "ア", text: "SDN" },
        { key: "イ", text: "NFV" },
        { key: "ウ", text: "CDN" },
        { key: "エ", text: "VPN" },
      ],
      answer: "ア",
      explain:
        "SDN（Software-Defined Networking）は制御と転送を分け、コントローラからネットワーク全体をソフトウェアで制御する。",
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        { key: "ア", text: "OpenFlow" },
        { key: "イ", text: "OSPF" },
        { key: "ウ", text: "SNMP" },
        { key: "エ", text: "BGP" },
      ],
      answer: "ア",
      explain:
        "OpenFlow のスイッチは、ヘッダの値の組合せ（宛先・送信元・ポートなど）ごとの処理（転送・破棄・書換え）をフローテーブルで持つ。当てはまる規則が無ければコントローラに問い合わせる。",
    },
    {
      key: "c",
      hint: "記号",
      choices: [
        { key: "ア", text: "NFV" },
        { key: "イ", text: "SDN" },
        { key: "ウ", text: "PoE" },
        { key: "エ", text: "CDN" },
      ],
      answer: "ア",
      explain:
        "NFV（Network Functions Virtualization）は、ネットワークの機能をソフトウェアにして仮想化基盤で動かす。必要に応じて増やしたり移したりしやすい。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "CDN" },
        { key: "イ", text: "DNS" },
        { key: "ウ", text: "SDN" },
        { key: "エ", text: "NAS" },
      ],
      answer: "ア",
      explain:
        "CDN（Content Delivery Network）は、各地に置いたキャッシュサーバ（エッジ）から配信する。利用者を近いサーバへ案内するのに DNS をよく使う。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "LPWA" },
        { key: "イ", text: "Bluetooth" },
        { key: "ウ", text: "NFC" },
        { key: "エ", text: "Wi-Fi 6" },
      ],
      answer: "ア",
      explain:
        "LPWA（Low Power Wide Area）は低消費電力・広域・低速の無線の総称で、LoRaWAN、Sigfox、NB-IoT などがある。Bluetooth と NFC は近距離、Wi-Fi は消費電力が大きい。",
    },
  ],
  points: [
    "SDN：制御と転送を分け、コントローラから一括制御（OpenFlow）。NFV：ネットワークの機能をソフトウェアにして汎用サーバで動かす。",
    "CDN：利用者の近くのキャッシュから配信する。",
    "LPWA：低消費電力・広域・低速（LoRaWAN、Sigfox、NB-IoT など）。",
  ],
};
