import type { NwDrill } from "../types";

/** LAN と VLAN：ループとブロードキャストストーム、STP、リンクアグリゲーション。 */
export const NW_DRILL_09: NwDrill = {
  id: "nw-drill-09",
  topic: "LAN と VLAN",
  title: "スイッチのループを STP で断つ",
  body: [
    {
      kind: "p",
      text: "I 社は，SW1〜SW3 の 3 台の L2SW を図 1 のように三角形につなぎ，1 本のケーブルが切れても通信が続くようにした。しかし，ループのある L2 のネットワークでは，ブロードキャストフレームが回り続けて増え，帯域を食い尽くす {{a}} が起きる。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　I 社の L2SW のつなぎ方",
        nodes: [
          { id: "sw1", label: "SW1", col: 1, row: 0 },
          { id: "sw2", label: "SW2", col: 0, row: 1.4 },
          { id: "sw3", label: "SW3", col: 2, row: 1.4 },
        ],
        edges: [
          { from: "sw1", to: "sw2", arrow: "none" },
          { from: "sw1", to: "sw3", arrow: "none" },
          { from: "sw2", to: "sw3", arrow: "none" },
        ],
      },
    },
    {
      kind: "p",
      text: "そこで STP（スパニングツリープロトコル）を使う。STP は，ブリッジ ID（優先度と MAC アドレス）が {{b}} スイッチをルートブリッジに選び，ルートブリッジへの最短の経路にならないポートの 1 つを {{c}} 状態にしてループを断つ。",
    },
    {
      kind: "p",
      text: "SW1 の優先度を最も小さくしてルートブリッジにすると，SW2 と SW3 はそれぞれ SW1 への直結の線を使い，{{d}} の間の線が止められる。",
    },
    {
      kind: "p",
      text: "また，SW1 と SW2 の間を 1 G ビット/秒のケーブル 2 本でつなぎ，1 本の論理的なリンクとして束ねる {{e}} を使うと，2 本を同時に使えて帯域が最大 2 G ビット/秒になり，1 本が切れても通信は続く。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: [
        { key: "ア", text: "ブロードキャストストーム" },
        { key: "イ", text: "フラッディング" },
        { key: "ウ", text: "デッドロック" },
        { key: "エ", text: "スプーフィング" },
      ],
      answer: "ア",
      explain:
        "イーサネットのフレームには IP の TTL のような寿命が無いので、ループを回るブロードキャストは消えずに増え続ける。これがブロードキャストストーム。フラッディングは宛先が分からないフレームを全ポートへ送る通常の動き。",
      steps: [
        "図 1 のように三角形につなぐと、SW1 → SW2 → SW3 → SW1 … とフレームが一周できる道（ループ）ができる。",
        "ブロードキャストは受け取ったポート以外の全てのポートへ送られるので、ループの中で右回りと左回りに複製され、回り続ける。",
        "イーサネットのフレームには IP の TTL のような寿命が無いので消えない。増え続けて帯域を食い尽くすのがブロードキャストストーム。",
      ],
      figure: {
        type: "diagram",
        caption: "ループがあると、ブロードキャストが回り続ける（逆回りも同じ）",
        nodes: [
          { id: "sw1", label: "SW1", col: 1, row: 0 },
          { id: "sw2", label: "SW2", col: 0, row: 1.4 },
          { id: "sw3", label: "SW3", col: 2, row: 1.4 },
        ],
        edges: [
          { from: "sw1", to: "sw2", label: "①", tone: "ng" },
          { from: "sw2", to: "sw3", label: "②", tone: "ng" },
          { from: "sw3", to: "sw1", label: "③ また SW1 へ", tone: "ng" },
        ],
      },
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        { key: "ア", text: "最も小さい" },
        { key: "イ", text: "最も大きい" },
        { key: "ウ", text: "最も早く起動した" },
        { key: "エ", text: "ポートの数が最も多い" },
      ],
      answer: "ア",
      explain:
        "ブリッジ ID は「優先度＋MAC アドレス」で、値が最も小さいスイッチがルートブリッジになる。優先度を小さく設定すれば、狙ったスイッチをルートにできる。",
      steps: [
        "ブリッジ ID は「優先度」と「MAC アドレス」を並べた値。STP では、値が最も小さいスイッチがルートブリッジになる。",
        "まず優先度を比べ、同じなら MAC アドレスの小さいほうが選ばれる。",
        "本文の後半の「SW1 の優先度を最も小さくしてルートブリッジにする」も、小さいほうが選ばれるからできること。",
      ],
    },
    {
      key: "c",
      hint: "記号",
      choices: [
        { key: "ア", text: "ブロッキング" },
        { key: "イ", text: "フォワーディング" },
        { key: "ウ", text: "ミラーリング" },
        { key: "エ", text: "トランク" },
      ],
      answer: "ア",
      explain:
        "ブロッキング状態のポートはデータのフレームを送受信しない（STP の制御フレーム BPDU は受け取る）。使っている線が切れると、ブロッキングを解いて迂回させる。",
      steps: [
        "ループを断つには、ループの中の 1 か所でフレームを通さなければよい。",
        "STP でデータのフレームの送受信を止めたポートの状態をブロッキングという。フォワーディングは普通に転送している状態。",
        "ブロッキングのポートも STP の制御フレーム（BPDU）は受け取り続け、使っている線が切れたら解除して迂回路になる。",
      ],
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "SW2 と SW3" },
        { key: "イ", text: "SW1 と SW2" },
        { key: "ウ", text: "SW1 と SW3" },
        { key: "エ", text: "どこも止めない" },
      ],
      answer: "ア",
      explain:
        "SW2 と SW3 は SW1（ルート）へ直結の線で届くので、SW2–SW3 の線はルートへの最短経路に使われない。この線のどちらかの端のポートがブロッキングになる。",
      steps: [
        "ルートブリッジは SW1。SW2 と SW3 は、それぞれルートへの最短の経路を 1 本ずつ選ぶ。",
        "SW2 も SW3 も、SW1 への直結の線がいちばん近い。SW2–SW3 の線は、どちらの最短経路にも使われない。",
        "使われない SW2–SW3 の線の一方の端をブロッキングにすると、三角形のループが切れて木の形（スパニングツリー）になる。",
      ],
      figure: {
        type: "diagram",
        caption: "SW1 をルートにすると、SW2–SW3 の線が止められて木の形になる",
        nodes: [
          {
            id: "sw1",
            label: "SW1",
            col: 1,
            row: 0,
            tone: "accent",
            note: "ルートブリッジ",
            notePlace: "right",
          },
          { id: "sw2", label: "SW2", col: 0, row: 1.4 },
          { id: "sw3", label: "SW3", col: 2, row: 1.4 },
        ],
        edges: [
          { from: "sw1", to: "sw2", arrow: "none", tone: "ok" },
          { from: "sw1", to: "sw3", arrow: "none", tone: "ok" },
          {
            from: "sw2",
            to: "sw3",
            arrow: "none",
            label: "ブロッキング",
            tone: "ng",
            blocked: true,
          },
        ],
      },
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "リンクアグリゲーション" },
        { key: "イ", text: "スパニングツリー" },
        { key: "ウ", text: "ポートミラーリング" },
        { key: "エ", text: "タグ VLAN" },
      ],
      answer: "ア",
      explain:
        "リンクアグリゲーション（IEEE 802.3ad／LACP）は複数の物理リンクを 1 本に束ねる。STP からも 1 本のリンクに見えるので、2 本ともブロッキングされずに使える。",
      steps: [
        "「2 本のケーブルを 1 本の論理的なリンクとして束ねる」がキーワード。これがリンクアグリゲーション（IEEE 802.3ad／LACP）。",
        "束ねた 2 本は STP からも 1 本に見えるので、片方がブロッキングされず、2 本を同時に使える。帯域は最大 1＋1＝2 G ビット/秒。",
        "1 本が切れても残りの 1 本で通信は続く。STP は冗長な経路を止める仕組みなので、2 本を同時に使うことはできない。",
      ],
      figure: {
        type: "diagram",
        caption: "2 本の物理リンクを束ねて、1 本の論理リンク（最大 2 G ビット/秒）として使う",
        nodes: [
          { id: "sw1", label: "SW1", col: 0, row: 0 },
          { id: "sw2", label: "SW2", col: 3, row: 0 },
        ],
        edges: [
          { from: "sw1", to: "sw2", arrow: "none", label: "1 G ビット/秒", bend: 0.25, tone: "ok" },
          { from: "sw2", to: "sw1", arrow: "none", label: "1 G ビット/秒", bend: 0.25, tone: "ok" },
        ],
      },
    },
  ],
  points: [
    "L2 のループはブロードキャストストームを起こす（フレームに寿命が無く、消えない）。",
    "STP：ブリッジ ID が最小のルートブリッジを決め、冗長な経路のポートをブロッキングにする。障害時はブロッキングを解いて迂回する。",
    "リンクアグリゲーション：複数の物理リンクを 1 本に束ね、帯域と冗長性を得る。",
  ],
};
