import type { NwDrill } from "../types";

/** LAN と VLAN：L2SW の MAC アドレス学習と ARP。 */
export const NW_DRILL_07: NwDrill = {
  id: "nw-drill-07",
  topic: "LAN と VLAN",
  title: "L2SW が MAC アドレスを覚えて転送する",
  body: [
    {
      kind: "p",
      text: "G 社のフロアでは，PC A〜C を L2SW（レイヤ 2 スイッチ）のポート 1〜3 につないでいる（図 1，表 1）。電源を入れた直後の L2SW の MAC アドレステーブルは空である。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　G 社のフロアの LAN",
        nodes: [
          { id: "sw", label: "L2SW", col: 1.5, row: 0 },
          { id: "a", label: "PC A", col: 0, row: 1.4 },
          { id: "b", label: "PC B", col: 1.5, row: 1.4 },
          { id: "c", label: "PC C", col: 3, row: 1.4 },
        ],
        edges: [
          { from: "sw", to: "a", arrow: "none", label: "ポート 1", labelAt: 0.4 },
          { from: "sw", to: "b", arrow: "none", label: "ポート 2", labelAt: 0.4 },
          { from: "sw", to: "c", arrow: "none", label: "ポート 3", labelAt: 0.4 },
        ],
      },
    },
    {
      kind: "table",
      caption: "表 1　PC のアドレス",
      headers: ["PC", "MAC アドレス", "IP アドレス"],
      rows: [
        ["PC A", "00-00-5E-00-53-0A", "192.168.1.10"],
        ["PC B", "00-00-5E-00-53-0B", "192.168.1.11"],
        ["PC C", "00-00-5E-00-53-0C", "192.168.1.12"],
      ],
    },
    {
      kind: "p",
      text: "PC A は PC B の IP アドレスしか知らないので，まず {{a}} で PC B の MAC アドレスを問い合わせる。この問合せは，宛先 MAC アドレスを FF-FF-FF-FF-FF-FF にした {{b}} で送られる。",
    },
    {
      kind: "p",
      text: "L2SW はフレームを受け取ると，フレームの {{c}} と，受け取ったポートの組を MAC アドレステーブルに書き込む。PC B が応答を返した後の MAC アドレステーブルを表 2 に示す。",
    },
    {
      kind: "table",
      caption: "表 2　L2SW の MAC アドレステーブル",
      headers: ["MAC アドレス", "ポート"],
      rows: [
        ["00-00-5E-00-53-0A", "1"],
        ["00-00-5E-00-53-0B", "{{d}}"],
      ],
    },
    {
      kind: "p",
      text: "この後，PC C がまだ一度も送信していない状態で，PC A が PC C 宛てのフレームを送ると，L2SW は {{e}}。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "プロトコル名",
      answer: "ARP",
      explain:
        "ARP（Address Resolution Protocol）は、同じ LAN の中で IP アドレスから MAC アドレスを調べる。得た対応は ARP キャッシュにしばらく覚える。",
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        { key: "ア", text: "ブロードキャスト" },
        { key: "イ", text: "ユニキャスト" },
        { key: "ウ", text: "マルチキャスト" },
        { key: "エ", text: "エニーキャスト" },
      ],
      answer: "ア",
      explain:
        "相手の MAC アドレスが分からないので、全員宛て（全ビットが 1 の FF-FF-FF-FF-FF-FF）のブロードキャストで尋ねる。該当する PC B だけが、PC A 宛てのユニキャストで答える。",
    },
    {
      key: "c",
      hint: "記号",
      choices: [
        { key: "ア", text: "送信元 MAC アドレス" },
        { key: "イ", text: "宛先 MAC アドレス" },
        { key: "ウ", text: "送信元 IP アドレス" },
        { key: "エ", text: "宛先 IP アドレス" },
      ],
      answer: "ア",
      explain:
        "「この MAC アドレスの機器はこのポートの先にいる」と分かるのは、送ってきたフレームの送信元 MAC アドレスから。L2SW は IP アドレスを見ない。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "2",
      explain:
        "PC B の応答はポート 2 から入ってくるので、PC B の MAC アドレスをポート 2 と覚える。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "ポート 2 と 3 へ送る（フラッディング）" },
        { key: "イ", text: "ポート 3 だけへ送る" },
        { key: "ウ", text: "フレームを破棄する" },
        { key: "エ", text: "ポート 1 へ送り返す" },
      ],
      answer: "ア",
      explain:
        "PC C の MAC アドレスはまだテーブルに無い。宛先が分からないフレームは、受け取ったポート以外の全てのポートへ送る（フラッディング）。PC C が一度送信すれば、以後はポート 3 だけへ送る。",
    },
  ],
  points: [
    "L2SW は送信元 MAC アドレスで学習し、宛先 MAC アドレスで転送先のポートを決める。",
    "宛先がテーブルに無いフレームとブロードキャストは、受け取ったポート以外の全ポートへ送る。",
    "ARP は IP アドレスから MAC アドレスを調べる。要求はブロードキャスト、応答はユニキャスト。",
  ],
};
