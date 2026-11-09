import type { NwDrill } from "../types";

/** LAN と VLAN：アクセスポートとトランクポート、IEEE 802.1Q、VLAN 間ルーティング。 */
export const NW_DRILL_08: NwDrill = {
  id: "nw-drill-08",
  topic: "LAN と VLAN",
  title: "VLAN で部署ごとに LAN を分ける",
  body: [
    {
      kind: "p",
      text: "H 社では，1 台の L2SW に営業部と開発部の PC をつなぎ，VLAN で部署ごとに LAN を分けている（図 1）。L2SW のポートの設定を表 1 に示す。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　H 社の LAN の構成",
        nodes: [
          { id: "l3", label: "L3SW", col: 1.5, row: 0 },
          { id: "l2", label: "L2SW", col: 1.5, row: 1.3 },
          { id: "sales", label: "営業部の PC\n（VLAN 10）", col: 0.3, row: 2.7 },
          { id: "dev", label: "開発部の PC\n（VLAN 20）", col: 2.7, row: 2.7 },
        ],
        edges: [
          { from: "l3", to: "l2", arrow: "none", label: "ポート 24" },
          { from: "l2", to: "sales", arrow: "none", label: "ポート 1〜12" },
          { from: "l2", to: "dev", arrow: "none", label: "ポート 13〜20" },
        ],
      },
    },
    {
      kind: "table",
      caption: "表 1　L2SW のポートの設定",
      headers: ["ポート", "接続先", "VLAN", "設定"],
      rows: [
        ["1〜12", "営業部の PC", "10", "アクセスポート"],
        ["13〜20", "開発部の PC", "20", "アクセスポート"],
        ["24", "L3SW", "10，20", "{{a}}"],
      ],
    },
    {
      kind: "p",
      text: "ポート 24 では，1 本のケーブルで 2 つの VLAN のフレームを運ぶ。どの VLAN のフレームかを区別するため，イーサネットフレームに VLAN ID を入れた {{b}} を挟む。この方式は IEEE {{c}} で定められている。",
    },
    {
      kind: "p",
      text: "VLAN を分けると，{{d}} が届く範囲がその VLAN の中だけになり，不要な通信が他の部署へ広がらない。",
    },
    { kind: "p", text: "営業部の PC から開発部の PC へ通信するには，{{e}}。" },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: [
        { key: "ア", text: "トランクポート（タグ付き）" },
        { key: "イ", text: "アクセスポート（タグなし）" },
        { key: "ウ", text: "ミラーポート" },
        { key: "エ", text: "無効（シャットダウン）" },
      ],
      answer: "ア",
      explain:
        "複数の VLAN のフレームを 1 本で運ぶポートはトランクポート（タグ VLAN）。アクセスポートは 1 つの VLAN だけに属し、タグを付けずに送る。",
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        { key: "ア", text: "4 バイトの VLAN タグ" },
        { key: "イ", text: "新しい IP ヘッダ" },
        { key: "ウ", text: "2 つ目の MAC アドレス" },
        { key: "エ", text: "8 バイトのプリアンブル" },
      ],
      answer: "ア",
      explain:
        "送信元 MAC アドレスの後ろに 4 バイトのタグを挟む。タグのうち 12 ビットが VLAN ID で、1〜4094 を使える。",
    },
    {
      key: "c",
      hint: "規格の番号（802. で始まる）",
      answer: "802.1Q",
      accepts: ["IEEE 802.1Q"],
      explain:
        "タグ VLAN の規格は IEEE 802.1Q。802.1X（ポートでの認証）や 802.11（無線 LAN）と取り違えやすい。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "ブロードキャストフレーム" },
        { key: "イ", text: "宛先が分かっているユニキャストフレーム" },
        { key: "ウ", text: "インターネットからのパケット" },
        { key: "エ", text: "無線 LAN の電波" },
      ],
      answer: "ア",
      explain:
        "1 つの VLAN が 1 つのブロードキャストドメイン。ARP 要求などのブロードキャストは、同じ VLAN のポートにだけ流れる。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "L3SW で VLAN 10 と VLAN 20 の間をルーティングする" },
        { key: "イ", text: "2 台の PC を同じ L2SW につなぐだけでよい" },
        { key: "ウ", text: "L2SW のポート 24 をアクセスポートにする" },
        { key: "エ", text: "両方の PC に同じ IP アドレスを設定する" },
      ],
      answer: "ア",
      explain:
        "VLAN が違えば別の LAN（別のサブネット）なので、L2SW だけでは届かない。L3SW（またはルータ）で VLAN ごとにインタフェースを持ち、VLAN 間をルーティングする。",
    },
  ],
  points: [
    "アクセスポートは 1 つの VLAN に属し、タグを付けない。トランクポートは複数の VLAN のフレームをタグ付きで運ぶ。",
    "IEEE 802.1Q のタグは 4 バイトで、その中の 12 ビットが VLAN ID。",
    "VLAN が違えば別のブロードキャストドメイン。VLAN 間の通信には L3SW やルータでのルーティングが要る。",
  ],
};
