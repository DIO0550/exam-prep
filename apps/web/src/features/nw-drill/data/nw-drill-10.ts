import type { NwDrill } from "../types";

const DHCP_MESSAGES = [
  { key: "ア", text: "DHCPDISCOVER" },
  { key: "イ", text: "DHCPREQUEST" },
  { key: "ウ", text: "DHCPRELEASE" },
  { key: "エ", text: "DHCPNAK" },
];

/** DHCP と DNS：DHCP の 4 つのメッセージと、配る情報。 */
export const NW_DRILL_10: NwDrill = {
  id: "nw-drill-10",
  topic: "DHCP と DNS",
  title: "DHCP でアドレスを借りる手順",
  body: [
    {
      kind: "p",
      text: "J 社の PC は，起動すると DHCP サーバから IP アドレスなどの設定を借りる。PC と DHCP サーバの間のやり取りを表 1 に示す。",
    },
    {
      kind: "table",
      caption: "表 1　PC と DHCP サーバのやり取り",
      headers: ["順", "送り手 → 受け手", "メッセージ", "内容"],
      rows: [
        ["1", "PC → 全体（ブロードキャスト）", "{{a}}", "DHCP サーバを探す"],
        ["2", "DHCP サーバ → PC", "DHCPOFFER", "貸し出せるアドレスを示す"],
        ["3", "PC → 全体（ブロードキャスト）", "{{b}}", "示されたアドレスを使いたいと申し込む"],
        ["4", "DHCP サーバ → PC", "DHCPACK", "貸出しを確定する"],
      ],
    },
    {
      kind: "p",
      text: "1 の送信元 IP アドレスは 0.0.0.0，宛先 IP アドレスは 255.255.255.255 になる。送信元が 0.0.0.0 なのは，{{c}} からである。",
    },
    {
      kind: "p",
      text: "DHCP はトランスポート層に UDP を使い，サーバ側のポート番号は {{d}}，クライアント側は 68 である。",
    },
    {
      kind: "p",
      text: "DHCP サーバは，IP アドレスのほか，サブネットマスク，デフォルトゲートウェイ，{{e}} なども PC に配る。アドレスは期限（リース期間）付きの貸出しで，PC は期限の半分が過ぎると延長を申し込む。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: DHCP_MESSAGES,
      answer: "ア",
      explain:
        "最初はサーバのアドレスを知らないので、ブロードキャストで DHCPDISCOVER を送り、DHCP サーバを探す。",
      steps: [
        "表 1 の 1 は「DHCP サーバを探す」メッセージで、PC から全体（ブロードキャスト）へ送っている。",
        "起動したばかりの PC は DHCP サーバのアドレスを知らないので、まず全員宛てにサーバを探す。これが DHCPDISCOVER。",
        "順番は DISCOVER（探す）→ OFFER（申し出）→ REQUEST（申込み）→ ACK（確定）。頭文字をつないで「DORA」と覚える。",
      ],
      figure: {
        type: "sequence",
        caption: "DHCP でアドレスを借りる 4 つのやり取り（アドレスは例）",
        actors: ["PC", "DHCP サーバ"],
        steps: [
          { from: "PC", to: "DHCP サーバ", label: "DHCPDISCOVER（全員宛て）：サーバを探す" },
          {
            from: "DHCP サーバ",
            to: "PC",
            label: "DHCPOFFER：192.168.1.50 を貸せます",
            dashed: true,
          },
          { from: "PC", to: "DHCP サーバ", label: "DHCPREQUEST（全員宛て）：それを借ります" },
          {
            from: "DHCP サーバ",
            to: "PC",
            label: "DHCPACK：貸出しを確定",
            dashed: true,
            tone: "ok",
          },
          { over: ["PC"], note: "アドレス・マスク・ゲートウェイ・DNS を設定" },
        ],
      },
    },
    {
      key: "b",
      hint: "記号",
      choices: DHCP_MESSAGES,
      answer: "イ",
      explain:
        "申込みは DHCPREQUEST。これもブロードキャストで送る。複数の DHCP サーバが OFFER を返していても、どのサーバの申し出を選んだかを全てのサーバに知らせるため。",
      steps: [
        "表 1 の 3 は「示されたアドレスを使いたいと申し込む」メッセージで、2 の OFFER への返事に当たる。",
        "申込みは DHCPREQUEST。DHCPRELEASE は使い終わったアドレスを返すとき、DHCPNAK はサーバが申込みを断るときのメッセージ。",
        "REQUEST もブロードキャストで送るのは、OFFER を返した全てのサーバに「どのサーバの申し出を選んだか」を知らせるため。",
      ],
    },
    {
      key: "c",
      hint: "記号",
      choices: [
        { key: "ア", text: "PC にまだ IP アドレスが無い" },
        { key: "イ", text: "DHCP サーバに送信元を隠す" },
        { key: "ウ", text: "PC にデフォルトルートが無い" },
        { key: "エ", text: "ブロードキャストでは送信元を書けない" },
      ],
      answer: "ア",
      explain:
        "アドレスを借りる前なので、自分のアドレスとして書ける値が無い。0.0.0.0 は「まだ無い」ことを表す。サーバは、メッセージの中にある PC の MAC アドレスを手がかりに返事を届ける。",
      steps: [
        "DHCPDISCOVER は、アドレスを借りる前に送る最初のメッセージ。",
        "この時点の PC には、自分のアドレスとして書ける値が無い。0.0.0.0 は「まだ無い」ことを表す決まった値。",
        "サーバは、メッセージの中に入っている PC の MAC アドレスを手がかりに返事を届ける。",
      ],
      figure: {
        type: "table",
        caption: "DHCPDISCOVER の送信元と宛先",
        headers: ["層", "送信元", "宛先"],
        rows: [
          ["IP", "0.0.0.0（まだアドレスが無い）", "255.255.255.255（全員宛て）"],
          ["UDP", "68 番（クライアント）", "67 番（サーバ）"],
          ["イーサネット", "PC の MAC アドレス", "FF-FF-FF-FF-FF-FF（全員宛て）"],
        ],
      },
    },
    {
      key: "d",
      hint: "数値",
      answer: "67",
      explain: "DHCP はサーバが UDP の 67 番、クライアントが 68 番。",
      steps: [
        "DHCP は、サーバ側とクライアント側の両方のポート番号が決まっている。本文にクライアント側が 68 とある。",
        "サーバ側は 67。「サーバ 67・クライアント 68」と組で覚える（空欄 c の表）。",
      ],
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "DNS サーバのアドレス" },
        { key: "イ", text: "PC の MAC アドレス" },
        { key: "ウ", text: "PC の ARP テーブル" },
        { key: "エ", text: "スイッチの MAC アドレステーブル" },
      ],
      answer: "ア",
      explain:
        "DHCP で配るのは、通信に必要な設定一式（IP アドレス、サブネットマスク、デフォルトゲートウェイ、DNS サーバのアドレス、リース期間など）。MAC アドレスは NIC に元から付いている。",
      steps: [
        "DHCP で配るのは、PC が通信を始めるのに必要な設定一式。",
        "IP アドレス、サブネットマスク、デフォルトゲートウェイに加えて、名前解決の問合せ先になる DNS サーバのアドレスも配る。",
        "MAC アドレスは NIC に製造時から付いている値で、配るものではない。ARP テーブルや MAC アドレステーブルは、通信しながら機器が自分で作る表。",
      ],
      figure: {
        type: "table",
        caption: "DHCP で配る主な設定",
        headers: ["設定", "使いみち"],
        rows: [
          ["IP アドレス", "PC 自身のアドレス"],
          ["サブネットマスク", "同じ LAN の範囲を知る"],
          ["デフォルトゲートウェイ", "他の LAN へ送るときの出口"],
          ["DNS サーバのアドレス", "名前解決の問合せ先"],
          ["リース期間", "借りられる期限（半分過ぎたら延長を申し込む）"],
        ],
      },
    },
  ],
  points: [
    "DHCP の順序：DISCOVER（探す）→ OFFER（申し出）→ REQUEST（申込み）→ ACK（確定）。",
    "UDP で、サーバ 67 番・クライアント 68 番。PC が送る最初の 2 通はブロードキャスト。",
    "配る情報：IP アドレス、サブネットマスク、デフォルトゲートウェイ、DNS サーバなど。リース期間付き。",
  ],
};
