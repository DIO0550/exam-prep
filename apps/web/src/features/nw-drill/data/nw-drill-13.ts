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
    },
    {
      key: "b",
      hint: "記号",
      choices: SERVER_ROLES,
      answer: "イ",
      explain:
        "ゾーンの情報（ゾーンファイル）を持ち、そのゾーンについて責任を持って答えるのが権威 DNS サーバ。他のゾーンについては答えない。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "60",
      explain: "TTL の単位は秒。3,600 秒＝60 分。",
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
    },
    {
      key: "e",
      hint: "トランスポート層のプロトコル名",
      answer: "UDP",
      explain:
        "問合せと応答が 1 往復で済むので、接続の手順が要らない UDP を使う。FW では UDP と TCP の両方の 53 番を考える。",
    },
  ],
  points: [
    "フルサービスリゾルバ（キャッシュ DNS サーバ）は、ルートから順にたどって答えを探し、TTL の間覚える。",
    "権威 DNS サーバは自分のゾーンの情報を持ち、それについてだけ答える。",
    "移設の前に TTL を短くしておくと切替えが早く伝わる。TTL の単位は秒。",
  ],
};
