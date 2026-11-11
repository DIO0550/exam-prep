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
      steps: [
        "ブラウザにプロキシを設定すると、全ての要求をプロキシのアドレスとポートへ送る。本来の宛先（Web サーバ）は、要求の中の URL で伝える。",
        "設定したのは 192.168.1.50 の 8080 番なので、宛先のポートは 8080。",
        "Web サーバの 80 番や 443 番へ直接送るのではない。",
      ],
      figure: {
        type: "sequence",
        caption: "PC はプロキシの 8080 番へ送り、プロキシが代わりに Web サーバへ取りに行く",
        actors: ["PC", "プロキシサーバ", "Web サーバ"],
        steps: [
          { from: "PC", to: "プロキシサーバ", label: "GET http://www.example.jp/（宛先 :8080）" },
          { from: "プロキシサーバ", to: "Web サーバ", label: "GET /（宛先 :80）", tone: "accent" },
          { from: "Web サーバ", to: "プロキシサーバ", label: "応答", dashed: true },
          { from: "プロキシサーバ", to: "PC", label: "応答", dashed: true, tone: "ok" },
        ],
      },
    },
    {
      key: "b",
      hint: "HTTP のメソッド名",
      answer: "CONNECT",
      explain:
        "CONNECT メソッドで「www.example.jp の 443 番へつないで」と頼み、プロキシは TCP の接続をそのまま中継するトンネルを作る。TLS の中身はプロキシには見えない。",
      steps: [
        "HTTPS は通信の中身が暗号化されるので、プロキシは URL などの中身を読めない。そこで最初に、どこへつなぐかだけを平文で伝える。",
        "そのためのメソッドが CONNECT。「CONNECT www.example.jp:443」と送ると、プロキシは相手と TCP で接続し、以後はそのまま中継する（トンネル）。",
        "TLS の暗号化はブラウザと Web サーバの間で行うので、プロキシには中身が見えない。",
      ],
      figure: {
        type: "sequence",
        caption: "HTTPS は CONNECT でトンネルを作り、暗号化された中身はそのまま中継する",
        actors: ["PC", "プロキシサーバ", "Web サーバ"],
        steps: [
          { from: "PC", to: "プロキシサーバ", label: "CONNECT www.example.jp:443" },
          { from: "プロキシサーバ", to: "Web サーバ", label: "TCP で接続" },
          { from: "プロキシサーバ", to: "PC", label: "200 Connection established", dashed: true },
          { divider: "ここから先はトンネル" },
          {
            from: "PC",
            to: "Web サーバ",
            label: "TLS で暗号化した通信（プロキシは中継するだけ）",
            tone: "accent",
          },
        ],
      },
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
      steps: [
        "PC がプロキシを通らずに、直接インターネットへ出ていくのを防ぎたい。",
        "FW で、社内 LAN からの HTTP・HTTPS の送信元をプロキシサーバ（192.168.1.50）だけに限れば、PC から直接出る通信は拒否される。",
        "全ての PC を許可すると、プロキシを通らない抜け道ができてしまう。",
      ],
      figure: {
        type: "diagram",
        caption: "FW はプロキシからの通信だけを通し、PC から直接の通信は止める",
        nodes: [
          { id: "pc", label: "PC", col: 0, row: 0 },
          { id: "proxy", label: "プロキシサーバ\n192.168.1.50", col: 1.6, row: 0 },
          { id: "fw", label: "FW", col: 3.2, row: 0 },
          { id: "inet", label: "インターネット", col: 4.8, row: 0, shape: "cloud" },
        ],
        edges: [
          { from: "pc", to: "proxy", tone: "ok" },
          { from: "proxy", to: "fw", tone: "ok" },
          { from: "fw", to: "inet", label: "許可", tone: "ok" },
          {
            from: "pc",
            to: "fw",
            label: "直接は拒否",
            tone: "ng",
            blocked: true,
            via: [
              [0, 1],
              [3.2, 1],
            ],
          },
        ],
      },
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
      steps: [
        "FW の設定によって、Web の閲覧は全てプロキシサーバを通ることになる（空欄 c）。",
        "1 か所を必ず通るので、そこでアクセスログを取ったり、有害なサイトを遮断（URL フィルタリング）したり、利用者を認証したりできる。",
        "DNS が要らなくなるわけでも、暗号が強くなるわけでもない。外から見える送信元はプロキシサーバになり、PC のアドレスは見えない。",
      ],
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
      steps: [
        "「インターネットからの要求を受けて，内側の Web サーバへ中継する」のは、社内の利用者の代わりに外へ出るフォワードプロキシとは向きが逆。",
        "公開 Web サーバの手前に置いて、外からの要求を受けるものをリバースプロキシという。",
        "負荷分散、TLS の終端、キャッシュ、WAF（Web アプリケーションへの攻撃を止める）などに使う。",
      ],
      figure: {
        type: "table",
        caption: "フォワードプロキシとリバースプロキシ",
        headers: ["項目", "フォワードプロキシ", "リバースプロキシ"],
        rows: [
          ["置き場所", "社内の利用者の近く", "公開 Web サーバの手前"],
          ["受ける要求", "社内から外へ", "外から社内のサーバへ"],
          [
            "主な使いみち",
            "ログ、URL フィルタリング、利用者の認証、キャッシュ",
            "負荷分散、TLS の終端、キャッシュ、WAF",
          ],
        ],
      },
    },
  ],
  points: [
    "フォワードプロキシ：内側の利用者の代わりに外へアクセスする（キャッシュ・ログ・フィルタリング・認証）。",
    "HTTPS は CONNECT でトンネルを作るので、中身はプロキシにも見えない。",
    "リバースプロキシ：外からの要求を受けて内側のサーバへ渡す（負荷分散・TLS 終端・WAF）。",
  ],
};
