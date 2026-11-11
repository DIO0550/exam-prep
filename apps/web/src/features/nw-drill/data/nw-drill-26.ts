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
      steps: [
        "「元の IP パケット全体を暗号化し，新しい IP ヘッダを付けて送る」がキーワード。",
        "元のパケットをヘッダごと包むのがトンネルモード。プライベートアドレスのパケットも、外側のグローバルアドレスでインターネットを通せる。",
        "トランスポートモードは元の IP ヘッダを残して中身だけを守る方式で、端末どうしの通信に使う。パッシブとアグレッシブは IKE の手順の名前。",
      ],
      figure: {
        type: "diagram",
        caption: "トンネルモードは、元のパケットをヘッダごと暗号化して、新しい IP ヘッダで包む",
        cell: { h: 100 },
        nodes: [
          {
            id: "orig",
            label: "元のパケット（本社 LAN の中）",
            col: 2,
            row: 0,
            fields: ["IP：10.1.0.25 → 10.2.0.30", "データ"],
          },
          {
            id: "tun",
            label: "インターネットを通るパケット",
            col: 2,
            row: 1.3,
            tone: "accent",
            fields: [
              "新しい IP：203.0.113.1 → 198.51.100.1",
              "ESP",
              "元の IP（暗号化）",
              "データ（暗号化）",
            ],
          },
        ],
      },
    },
    {
      key: "b",
      hint: "IP アドレス",
      answer: "198.51.100.1",
      explain:
        "外側のヘッダは VPN 装置どうしの通信なので、宛先は VPN 装置 B のインターネット側のアドレス。送信元は VPN 装置 A の 203.0.113.1。",
      steps: [
        "外側の IP ヘッダは、VPN 装置 A が付けた新しいヘッダ。インターネットを運ばれるのは、VPN 装置どうしの通信。",
        "宛先は相手の VPN 装置 B のインターネット側のアドレス 198.51.100.1。送信元は VPN 装置 A の 203.0.113.1（空欄 a の図）。",
        "インターネットはグローバルアドレスでしか届けられないので、外側にプライベートアドレス（10.x.x.x）は書けない。",
      ],
    },
    {
      key: "c",
      hint: "IP アドレス",
      answer: "10.2.0.30",
      explain:
        "内側は元のパケットそのもので、宛先は支店のサーバ。VPN 装置 B が外側を外して復号し、支店 LAN へ送る。",
      steps: [
        "内側は元のパケットそのもので、暗号化されているだけで中身は書き換えない。",
        "宛先は支店のサーバ 10.2.0.30 のまま（送信元も本社の PC の 10.1.0.25 のまま）。",
        "VPN 装置 B が外側のヘッダを外して復号し、元のパケットを支店 LAN へ送る。",
      ],
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
      steps: [
        "「データの暗号化と改ざんの検知」の両方を行うものを選ぶ。",
        "ESP（Encapsulating Security Payload）は、暗号化と認証（改ざんの検知）の両方を行う。",
        "AH は改ざんの検知だけで暗号化しない。IKE は鍵の取決め（空欄 e）、L2TP はトンネルを作るだけで暗号化はしない。",
      ],
      figure: {
        type: "table",
        caption: "IPsec の部品の役割",
        headers: ["部品", "役割", "暗号化"],
        rows: [
          ["ESP", "暗号化と改ざんの検知", "する"],
          ["AH", "改ざんの検知（送信元の確認）", "しない"],
          ["IKE", "相手の認証と、鍵・暗号方式の取決め（SA を作る）", "−"],
        ],
      },
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
      steps: [
        "ESP で暗号化する前に、VPN 装置どうしで「どの方式・どの鍵で暗号化するか」を決めておく必要がある。",
        "その取決めを安全に行うのが IKE（Internet Key Exchange）。互いを認証してから、鍵と暗号方式（SA）を決める。",
        "ESP は決めた鍵で実際に暗号化する部分。RADIUS は認証サーバとのやり取り、DHCP はアドレスの配布。",
      ],
      figure: {
        type: "sequence",
        caption: "IKE で鍵と方式を取り決めてから、ESP で暗号化して送る",
        actors: ["VPN 装置 A", "VPN 装置 B"],
        steps: [
          { from: "VPN 装置 A", to: "VPN 装置 B", label: "IKE：互いを認証し、鍵と暗号方式を提案" },
          { from: "VPN 装置 B", to: "VPN 装置 A", label: "IKE：合意", dashed: true },
          { divider: "SA ができた" },
          {
            from: "VPN 装置 A",
            to: "VPN 装置 B",
            label: "ESP：暗号化したパケット",
            tone: "accent",
          },
          {
            from: "VPN 装置 B",
            to: "VPN 装置 A",
            label: "ESP：暗号化したパケット",
            tone: "accent",
          },
        ],
      },
    },
  ],
  points: [
    "拠点間 VPN はトンネルモード（元のパケットごと包む）、端末どうしの直接通信はトランスポートモード。",
    "ESP は暗号化＋認証、AH は認証（改ざん検知）だけ。鍵交換は IKE。",
    "外側のヘッダは VPN 装置どうしのグローバルアドレス、内側は元の宛先（プライベートアドレス）。",
  ],
};
