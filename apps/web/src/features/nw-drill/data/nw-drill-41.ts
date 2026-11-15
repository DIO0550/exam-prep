import type { NwDrill } from "../types";

/** 無線 LAN と VPN：ESSID ごとの VLAN（タグ VLAN）、PoE、2.4 GHz 帯のチャネル、プライバシーセパレータ、EAP-TLS。 */
export const NW_DRILL_41: NwDrill = {
  id: "nw-drill-41",
  topic: "無線 LAN と VPN",
  title: "社員用と来客用の無線 LAN を 1 台の AP で分ける",
  body: [
    {
      kind: "p",
      text: "T 社は，事務所に無線 LAN を導入する。社員用と来客用の 2 つの無線ネットワークを 1 台の AP で提供し，端末に見せる無線ネットワークの名前（{{a}}）を，社員用は staff，来客用は guest とする（図 1）。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　無線 LAN の構成",
        nodes: [
          { id: "pc", label: "社員の PC", col: 0, row: 0 },
          { id: "guest", label: "来客の端末", col: 0, row: 1.5 },
          { id: "ap", label: "AP", col: 1.9, row: 0.75, tone: "accent" },
          { id: "sw", label: "スイッチ", col: 3.7, row: 0.75 },
          { id: "l3", label: "L3SW", col: 5.5, row: 0.75 },
          { id: "radius", label: "RADIUS サーバ", col: 5.5, row: 2.1 },
        ],
        edges: [
          { from: "pc", to: "ap", label: "staff", dashed: true },
          { from: "guest", to: "ap", label: "guest", dashed: true },
          { from: "ap", to: "sw", label: "VLAN 10・20", arrow: "none" },
          { from: "sw", to: "l3", arrow: "none" },
          { from: "l3", to: "radius", arrow: "none" },
        ],
      },
    },
    {
      kind: "p",
      text: "AP は，staff の通信を VLAN 10，guest の通信を VLAN 20 に振り分け，スイッチへの 1 本のケーブルで両方を送る。このポートでは，フレームに VLAN の番号を書き込む {{b}} のタグ VLAN を使う。また，AP の電源は，天井の近くにコンセントが無いので，スイッチから LAN ケーブルを通して受け取る。この仕組みを {{c}} という。",
    },
    {
      kind: "p",
      text: "事務所には AP を 3 台置き，2.4 GHz 帯で，AP1 はチャネル 1，AP2 はチャネル 6 を使う。AP3 の電波は AP1 と AP2 の両方に届くので，どちらとも周波数が重ならないよう，AP3 には {{d}} を使う。",
    },
    {
      kind: "p",
      text: "guest では，同じ AP につながった来客の端末どうしが互いに通信できないよう，{{e}} を有効にする。staff では，IEEE 802.1X で RADIUS サーバが端末を認証する。パスワードではなく，PC に入れたクライアント証明書で認証する方式として {{f}} を使う。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "英字",
      answer: "ESSID",
      accepts: ["SSID"],
      explain:
        "ESSID（SSID）は、無線 LAN のネットワークを見分けるための名前。端末は ESSID を選んで AP に接続する。1 台の AP で複数の ESSID を出せる（マルチ SSID）。",
      steps: [
        "端末の画面に並ぶ「接続先の名前」が ESSID（SSID とも呼ぶ）。",
        "1 台の AP で staff と guest のように複数の ESSID を出せる。",
        "ESSID ごとに VLAN を分けると、社員と来客の通信を別のネットワークとして扱える（空欄 b）。",
      ],
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        { key: "ア", text: "IEEE 802.1Q" },
        { key: "イ", text: "IEEE 802.1X" },
        { key: "ウ", text: "IEEE 802.3at" },
        { key: "エ", text: "IEEE 802.11ax" },
      ],
      answer: "ア",
      explain:
        "IEEE 802.1Q は、イーサネットのフレームに VLAN ID を入れたタグを付ける規格。1 本のケーブル（トランクポート）で複数の VLAN のフレームを運べる。",
      steps: [
        "AP からスイッチへの 1 本のケーブルに、VLAN 10 と VLAN 20 のフレームが混ざって流れる。",
        "受け取ったスイッチがどちらの VLAN か分かるよう、フレームに VLAN ID のタグを付ける。",
        "このタグ VLAN の規格は IEEE 802.1Q。似た番号の 802.1X は認証、802.3at は PoE、802.11ax は無線 LAN の規格。",
      ],
      figure: {
        type: "table",
        caption: "似た番号の IEEE の規格",
        headers: ["規格", "決めていること"],
        rows: [
          ["IEEE 802.1Q", "タグ VLAN（フレームに VLAN ID を付ける）"],
          ["IEEE 802.1X", "ポートや無線 LAN につなぐ端末の認証"],
          ["IEEE 802.3af／at", "PoE（LAN ケーブルで電力を送る）"],
          ["IEEE 802.11a／g／n／ac／ax", "無線 LAN の通信方式"],
        ],
      },
    },
    {
      key: "c",
      hint: "英字",
      answer: "PoE",
      explain:
        "PoE（Power over Ethernet）は、LAN ケーブルでデータと一緒に電力を送る仕組み。AP や IP 電話、監視カメラを、コンセントの無い場所に置ける。",
      steps: [
        "AP の電源を、コンセントではなく LAN ケーブルから受け取りたい。",
        "LAN ケーブルで電力を送る仕組みを PoE（Power over Ethernet）という。",
        "スイッチ側が PoE に対応していて、つなぐ機器の消費電力の合計がスイッチの給電能力に収まる必要がある。",
      ],
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "チャネル 2" },
        { key: "イ", text: "チャネル 4" },
        { key: "ウ", text: "チャネル 7" },
        { key: "エ", text: "チャネル 11" },
      ],
      answer: "エ",
      explain:
        "2.4 GHz 帯のチャネルは 5 MHz 刻みだが、1 つの通信は約 20 MHz の幅を使う。チャネル番号を 5 つ以上離すと重ならないので、1・6 と重ならないのは 11。",
      steps: [
        "2.4 GHz 帯のチャネルは 5 MHz ずつずれているが、1 つのチャネルは約 20 MHz の幅を使うので、近い番号どうしは周波数が重なる。",
        "重ならないためには、チャネル番号を 5 つ以上離す（1・6・11 の組合せが代表）。",
        "チャネル 6 から 5 つ以上離れ、チャネル 1 とも重ならない選択肢は 11。7 は 6 と隣り合うので大きく重なる。",
      ],
      figure: {
        type: "timeline",
        caption:
          "チャネルごとに使う周波数の幅（目盛りはチャネル番号）。7 は 6 と重なり，11 は重ならない",
        span: 14,
        unit: "ch",
        tracks: [
          { label: "AP1（ch 1）", bars: [{ start: 0, length: 3, label: "ch 1", tone: 1 }] },
          { label: "AP2（ch 6）", bars: [{ start: 4, length: 4, label: "ch 6", tone: 2 }] },
          {
            label: "ウ（ch 7）",
            bars: [{ start: 5, length: 4, label: "ch 7（6 と重なる）", tone: 3 }],
          },
          { label: "エ（ch 11）", bars: [{ start: 9, length: 4, label: "ch 11", tone: 4 }] },
        ],
      },
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "プライバシーセパレータ" },
        { key: "イ", text: "MAC アドレスフィルタリング" },
        { key: "ウ", text: "ESSID のステルス機能" },
        { key: "エ", text: "ローミング" },
      ],
      answer: "ア",
      explain:
        "プライバシーセパレータ（AP アイソレーション）は、同じ AP につながった端末どうしの通信を AP で止める機能。来客の端末から、ほかの来客の端末を覗いたり攻撃したりできなくなる。",
      steps: [
        "条件は「同じ AP につながった端末どうしの通信を止める」。",
        "これを AP の機能で行うのがプライバシーセパレータ。",
        "MAC アドレスフィルタリングは接続できる端末を絞るもの、ステルスは ESSID を隠すもの、ローミングは AP を移っても通信を続けるもので、どれも端末どうしの通信は止めない。",
      ],
    },
    {
      key: "f",
      hint: "記号",
      choices: [
        { key: "ア", text: "EAP-TLS" },
        { key: "イ", text: "PEAP" },
        { key: "ウ", text: "WPA2-PSK（事前共有鍵）" },
        { key: "エ", text: "WEP" },
      ],
      answer: "ア",
      explain:
        "EAP-TLS は、サーバと端末の両方が電子証明書を出し合って認証する方式。パスワードを使わないので、パスワードの漏えいや使い回しの心配が無い。",
      steps: [
        "IEEE 802.1X の認証方式（EAP）のうち、端末側もクライアント証明書で認証するのは EAP-TLS。",
        "PEAP はサーバだけが証明書を使い、端末はパスワードで認証する。",
        "WPA2-PSK は全員が同じ鍵（パスフレーズ）を使う方式で、利用者ごとの認証にならない。WEP は破られた古い方式。",
      ],
      figure: {
        type: "sequence",
        caption: "IEEE 802.1X（EAP-TLS）の流れ",
        actors: ["社員の PC", "AP", "RADIUS サーバ"],
        steps: [
          { from: "社員の PC", to: "AP", label: "staff に接続を要求" },
          {
            from: "社員の PC",
            to: "RADIUS サーバ",
            label: "EAP-TLS：クライアント証明書を提示（AP が中継）",
          },
          { from: "RADIUS サーバ", to: "AP", label: "認証成功（VLAN 10）", dashed: true },
          { from: "AP", to: "社員の PC", label: "接続を許可", tone: "accent" },
        ],
      },
    },
  ],
  points: [
    "ESSID ごとに VLAN を分け、AP とスイッチの間は IEEE 802.1Q のタグ VLAN で運ぶ。AP の電源は PoE。",
    "2.4 GHz 帯はチャネル番号を 5 つ以上離す（1・6・11）。",
    "来客用はプライバシーセパレータで端末どうしを分ける。証明書で端末を認証するのは EAP-TLS。",
  ],
};
