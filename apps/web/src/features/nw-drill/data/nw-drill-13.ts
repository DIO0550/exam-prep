import type { NwDrill } from "../types";

const SERVER_ROLES = [
  { key: "ア", text: "フルサービスリゾルバ（キャッシュ DNS サーバ）" },
  { key: "イ", text: "権威 DNS サーバ" },
  { key: "ウ", text: "スタブリゾルバ" },
  { key: "エ", text: "DHCP サーバ" },
];

/** DHCP と DNS：名前解決の流れ、キャッシュと TTL。 */
export const NW_DRILL_13: NwDrill = {
  id: "nw-drill-13",
  topic: "DHCP と DNS",
  title: "名前解決の流れとキャッシュの TTL",
  body: [
    {
      kind: "p",
      text: "M 社の PC が www.example.jp の Web サーバへアクセスするときの名前解決の流れを図 1 に示す。PC は社内のキャッシュ DNS サーバに問い合わせ（①），キャッシュ DNS サーバは，ルート，jp，example.jp の順に DNS サーバへ問い合わせて答えを得る（②〜④）。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　www.example.jp の名前解決",
        nodes: [
          { id: "pc", label: "PC", col: 0, row: 1 },
          { id: "cache", label: "キャッシュ DNS\nサーバ", col: 1.6, row: 1 },
          { id: "root", label: "ルート\nDNS サーバ", col: 3.4, row: 0 },
          { id: "jp", label: "jp の\nDNS サーバ", col: 3.4, row: 1 },
          { id: "auth", label: "example.jp の\nDNS サーバ", col: 3.4, row: 2 },
        ],
        edges: [
          { from: "pc", to: "cache", arrow: "both", label: "①" },
          { from: "cache", to: "root", arrow: "both", label: "②" },
          { from: "cache", to: "jp", arrow: "both", label: "③" },
          { from: "cache", to: "auth", arrow: "both", label: "④" },
        ],
      },
    },
    {
      kind: "p",
      text: "①のように PC からの問合せを受け，答えが分かるまで他の DNS サーバへの問合せを繰り返すサーバを {{a}} という。",
    },
    {
      kind: "p",
      text: "④の example.jp の DNS サーバのように，ゾーンの情報を持ち，自分のゾーンについての問合せに答えるサーバを {{b}} という。",
    },
    {
      kind: "p",
      text: "キャッシュ DNS サーバは，得た答えを，レコードの TTL（秒）の間だけ覚えておく。TTL が 3600 なら，最長 {{c}} 分の間は，同じ名前の問合せに②〜④を行わずに答える。",
    },
    {
      kind: "p",
      text: "Web サーバを移設して IP アドレスを変えるときは，TTL を {{d}} おくと，古いアドレスがキャッシュに残る時間が短くなる。",
    },
    {
      kind: "p",
      text: "DNS の問合せと応答には，主に {{e}} の 53 番ポートが使われる。応答が大きいときやゾーン転送では TCP も使う。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: SERVER_ROLES,
      answer: "ア",
      explain:
        "利用者の代わりにルートから順にたどって答えを探し、得た答えをキャッシュするのがフルサービスリゾルバ。PC の中で問合せを出すだけの部品がスタブリゾルバ。",
      steps: [
        "①で PC から問合せを受け、②〜④で自分からルート、jp、example.jp の DNS サーバへ順に問い合わせている。",
        "利用者の代わりに答えが分かるまで問合せを繰り返し、得た答えを覚えておくサーバを、フルサービスリゾルバ（キャッシュ DNS サーバ）という。",
        "PC の中で問合せを出すだけの部品はスタブリゾルバ。権威 DNS サーバは自分のゾーンについて答えるだけで、他へ問い合わせて回らない。",
      ],
      figure: {
        type: "sequence",
        caption: "キャッシュ DNS サーバが、ルートから順にたどって答えを探す",
        actors: ["PC", "キャッシュ DNS", "ルート", "jp", "example.jp"],
        steps: [
          { from: "PC", to: "キャッシュ DNS", label: "www.example.jp は？" },
          { from: "キャッシュ DNS", to: "ルート", label: "www.example.jp は？" },
          { from: "ルート", to: "キャッシュ DNS", label: "jp のサーバへ", dashed: true },
          { from: "キャッシュ DNS", to: "jp", label: "www.example.jp は？" },
          { from: "jp", to: "キャッシュ DNS", label: "example.jp のサーバへ", dashed: true },
          { from: "キャッシュ DNS", to: "example.jp", label: "www.example.jp は？" },
          {
            from: "example.jp",
            to: "キャッシュ DNS",
            label: "A レコード（TTL 3600）",
            dashed: true,
            tone: "ok",
          },
          { from: "キャッシュ DNS", to: "PC", label: "答え", dashed: true, tone: "ok" },
          { over: ["キャッシュ DNS"], note: "TTL の間覚える" },
        ],
      },
    },
    {
      key: "b",
      hint: "記号",
      choices: SERVER_ROLES,
      answer: "イ",
      explain:
        "ゾーンの情報（ゾーンファイル）を持ち、そのゾーンについて責任を持って答えるのが権威 DNS サーバ。他のゾーンについては答えない。",
      steps: [
        "④の example.jp の DNS サーバは、example.jp のゾーンファイルを持っている。",
        "自分のゾーンについて、責任を持って最終的な答えを返すサーバを権威 DNS サーバという。",
        "ルートや jp の DNS サーバも、それぞれのゾーンの権威 DNS サーバで、下のゾーンのサーバを案内する（空欄 a の図）。",
      ],
    },
    {
      key: "c",
      hint: "数値",
      answer: "60",
      explain: "TTL の単位は秒。3,600 秒＝60 分。",
      steps: [
        "TTL の単位は秒。3600 は 3,600 秒。",
        "3,600 ÷ 60＝60 分。",
        "その間は、同じ名前の問合せにキャッシュから答え、②〜④の問合せをしない。",
      ],
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "移設の数日前から短くして" },
        { key: "イ", text: "移設の数日前から長くして" },
        { key: "ウ", text: "移設した直後に短くして" },
        { key: "エ", text: "移設した直後に長くして" },
      ],
      answer: "ア",
      explain:
        "移設した直後に短くしても、それより前に配った答えは元の長い TTL のままキャッシュに残る。元の TTL が切れるのを待てるよう、前もって短くしておく。",
      steps: [
        "キャッシュ DNS サーバは、答えを受け取ったときの TTL の間それを覚える。古いアドレスが残るのは、移設前に配った答えの TTL が切れるまで。",
        "移設した直後に TTL を短くしても、すでに配った答えは元の長い TTL のまま残る。",
        "元の TTL が切れるのを待てるよう、移設の数日前から短くしておく。移設が終わったら元の長さに戻す。",
      ],
      figure: {
        type: "table",
        caption:
          "TTL を短くする時期と、古いアドレスがキャッシュに残る最長の時間（短くした値が 300 秒のとき）",
        headers: ["やり方", "移設の直前に配った答えの TTL", "古いアドレスが残る最長の時間"],
        rows: [
          ["ア 数日前から 300 秒にしておく", "300 秒", "5 分"],
          ["ウ 移設の直後に 300 秒にする", "3600 秒（元のまま）", "60 分"],
        ],
      },
    },
    {
      key: "e",
      hint: "トランスポート層のプロトコル名",
      answer: "UDP",
      explain:
        "問合せと応答が 1 往復で済むので、接続の手順が要らない UDP を使う。FW では UDP と TCP の両方の 53 番を考える。",
      steps: [
        "DNS の問合せと応答は、1 回送って 1 回返ってくるだけの短いやり取り。",
        "接続を確立する手順（3 ウェイハンドシェイク）が要らない UDP を使うと、すぐに送れる。ポート番号は 53。",
        "応答が大きいときやゾーン転送では TCP の 53 番も使うので、FW では両方を考える。",
      ],
    },
  ],
  points: [
    "フルサービスリゾルバ（キャッシュ DNS サーバ）は、ルートから順にたどって答えを探し、TTL の間覚える。",
    "権威 DNS サーバは自分のゾーンの情報を持ち、それについてだけ答える。",
    "移設の前に TTL を短くしておくと切替えが早く伝わる。TTL の単位は秒。",
  ],
};
