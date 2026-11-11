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
      steps: [
        "「端末で 802.1X の認証を行うソフトウェア」、つまり認証を受ける側が入る。",
        "802.1X では、認証を受ける端末側をサプリカントという。",
        "802.1X の 3 つの役は、サプリカント（端末）・オーセンティケータ（AP や L2SW）・認証サーバ（RADIUS サーバ）。",
      ],
      figure: {
        type: "diagram",
        caption: "802.1X の 3 つの役と、区間ごとのプロトコル",
        nodes: [
          { id: "pc", label: "社員の端末", col: 0, row: 0, note: "サプリカント" },
          { id: "ap", label: "AP", col: 2, row: 0, note: "オーセンティケータ" },
          { id: "auth", label: "認証サーバ", col: 4, row: 0, note: "RADIUS サーバ" },
        ],
        edges: [
          { from: "pc", to: "ap", arrow: "both", label: "EAPOL" },
          { from: "ap", to: "auth", arrow: "both", label: "RADIUS" },
        ],
      },
    },
    {
      key: "b",
      hint: "記号",
      choices: ROLES,
      answer: "イ",
      explain:
        "AP（有線なら L2SW）がオーセンティケータ。自分では判断せず、端末と認証サーバのやり取りを取り次ぎ、結果に従ってポートを開け閉めする。",
      steps: [
        "「端末と認証サーバの間を取り次ぐ AP」が入る。",
        "取り次ぎ役をオーセンティケータという。自分では判断せず、認証サーバの結果に従って端末の通信を通すかどうかを決める。",
        "有線 LAN では、L2SW がオーセンティケータになってポートを開け閉めする（空欄 a の図）。",
      ],
    },
    {
      key: "c",
      hint: "プロトコル名",
      answer: "RADIUS",
      explain:
        "オーセンティケータと認証サーバの間は RADIUS。端末の EAP のメッセージを RADIUS に入れて運ぶ。",
      steps: [
        "AP と認証サーバの間で、認証の要求と結果をやり取りするプロトコルが入る。",
        "802.1X では RADIUS を使う。端末から届いた EAP のメッセージを、RADIUS のメッセージに入れて運ぶ。",
        "端末と AP の間は EAPOL（空欄 d）、AP と認証サーバの間は RADIUS と、区間でプロトコルが変わる。",
      ],
      figure: {
        type: "sequence",
        caption: "AP は EAP のメッセージを RADIUS に入れて取り次ぎ、成功したら通信を通す",
        actors: ["端末", "AP", "認証サーバ"],
        steps: [
          { from: "端末", to: "AP", label: "EAPOL：認証を始めたい" },
          { from: "AP", to: "認証サーバ", label: "RADIUS（EAP を入れて運ぶ）" },
          { from: "認証サーバ", to: "AP", label: "RADIUS：証明書などを求める", dashed: true },
          { from: "AP", to: "端末", label: "EAPOL：証明書などを求める", dashed: true },
          { from: "端末", to: "AP", label: "EAPOL：証明書などを渡す" },
          { from: "AP", to: "認証サーバ", label: "RADIUS（EAP を入れて運ぶ）" },
          { from: "認証サーバ", to: "AP", label: "RADIUS：認証成功", dashed: true, tone: "ok" },
          { over: ["AP"], note: "ここから端末の通常の通信を通す", tone: "ok" },
        ],
      },
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
      steps: [
        "認証が成功するまでは、端末に社内の LAN を使わせたくない。",
        "そこで AP は、認証のやり取りに要るフレームだけを通す。LAN の上で EAP を運ぶ形式が EAPOL（EAP over LAN）。",
        "DHCP も通さないので、認証前の端末は IP アドレスも取れない。HTTP や ARP も通らない。",
      ],
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
      steps: [
        "「クライアント証明書で端末を認証する」がキーワード。",
        "EAP-TLS は、サーバ証明書とクライアント証明書で互いを認証する。社員ごとにクライアント証明書を配るのはこのため。",
        "PEAP と EAP-TTLS は、サーバ証明書で作った暗号化の中で ID とパスワードを確かめる方式。EAP-MD5 はサーバを認証しない。",
      ],
      figure: {
        type: "table",
        caption: "EAP の方式と、何で認証するか",
        headers: ["方式", "サーバの認証", "端末（利用者）の認証"],
        rows: [
          ["EAP-TLS", "サーバ証明書", "クライアント証明書"],
          ["PEAP", "サーバ証明書", "ID とパスワード"],
          ["EAP-TTLS", "サーバ証明書", "ID とパスワード"],
          ["EAP-MD5", "しない", "ID とパスワード"],
        ],
      },
    },
  ],
  points: [
    "802.1X の 3 役：サプリカント（端末）・オーセンティケータ（AP や L2SW）・認証サーバ（RADIUS）。",
    "EAP-TLS は双方が証明書（クライアント証明書が要る）。PEAP・EAP-TTLS はサーバ証明書＋ID とパスワード。",
    "認証が済むまでは EAPOL しか通らない。有線の L2SW のポートでも同じ仕組みが使える。",
  ],
};
