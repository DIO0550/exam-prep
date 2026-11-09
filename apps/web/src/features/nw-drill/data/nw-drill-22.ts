import type { NwDrill } from "../types";

/** TCP/IP とアプリケーション：フォワードプロキシ（ポート・CONNECT・FW との組合せ）とリバースプロキシ。 */
export const NW_DRILL_22: NwDrill = {
  id: "nw-drill-22",
  topic: "TCP/IP とアプリケーション",
  title: "Web の閲覧をプロキシサーバ経由にする",
  body: [
    {
      kind: "p",
      text: "W 社では，社内の PC から Web サイトへのアクセスを，必ずプロキシサーバを経由させている（図 1）。PC のブラウザには，プロキシサーバとして 192.168.1.50 の 8080 番ポートを設定した。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　W 社の Web 閲覧の経路",
        nodes: [
          { id: "pc", label: "PC", col: 0, row: 0 },
          {
            id: "proxy",
            label: "プロキシサーバ",
            col: 1.6,
            row: 0,
            note: "192.168.1.50",
          },
          { id: "fw", label: "FW", col: 3.1, row: 0 },
          { id: "inet", label: "インターネット", col: 4.6, row: 0, shape: "cloud" },
        ],
        edges: [
          { from: "pc", to: "proxy" },
          { from: "proxy", to: "fw" },
          { from: "fw", to: "inet" },
        ],
      },
    },
    {
      kind: "p",
      text: "PC からの HTTP の要求は，宛先の Web サーバではなく，192.168.1.50 の {{a}} 番ポートへ送られる。",
    },
    {
      kind: "p",
      text: "HTTPS のサイトを見るときは，ブラウザはプロキシサーバに {{b}} メソッドで接続先を伝え，その後の暗号化された通信は，プロキシサーバがそのまま中継する。",
    },
    {
      kind: "p",
      text: "FW では，社内 LAN からインターネットへの HTTP と HTTPS は，{{c}} だけを許可する。こうすると，{{d}}。",
    },
    {
      kind: "p",
      text: "これとは逆に，インターネットからの要求を受けて，内側の Web サーバへ中継するものを {{e}} という。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "数値",
      answer: "8080",
      explain:
        "ブラウザは、プロキシを設定すると全ての要求をプロキシのアドレスとポートへ送り、本来の宛先は要求の中（URL）で伝える。",
    },
    {
      key: "b",
      hint: "HTTP のメソッド名",
      answer: "CONNECT",
      explain:
        "CONNECT メソッドで「www.example.jp の 443 番へつないで」と頼み、プロキシは TCP の接続をそのまま中継するトンネルを作る。TLS の中身はプロキシには見えない。",
    },
    {
      key: "c",
      hint: "記号",
      choices: [
        { key: "ア", text: "プロキシサーバからの通信" },
        { key: "イ", text: "全ての PC からの通信" },
        { key: "ウ", text: "DNS サーバからの通信" },
        { key: "エ", text: "インターネットから始まる通信" },
      ],
      answer: "ア",
      explain:
        "送信元をプロキシサーバに限れば、PC がプロキシを通らずに直接外へ出ることを FW で止められる。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        {
          key: "ア",
          text: "閲覧の記録や URL フィルタリングを，プロキシサーバでまとめてかけられる",
        },
        { key: "イ", text: "PC が DNS を使わなくてもよくなる" },
        { key: "ウ", text: "HTTPS の暗号が強くなる" },
        { key: "エ", text: "PC のアドレスがインターネットから直接見えるようになる" },
      ],
      answer: "ア",
      explain:
        "全ての閲覧がプロキシを通るので、アクセスログの取得、有害サイトの遮断、利用者の認証を 1 か所で行える。外から見える送信元はプロキシサーバになる。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "リバースプロキシ" },
        { key: "イ", text: "フォワードプロキシ" },
        { key: "ウ", text: "スタブリゾルバ" },
        { key: "エ", text: "DHCP リレーエージェント" },
      ],
      answer: "ア",
      explain:
        "リバースプロキシは公開 Web サーバの手前に置き、外からの要求を受けて内側のサーバへ渡す。負荷分散、TLS の終端、キャッシュ、WAF などに使う。",
    },
  ],
  points: [
    "フォワードプロキシ：内側の利用者の代わりに外へアクセスする（キャッシュ・ログ・フィルタリング・認証）。",
    "HTTPS は CONNECT でトンネルを作るので、中身はプロキシにも見えない。",
    "リバースプロキシ：外からの要求を受けて内側のサーバへ渡す（負荷分散・TLS 終端・WAF）。",
  ],
};
