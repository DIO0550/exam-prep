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
      steps: [
        "本文の「各ルータがリンクの状態（つながりとコスト）を交換してネットワーク全体の地図を作り」が手がかり。",
        "全体の地図を全ルータで共有し、各自が最短経路を計算する方式をリンクステート型という。OSPF が代表。",
        "ディスタンスベクタ型（RIP）は、隣のルータから「宛先までの距離」だけを聞く方式で、全体の地図は持たない。",
      ],
      figure: {
        type: "table",
        caption: "経路制御の方式の違い",
        headers: ["方式", "代表", "交換するもの", "経路の選び方"],
        rows: [
          [
            "リンクステート型",
            "OSPF",
            "リンクの状態（つながりとコスト）",
            "全体の地図から、コストの合計が最小の経路",
          ],
          ["ディスタンスベクタ型", "RIP", "宛先までの距離（ホップ数）", "ホップ数が最小の経路"],
          ["パスベクタ型", "BGP", "宛先までに通る AS の並び", "AS の並びと運用方針で選ぶ"],
        ],
      },
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
      steps: [
        "LAN A から LAN B へ行く経路を全て挙げる。R1 → R2 → R4 と R1 → R3 → R4 の 2 つ。",
        "経路ごとにコストを足す。R2 経由は 10＋10＝20、R3 経由は 1＋30＝31。",
        "合計が小さい R2 経由を選ぶ。最初のリンクのコスト（R1–R3 の 1）だけを見て R3 経由を選ばないこと。",
      ],
      figure: {
        type: "diagram",
        caption: "コストの合計は R2 経由が 20、R3 経由が 31。小さい R2 経由を使う",
        nodes: [
          { id: "lanA", label: "LAN A", col: 0, row: 0 },
          { id: "r1", label: "R1", col: 1.2, row: 0 },
          { id: "r2", label: "R2", col: 3, row: 0, tone: "ok" },
          { id: "r3", label: "R3", col: 1.2, row: 1.6, tone: "muted" },
          { id: "r4", label: "R4", col: 3, row: 1.6 },
          { id: "lanB", label: "LAN B", col: 4.2, row: 1.6 },
        ],
        edges: [
          { from: "lanA", to: "r1", arrow: "none" },
          { from: "r1", to: "r2", label: "コスト 10", tone: "ok" },
          { from: "r2", to: "r4", label: "コスト 10", tone: "ok" },
          { from: "r1", to: "r3", arrow: "none", label: "コスト 1", tone: "muted" },
          { from: "r3", to: "r4", arrow: "none", label: "コスト 30", tone: "muted" },
          { from: "r4", to: "lanB", arrow: "none" },
        ],
      },
    },
    {
      key: "c",
      hint: "数値",
      answer: "20",
      explain: "R1–R2 のコスト 10 と R2–R4 のコスト 10 の合計で 20。",
      steps: [
        "空欄 b で選んだ R1 → R2 → R4 のリンクのコストを図 1 から読む。R1–R2 は 10、R2–R4 は 10。",
        "合計は 10＋10＝20。LAN とルータの間にはコストが書かれていないので数えない。",
      ],
    },
    {
      key: "d",
      hint: "数値",
      answer: "31",
      explain: "R1–R3 のコスト 1 と R3–R4 のコスト 30 の合計で 31。障害時の迂回経路。",
      steps: [
        "R1–R2 のリンクが切れると、R2 を通る経路は使えなくなる。残るのは R1 → R3 → R4 だけ。",
        "R1–R3 は 1、R3–R4 は 30 なので、合計は 1＋30＝31。",
        "31 は普段の 20 より大きいが、ほかに経路が無いのでこれを使う。リンクが戻れば計算し直して R2 経由に戻る。",
      ],
      figure: {
        type: "diagram",
        caption: "R1–R2 が切れると、OSPF が計算し直して R3 経由（合計 31）に切り替える",
        nodes: [
          { id: "lanA", label: "LAN A", col: 0, row: 0 },
          { id: "r1", label: "R1", col: 1.2, row: 0 },
          { id: "r2", label: "R2", col: 3, row: 0, tone: "muted" },
          { id: "r3", label: "R3", col: 1.2, row: 1.6, tone: "ok" },
          { id: "r4", label: "R4", col: 3, row: 1.6 },
          { id: "lanB", label: "LAN B", col: 4.2, row: 1.6 },
        ],
        edges: [
          { from: "lanA", to: "r1", arrow: "none" },
          { from: "r1", to: "r2", arrow: "none", label: "切断", tone: "ng", blocked: true },
          { from: "r2", to: "r4", arrow: "none", label: "コスト 10", tone: "muted" },
          { from: "r1", to: "r3", label: "コスト 1", tone: "ok" },
          { from: "r3", to: "r4", label: "コスト 30", tone: "ok" },
          { from: "r4", to: "lanB", arrow: "none" },
        ],
      },
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
      steps: [
        "RIP はディスタンスベクタ型で、経路の良し悪し（メトリック）はホップ数、つまり経由するルータの数だけで決める。",
        "本文の「リンクの帯域の違いは考えない」から、帯域を反映するコストではなく、数を数えるだけの指標が入ると分かる。",
        "図 1 ではどちらの経路も R1 → R2（または R3）→ R4 でホップ数が同じ。RIP では帯域の広い R2 経由を選べるとは限らない。",
      ],
    },
  ],
  points: [
    "OSPF はリンクステート型。コスト（既定は基準帯域 ÷ リンクの帯域）の合計が最小の経路を選び、障害時は計算し直して迂回する。",
    "RIP はディスタンスベクタ型で、ホップ数だけを見る（最大 15）。帯域の違いは考えない。",
    "静的経路は障害時に自動では切り替わらない。迂回させたいなら動的ルーティングを使う。",
  ],
};
