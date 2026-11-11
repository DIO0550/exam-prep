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
      steps: [
        "PC A が知っているのは PC B の IP アドレスだけ。LAN の中でフレームを送るには、宛先の MAC アドレスが要る。",
        "IP アドレスから MAC アドレスを調べるプロトコルが ARP。本文の「問い合わせる」は ARP 要求を出す場面。",
        "調べた対応は ARP キャッシュにしばらく覚えるので、送るたびに問い合わせるわけではない。",
      ],
      figure: {
        type: "sequence",
        caption: "ARP で PC B の MAC アドレスを調べる",
        actors: ["PC A", "PC B", "PC C"],
        steps: [
          { from: "PC A", to: "PC B", label: "ARP 要求：192.168.1.11 は誰？（全員宛て）" },
          { from: "PC A", to: "PC C", label: "同じ要求が届く（全員宛て）", tone: "muted" },
          { over: ["PC C"], note: "自分ではないので答えない" },
          {
            from: "PC B",
            to: "PC A",
            label: "ARP 応答：…-53-0B です（PC A 宛て）",
            dashed: true,
            tone: "ok",
          },
          { over: ["PC A"], note: "ARP キャッシュに覚える" },
        ],
      },
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
      steps: [
        "本文の「宛先 MAC アドレスを FF-FF-FF-FF-FF-FF にした」が手がかり。全ビットが 1 の MAC アドレスは「全員宛て」を表す。",
        "相手の MAC アドレスが分からないので、LAN の全員に届くブロードキャストで尋ねる。",
        "答える PC B は、要求に入っている PC A の MAC アドレスを知っているので、応答は PC A だけ宛てのユニキャストで返す（空欄 a の図）。",
      ],
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
      steps: [
        "L2SW が覚えたいのは「この MAC アドレスの機器は、どのポートの先にいるか」。",
        "フレームがポート 1 から入ってきたら、そのフレームを送った機器はポート 1 の先にいると分かる。だから送信元 MAC アドレスを書き込む。",
        "宛先 MAC アドレスは「どのポートへ送るか」を決めるのに使うもので、学習には使わない。L2SW は IP アドレスを見ない。",
      ],
      figure: {
        type: "table",
        caption: "L2SW の MAC アドレステーブルの移り変わり",
        headers: ["できごと", "入ったポート", "テーブルに増える行", "送り先"],
        rows: [
          ["① PC A の ARP 要求（全員宛て）", "1", "…-53-0A → ポート 1", "ポート 2・3"],
          ["② PC B の ARP 応答（PC A 宛て）", "2", "…-53-0B → ポート 2", "ポート 1 だけ"],
          ["③ PC A から PC C 宛て", "1", "（増えない）", "ポート 2・3"],
        ],
      },
    },
    {
      key: "d",
      hint: "数値",
      answer: "2",
      explain:
        "PC B の応答はポート 2 から入ってくるので、PC B の MAC アドレスをポート 2 と覚える。",
      steps: [
        "PC B の応答は、PC B がつながっているポート 2 から L2SW に入ってくる（図 1）。",
        "L2SW は、送信元 MAC アドレス（PC B の 00-00-5E-00-53-0B）と入ってきたポート 2 の組を書き込む。",
        "応答の宛先 PC A は学習済み（ポート 1）なので、応答はポート 1 だけへ送られる（空欄 c の表の ②）。",
      ],
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
      steps: [
        "PC C はまだ一度も送信していないので、PC C の MAC アドレスはテーブルに無い（表 2 は 2 行だけ）。",
        "宛先がテーブルに無いフレームは捨てずに、受け取ったポート 1 以外の全てのポート（2 と 3）へ送る。これがフラッディング。",
        "PC C が返事を送れば、そのときに「PC C はポート 3」と覚え、以後はポート 3 だけへ送る。",
      ],
      figure: {
        type: "diagram",
        caption: "宛先の PC C がテーブルに無いので、ポート 1 以外の全ポートへ送る",
        nodes: [
          { id: "sw", label: "L2SW", col: 1.5, row: 0 },
          { id: "a", label: "PC A（送信元）", col: 0, row: 1.5 },
          { id: "b", label: "PC B", col: 1.5, row: 1.5, tone: "muted" },
          { id: "c", label: "PC C（宛先）", col: 3, row: 1.5 },
        ],
        edges: [
          { from: "a", to: "sw", label: "受信", labelAt: 0.45 },
          { from: "sw", to: "b", label: "コピー", tone: "accent", labelAt: 0.55 },
          { from: "sw", to: "c", label: "コピー", tone: "accent", labelAt: 0.55 },
        ],
      },
    },
  ],
  points: [
    "L2SW は送信元 MAC アドレスで学習し、宛先 MAC アドレスで転送先のポートを決める。",
    "宛先がテーブルに無いフレームとブロードキャストは、受け取ったポート以外の全ポートへ送る。",
    "ARP は IP アドレスから MAC アドレスを調べる。要求はブロードキャスト、応答はユニキャスト。",
  ],
};
