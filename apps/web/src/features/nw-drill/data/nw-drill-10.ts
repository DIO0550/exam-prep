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
    },
    {
      key: "b",
      hint: "記号",
      choices: DHCP_MESSAGES,
      answer: "イ",
      explain:
        "申込みは DHCPREQUEST。これもブロードキャストで送る。複数の DHCP サーバが OFFER を返していても、どのサーバの申し出を選んだかを全てのサーバに知らせるため。",
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
    },
    {
      key: "d",
      hint: "数値",
      answer: "67",
      explain: "DHCP はサーバが UDP の 67 番、クライアントが 68 番。",
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
    },
  ],
  points: [
    "DHCP の順序：DISCOVER（探す）→ OFFER（申し出）→ REQUEST（申込み）→ ACK（確定）。",
    "UDP で、サーバ 67 番・クライアント 68 番。PC が送る最初の 2 通はブロードキャスト。",
    "配る情報：IP アドレス、サブネットマスク、デフォルトゲートウェイ、DNS サーバなど。リース期間付き。",
  ],
};
