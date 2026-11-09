import type { NwDrill } from "../types";

const ROLES = [
  { key: "ア", text: "サプリカント" },
  { key: "イ", text: "オーセンティケータ" },
  { key: "ウ", text: "認証サーバ" },
  { key: "エ", text: "リゾルバ" },
];

/** 無線 LAN と VPN：IEEE 802.1X の 3 つの役と、EAP の方式。 */
export const NW_DRILL_25: NwDrill = {
  id: "nw-drill-25",
  topic: "無線 LAN と VPN",
  title: "IEEE 802.1X で無線 LAN の端末を認証する",
  body: [
    {
      kind: "p",
      text: "Z 社は，社員の端末だけが社内の無線 LAN を使えるよう，IEEE 802.1X で端末を認証する（図 1）。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　802.1X による認証の構成",
        nodes: [
          { id: "pc", label: "社員の端末", col: 0, row: 0 },
          { id: "ap", label: "AP", col: 1.7, row: 0 },
          { id: "auth", label: "認証サーバ", col: 3.4, row: 0 },
        ],
        edges: [
          { from: "pc", to: "ap", arrow: "both", dashed: true, label: "無線" },
          { from: "ap", to: "auth", arrow: "both", label: "有線 LAN" },
        ],
      },
    },
    {
      kind: "p",
      text: "端末で 802.1X の認証を行うソフトウェアを {{a}} といい，端末と認証サーバの間を取り次ぐ AP を {{b}} という。",
    },
    {
      kind: "p",
      text: "AP と認証サーバの間は，{{c}} プロトコルでやり取りする。",
    },
    {
      kind: "p",
      text: "認証が成功するまで，AP は端末からの認証用の {{d}} のフレームしか通さない。",
    },
    {
      kind: "p",
      text: "社員ごとにクライアント証明書を配り，証明書で端末を認証する EAP の方式は {{e}} である。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: ROLES,
      answer: "ア",
      explain: "認証を受ける側（端末のソフトウェア）がサプリカント。",
    },
    {
      key: "b",
      hint: "記号",
      choices: ROLES,
      answer: "イ",
      explain:
        "AP（有線なら L2SW）がオーセンティケータ。自分では判断せず、端末と認証サーバのやり取りを取り次ぎ、結果に従ってポートを開け閉めする。",
    },
    {
      key: "c",
      hint: "プロトコル名",
      answer: "RADIUS",
      explain:
        "オーセンティケータと認証サーバの間は RADIUS。端末の EAP のメッセージを RADIUS に入れて運ぶ。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "EAP（EAPOL）" },
        { key: "イ", text: "DHCP" },
        { key: "ウ", text: "HTTP" },
        { key: "エ", text: "ARP" },
      ],
      answer: "ア",
      explain:
        "認証前の端末から通すのは、LAN の上で EAP を運ぶ EAPOL だけ。DHCP でアドレスを取ることもできない。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "EAP-TLS" },
        { key: "イ", text: "PEAP" },
        { key: "ウ", text: "EAP-TTLS" },
        { key: "エ", text: "EAP-MD5" },
      ],
      answer: "ア",
      explain:
        "EAP-TLS は、サーバ証明書とクライアント証明書で互いを認証する。PEAP と EAP-TTLS はサーバ証明書で暗号化した中で ID とパスワードを確かめる。EAP-MD5 はサーバを認証しない。",
    },
  ],
  points: [
    "802.1X の 3 役：サプリカント（端末）・オーセンティケータ（AP や L2SW）・認証サーバ（RADIUS）。",
    "EAP-TLS は双方が証明書（クライアント証明書が要る）。PEAP・EAP-TTLS はサーバ証明書＋ID とパスワード。",
    "認証が済むまでは EAPOL しか通らない。有線の L2SW のポートでも同じ仕組みが使える。",
  ],
};
