import type { NwDrill } from "../types";

/** 冗長化と負荷分散：VRRP でデフォルトゲートウェイを冗長化する。 */
export const NW_DRILL_16: NwDrill = {
  id: "nw-drill-16",
  topic: "冗長化と負荷分散",
  title: "VRRP でデフォルトゲートウェイを二重にする",
  body: [
    {
      kind: "p",
      text: "P 社では，社内 LAN のデフォルトゲートウェイが止まらないよう，ルータ R1 と R2 で VRRP を使う（図 1）。2 台で 1 つの仮想ルータを作り，仮想 IP アドレスを 192.168.1.1 とした。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　P 社のネットワーク構成",
        nodes: [
          { id: "inet", label: "インターネット", col: 1.5, row: -1.2, shape: "cloud" },
          {
            id: "r1",
            label: "ルータ R1",
            col: 0,
            row: 0,
            note: "192.168.1.2\n優先度 200",
            notePlace: "right",
          },
          {
            id: "r2",
            label: "ルータ R2",
            col: 3,
            row: 0,
            note: "192.168.1.3\n優先度 100",
            notePlace: "right",
          },
          { id: "sw", label: "L2SW", col: 1.5, row: 1.2 },
          { id: "pc", label: "PC", col: 1.5, row: 2.3 },
        ],
        edges: [
          { from: "inet", to: "r1", arrow: "none" },
          { from: "inet", to: "r2", arrow: "none" },
          { from: "r1", to: "sw", arrow: "none" },
          { from: "r2", to: "sw", arrow: "none" },
          { from: "sw", to: "pc", arrow: "none" },
        ],
      },
    },
    { kind: "p", text: "PC のデフォルトゲートウェイには {{a}} を設定する。" },
    {
      kind: "p",
      text: "優先度の高い R1 が {{b}} ルータになり，仮想 IP アドレス宛ての通信を処理する。R1 は定期的に {{c}} を送り，自分が動いていることを R2 に知らせる。R2 は一定時間これを受け取れないと，自分がマスタになる。",
    },
    {
      kind: "p",
      text: "切り替わっても PC の ARP キャッシュを書き換えなくてよいのは，仮想 IP アドレスに対応する {{d}} も R2 が引き継ぐからである。",
    },
    {
      kind: "p",
      text: "R1 のインターネット側の回線だけが切れたときにも切り替えるには，R1 が回線を監視し，切れたら自分の優先度を R2 より下げる {{e}} を設定する。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: [
        { key: "ア", text: "192.168.1.1（仮想 IP アドレス）" },
        { key: "イ", text: "192.168.1.2（R1 のアドレス）" },
        { key: "ウ", text: "192.168.1.3（R2 のアドレス）" },
        { key: "エ", text: "192.168.1.2 と 192.168.1.3 の両方" },
      ],
      answer: "ア",
      explain:
        "PC は仮想ルータのアドレスをデフォルトゲートウェイにする。R1 のアドレスを設定すると、R1 が止まったときに PC の設定を変えないと通信できない。",
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        { key: "ア", text: "マスタ" },
        { key: "イ", text: "バックアップ" },
        { key: "ウ", text: "ルート" },
        { key: "エ", text: "プライマリ DNS" },
      ],
      answer: "ア",
      explain:
        "VRRP では優先度が最も高いルータがマスタになって仮想 IP アドレスを受け持ち、他はバックアップとして待機する。",
    },
    {
      key: "c",
      hint: "記号",
      choices: [
        { key: "ア", text: "VRRP の広告（アドバタイズメント）" },
        { key: "イ", text: "ARP 要求" },
        { key: "ウ", text: "BPDU" },
        { key: "エ", text: "DHCPDISCOVER" },
      ],
      answer: "ア",
      explain:
        "マスタは VRRP 広告をマルチキャストで定期的に送る。バックアップは、広告が一定時間（間隔の約 3 倍）届かないとマスタが止まったと判断する。BPDU は STP の制御フレーム。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "仮想 MAC アドレス" },
        { key: "イ", text: "R1 の物理 MAC アドレス" },
        { key: "ウ", text: "PC の MAC アドレス" },
        { key: "エ", text: "サブネットマスク" },
      ],
      answer: "ア",
      explain:
        "仮想 IP アドレスには仮想 MAC アドレス（00-00-5E-00-01-xx、xx は仮想ルータの番号）が対応する。新しいマスタも同じ仮想 MAC アドレスで応えるので、PC の ARP キャッシュはそのまま使える。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "トラッキング" },
        { key: "イ", text: "プリエンプト" },
        { key: "ウ", text: "リンクアグリゲーション" },
        { key: "エ", text: "ポートミラーリング" },
      ],
      answer: "ア",
      explain:
        "トラッキングは、指定したインタフェースや経路を監視し、障害時に優先度を下げてマスタを譲る。プリエンプトは、優先度の高いルータが復旧したときにマスタを取り戻す設定。",
    },
  ],
  points: [
    "VRRP は複数のルータを 1 台の仮想ルータに見せる。PC は仮想 IP アドレスをデフォルトゲートウェイにする。",
    "優先度が最も高いものがマスタ。マスタの広告が途絶えるとバックアップが引き継ぐ（仮想 MAC アドレスごと）。",
    "LAN 側は生きていて上流の回線だけが切れた障害は、トラッキングで優先度を下げて切り替える。",
  ],
};
