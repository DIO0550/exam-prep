import type { NwDrill } from "../types";

/** NAT とファイアウォール：DMZ と FW のルール（上から評価・デフォルト拒否・ステートフル）。 */
export const NW_DRILL_15: NwDrill = {
  id: "nw-drill-15",
  topic: "NAT とファイアウォール",
  title: "DMZ を置いて FW のルールを書く",
  body: [
    {
      kind: "p",
      text: "O 社は，FW（ファイアウォール）で社内 LAN と DMZ を分け，公開する Web サーバとメールサーバを DMZ に置いた（図 1）。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　O 社のネットワーク構成",
        nodes: [
          { id: "inet", label: "インターネット", col: 0, row: 0, shape: "cloud" },
          { id: "fw", label: "FW", col: 1.8, row: 0 },
          { id: "pc", label: "社内の PC", col: 3.6, row: 0 },
          { id: "web", label: "Web サーバ", col: 1.2, row: 1.6 },
          { id: "mail", label: "メールサーバ", col: 2.4, row: 1.6 },
        ],
        edges: [
          { from: "inet", to: "fw", arrow: "none" },
          { from: "fw", to: "pc", arrow: "none" },
          { from: "fw", to: "web", arrow: "none" },
          { from: "fw", to: "mail", arrow: "none" },
        ],
        groups: [
          { label: "DMZ", col: 0.55, row: 1.2, w: 2.8, h: 1.2 },
          { label: "社内 LAN", col: 3.15, row: -0.35, w: 1.4, h: 1.2 },
        ],
      },
    },
    {
      kind: "p",
      text: "FW は表 1 のルールを番号の小さい順に調べ，最初に当てはまったルールの動作をとる。FW は通信の状態を覚えており，許可した通信の応答は，ルールに書かなくても通す。",
    },
    {
      kind: "table",
      caption: "表 1　FW のルール",
      headers: ["番号", "送信元", "宛先", "サービス", "動作"],
      rows: [
        ["1", "インターネット", "Web サーバ", "{{a}}", "許可"],
        ["2", "インターネット", "メールサーバ", "SMTP", "許可"],
        ["3", "メールサーバ", "インターネット", "{{b}}", "許可"],
        ["4", "社内 LAN", "DMZ", "HTTPS，SMTP，IMAPS", "許可"],
        ["5", "社内 LAN", "インターネット", "HTTP，HTTPS", "許可"],
        ["6", "全て", "全て", "全て", "拒否"],
      ],
    },
    {
      kind: "p",
      text: "ルール 6 のように，許可した通信のほかは全て拒否する考え方を {{c}} という。",
    },
    {
      kind: "p",
      text: "Web サーバの応答を通すルールを書かずに済むのは，FW が {{d}} の機能を持つからである。",
    },
    {
      kind: "p",
      text: "公開サーバを社内 LAN ではなく DMZ に置くのは，公開サーバが乗っ取られても，{{e}} からである。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "サービス名（英字）",
      answer: "HTTPS",
      explain:
        "公開 Web サーバへは、インターネットから HTTPS（TCP 443）を許可する。表の他のルールと同じく、サービス名で書く。",
    },
    {
      key: "b",
      hint: "サービス名（英字）",
      answer: "SMTP",
      explain:
        "メールサーバは、社外宛てのメールを宛先ドメインのメールサーバへ転送する。サーバ間の転送は SMTP（TCP 25）。",
    },
    {
      key: "c",
      hint: "記号",
      choices: [
        { key: "ア", text: "デフォルト拒否（ホワイトリスト方式）" },
        { key: "イ", text: "デフォルト許可（ブラックリスト方式）" },
        { key: "ウ", text: "多層防御" },
        { key: "エ", text: "フェールオープン" },
      ],
      answer: "ア",
      explain:
        "必要な通信だけを列挙して許可し、残りは全て拒否するのがデフォルト拒否（ホワイトリスト方式）。書き漏れがあっても、知らない通信は通らない側に倒れる。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "ステートフルインスペクション" },
        { key: "イ", text: "NAPT" },
        { key: "ウ", text: "ロードバランシング" },
        { key: "エ", text: "URL フィルタリング" },
      ],
      answer: "ア",
      explain:
        "ステートフルインスペクションは、許可した通信（宛先・送信元・ポート・TCP の状態）を覚え、その応答だけを自動で通す。応答のふりをした無関係のパケットは通さない。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        {
          key: "ア",
          text: "DMZ から社内 LAN への通信を FW で拒否しておけば，社内 LAN へは入れない",
        },
        { key: "イ", text: "DMZ はインターネットから見えない" },
        { key: "ウ", text: "DMZ のサーバは乗っ取られることがない" },
        { key: "エ", text: "社内 LAN の PC がマルウェアに感染しなくなる" },
      ],
      answer: "ア",
      explain:
        "表 1 には DMZ から社内 LAN へ許可するルールが無く、ルール 6 で拒否される。乗っ取られたサーバを踏み台にして社内へ広がるのを防ぐのが DMZ の役目。",
    },
  ],
  points: [
    "FW のルールは上から順に評価し、最初に当てはまったものを使う。最後に「全て拒否」を置く。",
    "ステートフルインスペクションは通信の状態を覚え、許可した通信の戻りを自動で通す。",
    "DMZ には外部に公開するサーバを置き、DMZ から社内 LAN への通信は原則拒否する。",
  ],
};
