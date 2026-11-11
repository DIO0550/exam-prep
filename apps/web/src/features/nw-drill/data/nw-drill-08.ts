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
      steps: [
        "表 1 のポート 24 は VLAN が「10，20」の 2 つ。1 つのポートで 2 つの VLAN を扱っている。",
        "複数の VLAN のフレームを 1 本のケーブルで運ぶポートはトランクポートで、フレームにタグを付けて VLAN を区別する。",
        "アクセスポートは 1 つの VLAN だけに属し、タグを付けずに送るポート。PC をつなぐポート 1〜20 がこれに当たる。",
      ],
      figure: {
        type: "diagram",
        caption: "PC 側はタグなし（アクセスポート）、L3SW との間はタグ付き（トランクポート）",
        nodes: [
          { id: "l3", label: "L3SW", col: 1.5, row: 0 },
          { id: "l2", label: "L2SW", col: 1.5, row: 1.4 },
          { id: "sales", label: "営業部の PC\n（VLAN 10）", col: 0, row: 2.8 },
          { id: "dev", label: "開発部の PC\n（VLAN 20）", col: 3, row: 2.8 },
        ],
        edges: [
          {
            from: "l3",
            to: "l2",
            arrow: "both",
            label: "タグ付き（VLAN 10 と 20）",
            tone: "accent",
          },
          { from: "l2", to: "sales", arrow: "both", label: "タグなし" },
          { from: "l2", to: "dev", arrow: "both", label: "タグなし" },
        ],
      },
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
      steps: [
        "ポート 24 の 1 本のケーブルには 2 つの VLAN のフレームが混ざるので、フレームごとに「どの VLAN か」の印が要る。",
        "IEEE 802.1Q では、イーサネットフレームの送信元 MAC アドレスの後ろに 4 バイトの VLAN タグを挟む。タグの中の 12 ビットが VLAN ID。",
        "IP ヘッダを足すのは VPN などのトンネルの話、プリアンブルはフレームの前に付く同期用の信号で、どちらも VLAN の区別には使わない。",
      ],
      figure: {
        type: "diagram",
        caption: "IEEE 802.1Q のタグは、送信元 MAC アドレスの後ろに挟む 4 バイト",
        cell: { h: 96 },
        nodes: [
          {
            id: "plain",
            label: "タグなしのフレーム",
            col: 2,
            row: 0,
            fields: ["宛先 MAC", "送信元 MAC", "タイプ", "データ", "FCS"],
          },
          {
            id: "tagged",
            label: "タグ付きのフレーム",
            col: 2,
            row: 1.2,
            tone: "accent",
            fields: ["宛先 MAC", "送信元 MAC", "VLAN タグ", "タイプ", "データ", "FCS"],
          },
          {
            id: "tag",
            label: "VLAN タグの中身（4 バイト）",
            col: 2,
            row: 2.4,
            fields: ["TPID（16 ビット）", "優先度など（4 ビット）", "VLAN ID（12 ビット）"],
          },
        ],
      },
    },
    {
      key: "c",
      hint: "規格の番号（802. で始まる）",
      answer: "802.1Q",
      accepts: ["IEEE 802.1Q"],
      explain:
        "タグ VLAN の規格は IEEE 802.1Q。802.1X（ポートでの認証）や 802.11（無線 LAN）と取り違えやすい。",
      steps: [
        "タグ VLAN（フレームに VLAN タグを挟む方式）を定めた規格の番号を思い出す。",
        "答えは IEEE 802.1Q。番号が似た規格と取り違えやすいので、下の表で区別しておく。",
      ],
      figure: {
        type: "table",
        caption: "取り違えやすい IEEE 802 の規格",
        headers: ["規格", "内容"],
        rows: [
          ["802.1Q", "タグ VLAN"],
          ["802.1X", "ポートでの認証（つないだ端末を認証してから通す）"],
          ["802.1D", "スパニングツリー（STP）"],
          ["802.3ad", "リンクアグリゲーション（802.3 は有線のイーサネット）"],
          ["802.11", "無線 LAN"],
        ],
      },
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
      steps: [
        "VLAN は 1 台の L2SW の中に別々の LAN を作る仕組み。同じ VLAN のポートどうしだけが、同じ LAN になる。",
        "LAN の全員に届けるブロードキャスト（ARP 要求など）も、同じ VLAN のポートにしか流れない。1 つの VLAN が 1 つのブロードキャストドメイン。",
        "宛先が分かっているユニキャストは、もともと宛先のポートにしか送られないので、VLAN で分けたことで変わるものではない。",
      ],
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
      steps: [
        "VLAN が違えば別の LAN で、IP アドレスも別のサブネットになる。L2SW は VLAN をまたいでフレームを渡さない。",
        "別のサブネットどうしをつなぐのはルーティングの仕事。L3SW に VLAN 10 と VLAN 20 のインタフェースを持たせ、その間をルーティングする。",
        "営業部の PC のフレームは L2SW → L3SW と上がり、L3SW で VLAN 20 へ渡されて、L2SW → 開発部の PC と下りる。",
      ],
      figure: {
        type: "diagram",
        caption: "VLAN 10 から VLAN 20 へは、L3SW で折り返して届ける",
        nodes: [
          { id: "l3", label: "L3SW（ルーティング）", col: 1.5, row: 0, tone: "accent" },
          { id: "l2", label: "L2SW", col: 1.5, row: 1.4 },
          { id: "sales", label: "営業部の PC", col: 0, row: 2.8 },
          { id: "dev", label: "開発部の PC", col: 3, row: 2.8 },
        ],
        edges: [
          { from: "sales", to: "l2", label: "① VLAN 10" },
          { from: "l2", to: "l3", label: "② VLAN 10", bend: 0.75 },
          { from: "l3", to: "l2", label: "③ VLAN 20", bend: 0.75 },
          { from: "l2", to: "dev", label: "④ VLAN 20" },
        ],
      },
    },
  ],
  points: [
    "アクセスポートは 1 つの VLAN に属し、タグを付けない。トランクポートは複数の VLAN のフレームをタグ付きで運ぶ。",
    "IEEE 802.1Q のタグは 4 バイトで、その中の 12 ビットが VLAN ID。",
    "VLAN が違えば別のブロードキャストドメイン。VLAN 間の通信には L3SW やルータでのルーティングが要る。",
  ],
};
