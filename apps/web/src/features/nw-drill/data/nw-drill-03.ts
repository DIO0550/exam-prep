import type { NwDrill } from "../types";

/** 構成と経路制御：OSPF のコストで経路を選び、障害時に迂回する。 */
export const NW_DRILL_03: NwDrill = {
  id: "nw-drill-03",
  topic: "構成と経路制御",
  title: "OSPF のコストで経路を選ぶ",
  body: [
    {
      kind: "p",
      text: "C 社では，4 台のルータ R1〜R4 で動的ルーティングプロトコルの OSPF を動かしている。各リンクのコストは図 1 のとおりで，帯域が広いリンクほどコストが小さくなるように設定した。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　C 社のルータの構成とリンクのコスト",
        nodes: [
          { id: "lanA", label: "LAN A", col: 0, row: 0 },
          { id: "r1", label: "R1", col: 1.2, row: 0 },
          { id: "r2", label: "R2", col: 3, row: 0 },
          { id: "r3", label: "R3", col: 1.2, row: 1.6 },
          { id: "r4", label: "R4", col: 3, row: 1.6 },
          { id: "lanB", label: "LAN B", col: 4.2, row: 1.6 },
        ],
        edges: [
          { from: "lanA", to: "r1", arrow: "none" },
          { from: "r1", to: "r2", arrow: "none", label: "コスト 10" },
          { from: "r2", to: "r4", arrow: "none", label: "コスト 10" },
          { from: "r1", to: "r3", arrow: "none", label: "コスト 1" },
          { from: "r3", to: "r4", arrow: "none", label: "コスト 30" },
          { from: "r4", to: "lanB", arrow: "none" },
        ],
      },
    },
    {
      kind: "p",
      text: "OSPF では，各ルータがリンクの状態（つながりとコスト）を交換してネットワーク全体の地図を作り，宛先までのコストの合計が最も小さい経路を選ぶ。このような方式を {{a}} 型という。",
    },
    {
      kind: "p",
      text: "LAN A から LAN B へのパケットは，{{b}} の経路で送られ，そのコストの合計は {{c}} である。",
    },
    {
      kind: "p",
      text: "R1 と R2 の間のリンクが切れると，OSPF は経路を計算し直し，LAN B へのパケットは R1 → R3 → R4 の経路に切り替わる。このときのコストの合計は {{d}} である。",
    },
    {
      kind: "p",
      text: "これに対し，RIP は {{e}} が最も少ない経路を選ぶので，リンクの帯域の違いは考えない。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: [
        { key: "ア", text: "リンクステート" },
        { key: "イ", text: "ディスタンスベクタ" },
        { key: "ウ", text: "パスベクタ" },
        { key: "エ", text: "スタティック" },
      ],
      answer: "ア",
      explain:
        "リンクの状態を全ルータで共有し、各自が最短経路を計算するのがリンクステート型（OSPF）。隣から聞いた距離を足していくのがディスタンスベクタ型（RIP）、組織間の経路で使う BGP がパスベクタ型。",
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        { key: "ア", text: "R1 → R2 → R4" },
        { key: "イ", text: "R1 → R3 → R4" },
        { key: "ウ", text: "R1 → R2 → R4 と R1 → R3 → R4 に半分ずつ分けて" },
        { key: "エ", text: "R1 → R3 → R2 → R4" },
      ],
      answer: "ア",
      explain:
        "R1 → R2 → R4 は 10＋10＝20、R1 → R3 → R4 は 1＋30＝31。合計が小さい R2 経由が選ばれる。最初のリンクのコストが小さい R3 側を選ぶのではない点に注意。半分ずつ分けるのは合計が等しいとき（等コストマルチパス）。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "20",
      explain: "R1–R2 のコスト 10 と R2–R4 のコスト 10 の合計で 20。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "31",
      explain: "R1–R3 のコスト 1 と R3–R4 のコスト 30 の合計で 31。障害時の迂回経路。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "ホップ数（経由するルータの数）" },
        { key: "イ", text: "リンクの帯域" },
        { key: "ウ", text: "遅延時間" },
        { key: "エ", text: "パケットの損失率" },
      ],
      answer: "ア",
      explain:
        "RIP のメトリックはホップ数だけで、最大 15（16 は到達不能）。図 1 ではどちらの経路もホップ数が同じなので、RIP では帯域の広い R2 経由を選べるとは限らない。",
    },
  ],
  points: [
    "OSPF はリンクステート型。コスト（既定は基準帯域 ÷ リンクの帯域）の合計が最小の経路を選び、障害時は計算し直して迂回する。",
    "RIP はディスタンスベクタ型で、ホップ数だけを見る（最大 15）。帯域の違いは考えない。",
    "静的経路は障害時に自動では切り替わらない。迂回させたいなら動的ルーティングを使う。",
  ],
};
