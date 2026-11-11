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
      steps: [
        "VRRP では R1 と R2 で 1 つの仮想ルータを作り、その仮想 IP アドレスを 192.168.1.1 にしている。",
        "PC のデフォルトゲートウェイを仮想 IP アドレスにしておけば、どちらのルータが働いていても、PC は同じアドレスへ送ればよい。",
        "R1 の実アドレス（192.168.1.2）にすると、R1 が止まったときに PC の設定を書き換えないと通信できない。",
      ],
      figure: {
        type: "diagram",
        caption: "PC は仮想ルータのアドレスへ送り、今のマスタ（R1）が受け持つ",
        nodes: [
          { id: "r1", label: "ルータ R1\nマスタ（優先度 200）", col: 0, row: 0, tone: "ok" },
          {
            id: "r2",
            label: "ルータ R2\nバックアップ（優先度 100）",
            col: 3,
            row: 0,
            tone: "muted",
          },
          {
            id: "v",
            label: "仮想ルータ\n192.168.1.1",
            col: 1.5,
            row: 1.3,
            shape: "round",
            tone: "accent",
          },
          {
            id: "pc",
            label: "PC",
            col: 1.5,
            row: 2.5,
            note: "ゲートウェイ＝192.168.1.1",
            notePlace: "right",
          },
        ],
        edges: [
          { from: "pc", to: "v", label: "宛先は仮想 IP" },
          { from: "v", to: "r1", label: "受け持つ", tone: "ok", dashed: true },
          { from: "v", to: "r2", label: "待機", tone: "muted", dashed: true },
        ],
      },
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
      steps: [
        "本文の「優先度の高い R1 が…ルータになり，仮想 IP アドレス宛ての通信を処理する」と、後ろの「自分がマスタになる」が手がかり。",
        "VRRP では、優先度が最も高いルータがマスタになって仮想 IP アドレスを受け持ち、ほかはバックアップとして待機する。",
        "図 1 の優先度は R1 が 200、R2 が 100 なので、R1 がマスタ、R2 がバックアップ（空欄 a の図）。",
      ],
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
      steps: [
        "R1 が「自分が動いている」ことを R2 に定期的に知らせるメッセージが入る。",
        "VRRP では、マスタが VRRP 広告（アドバタイズメント）をマルチキャストで定期的に送る。",
        "バックアップの R2 は、広告が一定時間（送る間隔の約 3 倍）届かないと、マスタが止まったと判断して自分がマスタになる。BPDU は STP の制御フレームで別のもの。",
      ],
      figure: {
        type: "sequence",
        caption: "マスタの広告が途絶えると、バックアップがマスタを引き継ぐ",
        actors: ["R1（マスタ）", "R2（バックアップ）"],
        steps: [
          { from: "R1（マスタ）", to: "R2（バックアップ）", label: "VRRP 広告（定期的に）" },
          { from: "R1（マスタ）", to: "R2（バックアップ）", label: "VRRP 広告" },
          { divider: "R1 が故障" },
          {
            from: "R1（マスタ）",
            to: "R2（バックアップ）",
            label: "広告が届かない",
            tone: "ng",
            blocked: true,
          },
          {
            over: ["R2（バックアップ）"],
            note: "一定時間届かない → マスタになり、仮想 IP と仮想 MAC を引き継ぐ",
            tone: "ok",
          },
        ],
      },
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
      steps: [
        "PC は、デフォルトゲートウェイ 192.168.1.1 に対応する MAC アドレスを ARP で調べ、ARP キャッシュに覚えている。",
        "VRRP では、仮想 IP アドレスに仮想 MAC アドレス（00-00-5E-00-01-xx）が対応する。R1 の物理 MAC アドレスではない。",
        "マスタが R2 に替わっても、R2 が同じ仮想 MAC アドレスで受け取るので、PC は覚えている MAC アドレスのまま送り続けられる。",
      ],
      figure: {
        type: "table",
        caption: "切り替わっても、PC から見た送り先は変わらない",
        headers: ["項目", "切替えの前", "切替えの後"],
        rows: [
          ["受け持つルータ", "R1", "R2"],
          ["仮想 IP アドレス", "192.168.1.1", "192.168.1.1（同じ）"],
          ["仮想 MAC アドレス", "00-00-5E-00-01-xx", "00-00-5E-00-01-xx（同じ）"],
          ["PC の ARP キャッシュ", "そのまま使える", "そのまま使える"],
        ],
      },
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
      steps: [
        "R1 のインターネット側だけが切れても、R1 の LAN 側は動いているので、R1 は VRRP 広告を送り続ける。R2 は切り替わらない。",
        "すると PC の通信は R1 に届くのに、インターネットへは出られない。",
        "R1 がインターネット側の回線を監視し、切れたら自分の優先度を R2 の 100 より下げてマスタを譲るのがトラッキング。プリエンプトは、優先度の高いルータが復旧したときにマスタを取り戻す設定。",
      ],
      figure: {
        type: "diagram",
        caption: "回線の断を検知した R1 が優先度を下げ、R2 にマスタを譲る",
        nodes: [
          { id: "inet", label: "インターネット", col: 1.5, row: -1.2, shape: "cloud" },
          {
            id: "r1",
            label: "ルータ R1",
            col: 0,
            row: 0,
            tone: "ng",
            note: "優先度 200 → 90",
            notePlace: "right",
          },
          {
            id: "r2",
            label: "ルータ R2",
            col: 3,
            row: 0,
            tone: "ok",
            note: "優先度 100 → マスタに",
            notePlace: "right",
          },
          { id: "sw", label: "L2SW", col: 1.5, row: 1.2 },
        ],
        edges: [
          { from: "inet", to: "r1", arrow: "none", label: "切断", tone: "ng", blocked: true },
          { from: "inet", to: "r2", arrow: "none", tone: "ok" },
          { from: "r1", to: "sw", arrow: "none", tone: "muted" },
          { from: "r2", to: "sw", arrow: "none", tone: "ok" },
        ],
      },
    },
  ],
  points: [
    "VRRP は複数のルータを 1 台の仮想ルータに見せる。PC は仮想 IP アドレスをデフォルトゲートウェイにする。",
    "優先度が最も高いものがマスタ。マスタの広告が途絶えるとバックアップが引き継ぐ（仮想 MAC アドレスごと）。",
    "LAN 側は生きていて上流の回線だけが切れた障害は、トラッキングで優先度を下げて切り替える。",
  ],
};
