import type { NwDrill } from "../types";

/** 冗長化と負荷分散：負荷分散装置（振分け方式・セッション維持・ヘルスチェック・必要な台数）。 */
export const NW_DRILL_17: NwDrill = {
  id: "nw-drill-17",
  topic: "冗長化と負荷分散",
  title: "負荷分散装置で Web サーバに振り分ける",
  body: [
    {
      kind: "p",
      text: "Q 社の EC サイトでは，負荷分散装置（LB）で 3 台の Web サーバに要求を振り分けている（図 1）。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　Q 社の EC サイトの構成",
        nodes: [
          { id: "inet", label: "インターネット", col: 0, row: 1, shape: "cloud" },
          { id: "lb", label: "負荷分散装置\n（LB）", col: 1.7, row: 1 },
          { id: "web1", label: "Web1", col: 3.3, row: 0 },
          { id: "web2", label: "Web2", col: 3.3, row: 1 },
          { id: "web3", label: "Web3", col: 3.3, row: 2 },
        ],
        edges: [
          { from: "inet", to: "lb", arrow: "none" },
          { from: "lb", to: "web1", arrow: "none" },
          { from: "lb", to: "web2", arrow: "none" },
          { from: "lb", to: "web3", arrow: "none" },
        ],
      },
    },
    {
      kind: "p",
      text: "利用者は，DNS で引いた {{a}} に接続し，LB が要求を受けて Web サーバへ渡す。",
    },
    {
      kind: "p",
      text: "要求を Web サーバに順番に割り当てる方式を {{b}} という。このほか，処理中の接続の数が最も少ないサーバへ割り当てる方式もある。",
    },
    {
      kind: "p",
      text: "ショッピングカートの中身を Web サーバのメモリに持っているので，同じ利用者の要求は同じ Web サーバへ送り続ける必要がある。LB のこの機能を {{c}} という。",
    },
    {
      kind: "p",
      text: "LB は各 Web サーバへ定期的に {{d}} を行い，応答しないサーバへは振り分けない。",
    },
    {
      kind: "p",
      text: "Web サーバ 1 台が処理できるのは毎秒 400 件で，ピーク時の要求は毎秒 900 件である。1 台が止まってもピーク時の要求をさばけるようにするには，Web サーバは最低 {{e}} 台要る。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: [
        { key: "ア", text: "LB の仮想 IP アドレス" },
        { key: "イ", text: "Web1 の IP アドレス" },
        { key: "ウ", text: "3 台の Web サーバのアドレスを順番に" },
        { key: "エ", text: "DNS サーバのアドレス" },
      ],
      answer: "ア",
      explain:
        "サイトの名前には LB の仮想 IP アドレスを登録する。利用者は個々の Web サーバを知らなくてよく、サーバを増減しても DNS を変えずに済む。",
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        { key: "ア", text: "ラウンドロビン" },
        { key: "イ", text: "最小コネクション" },
        { key: "ウ", text: "重み付け" },
        { key: "エ", text: "フェールオーバ" },
      ],
      answer: "ア",
      explain:
        "ラウンドロビンは 1 → 2 → 3 → 1 … と順に割り当てる。処理時間に差があると偏るので、接続数の少ないサーバへ送る最小コネクション方式もある。",
    },
    {
      key: "c",
      hint: "記号",
      choices: [
        { key: "ア", text: "セッション維持（パーシステンス）" },
        { key: "イ", text: "ヘルスチェック" },
        { key: "ウ", text: "SSL アクセラレーション" },
        { key: "エ", text: "フェールバック" },
      ],
      answer: "ア",
      explain:
        "セッション維持は、Cookie や送信元 IP アドレスで利用者を見分け、同じサーバへ送り続ける。送信元 IP アドレスで見分けると、NAPT の後ろの多くの利用者が 1 台に偏ることがある。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "ヘルスチェック" },
        { key: "イ", text: "セッション維持" },
        { key: "ウ", text: "キャッシュの更新" },
        { key: "エ", text: "ゾーン転送" },
      ],
      answer: "ア",
      explain:
        "ヘルスチェックは ping（L3）、ポートへの接続（L4）、決めたページの取得（L7）などで生死を確かめる。L7 まで見れば、OS は動いているがアプリケーションが止まっている状態も見つけられる。",
    },
    {
      key: "e",
      hint: "数値",
      answer: "4",
      explain:
        "900 ÷ 400 ＝ 2.25 なので、ピークには 3 台が必要。そのうえ 1 台止まっても 3 台残るように、4 台にする。3 台だと 1 台止まったとき 800 件しかさばけない。",
    },
  ],
  points: [
    "LB は仮想 IP アドレスで要求を受け、振分け方式（ラウンドロビン、最小コネクションなど）でサーバを選ぶ。",
    "セッション維持は Cookie や送信元アドレスで同じ利用者を同じサーバへ送る。ヘルスチェックで止まったサーバを外す。",
    "N 台中 1 台が止まっても足りるか（N − 1 台で処理できるか）を確かめる。",
  ],
};
