import type { NwDrill } from "../types";

/** 構成と経路制御：tracert の結果を読む（TTL と ICMP）。 */
export const NW_DRILL_23: NwDrill = {
  id: "nw-drill-23",
  topic: "構成と経路制御",
  title: "tracert の結果から経路を読む",
  body: [
    {
      kind: "p",
      text: "X 社の PC から，社外のサーバ 198.51.100.7 までの経路を tracert コマンドで調べた結果を図 1 に示す。",
    },
    {
      kind: "code",
      caption: "図 1　tracert の結果",
      lines: [
        "C:\\> tracert 198.51.100.7",
        "",
        "  1    <1 ms    <1 ms    <1 ms  192.168.1.1",
        "  2     3 ms     3 ms     2 ms  203.0.113.1",
        "  3    12 ms    11 ms    12 ms  198.51.100.254",
        "  4    13 ms    12 ms    13 ms  198.51.100.7",
      ],
    },
    {
      kind: "p",
      text: "tracert は，IP ヘッダの {{a}} の値を 1，2，3 … と増やしながらパケットを送る。ルータはパケットを転送するたびにこの値を 1 減らし，0 になったパケットは捨てて，送信元へ ICMP の {{b}} メッセージを返す。tracert は，この返事の送信元を順に並べて表示する。",
    },
    {
      kind: "p",
      text: "図 1 から，PC からサーバまでの間で経由したルータは {{c}} 台である。",
    },
    {
      kind: "p",
      text: "ping は ICMP の {{d}} を送り，エコー応答が返るかどうかで相手に届くかを確かめる。",
    },
    {
      kind: "p",
      text: "経路の設定を誤ってループができていても，{{a}} があるので，パケットが {{e}} ことはない。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "IP ヘッダのフィールド名",
      answer: "TTL",
      accepts: ["TIME TO LIVE"],
      explain:
        "TTL（Time To Live）は、パケットが経由できるルータの数の上限。IPv6 ではホップリミットという。",
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        { key: "ア", text: "時間超過（Time Exceeded）" },
        { key: "イ", text: "エコー応答（Echo Reply）" },
        { key: "ウ", text: "宛先到達不能（Destination Unreachable）" },
        { key: "エ", text: "リダイレクト（Redirect）" },
      ],
      answer: "ア",
      explain:
        "TTL が 0 になって捨てたルータは、ICMP の時間超過を送信元へ返す。TTL＝1 なら 1 台目、TTL＝2 なら 2 台目のルータが返事をするので、途中のルータが 1 台ずつ分かる。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "3",
      explain:
        "1〜3 行目（192.168.1.1、203.0.113.1、198.51.100.254）がルータで、最後の 4 行目は宛先のサーバそのもの。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "エコー要求（Echo Request）" },
        { key: "イ", text: "時間超過（Time Exceeded）" },
        { key: "ウ", text: "ARP 要求" },
        { key: "エ", text: "SYN" },
      ],
      answer: "ア",
      explain:
        "ping は ICMP のエコー要求を送り、エコー応答を待つ。FW で ICMP を止めていると、相手が動いていても応答が返らないことがある。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "いつまでもネットワークを回り続ける" },
        { key: "イ", text: "宛先に必ず届く" },
        { key: "ウ", text: "暗号化される" },
        { key: "エ", text: "小さく分割される" },
      ],
      answer: "ア",
      explain:
        "ループの中を回るたびに TTL が減り、0 になったところで捨てられる。TTL が無ければ、ループに入ったパケットが溜まり続けて回線をふさいでしまう。",
    },
  ],
  points: [
    "TTL は経由できるルータの数の上限。ルータごとに 1 減り、0 で破棄されて ICMP 時間超過が返る。",
    "tracert（traceroute）は TTL を 1 ずつ増やして、途中のルータを 1 台ずつあぶり出す。最後の行は宛先そのもの。",
    "ping は ICMP エコー要求とエコー応答。FW が ICMP を止めていると、届いていても返事が無いことがある。",
  ],
};
