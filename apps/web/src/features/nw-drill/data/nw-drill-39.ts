import type { NwDrill } from "../types";

/** NAT とファイアウォール：プロキシを SWG に置き換えるときの PAC ファイル・FW のルール・SaaS の送信元制限。 */
export const NW_DRILL_39: NwDrill = {
  id: "nw-drill-39",
  topic: "NAT とファイアウォール",
  title: "社内のプロキシをクラウドの SWG に置き換える",
  body: [
    {
      kind: "p",
      text: "R 社は，社内のプロキシサーバを廃止し，クラウドで Web 通信を中継・検査するセキュア Web ゲートウェイ（SWG）のサービスに切り替える。PC のブラウザは，どの通信をどのプロキシに送るかを書いた設定ファイルを読み込んで使う。このファイルを {{a}} という。",
    },
    {
      kind: "code",
      caption: "図 1　切替え後の設定ファイル（抜粋）",
      lines: [
        "function FindProxyForURL(url, host) {",
        '  if (dnsDomainIs(host, ".r-sha.lan")) return "{{b}}";',
        '  return "PROXY swg.example-sase.net:8080";',
        "}",
      ],
    },
    {
      kind: "p",
      text: "社内のサーバ（*.r-sha.lan）宛ては SWG を通さずに直接接続し，それ以外は SWG へ送る。",
    },
    {
      kind: "table",
      caption: "表 1　切替え後の FW のルール（上から順に評価）",
      headers: ["番号", "送信元", "宛先", "宛先ポート", "動作"],
      rows: [
        ["1", "社内の PC", "SWG", "8080/TCP", "許可"],
        ["2", "社内の PC", "インターネット", "80/TCP，443/TCP", "{{c}}"],
        ["3", "全て", "全て", "全て", "拒否"],
      ],
    },
    {
      kind: "p",
      text: "ルール 2 で，PC からインターネットへ直接の Web 通信を {{c}} にしているのは，{{d}} ためである。",
    },
    {
      kind: "p",
      text: "R 社が使う SaaS は，これまで R 社の FW のグローバルアドレスからのアクセスだけを許可していた。切替え後は，SaaS へのアクセスの送信元が {{e}} になるので，SaaS 側の許可する送信元の設定を変える。また，SWG では，ダウンロードしたファイルを隔離した環境で実際に動かし，不審な動きをしないか調べる {{f}} の機能も使う。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: [
        { key: "ア", text: "PAC ファイル" },
        { key: "イ", text: "hosts ファイル" },
        { key: "ウ", text: "ゾーンファイル" },
        { key: "エ", text: "Cookie" },
      ],
      answer: "ア",
      explain:
        "PAC（Proxy Auto-Config）ファイルは、URL やホスト名ごとに、どのプロキシを使うか（または直接接続するか）を JavaScript の関数 FindProxyForURL で書いたもの。",
      steps: [
        "ブラウザが読み込む「どの通信をどのプロキシに送るか」の設定ファイル。",
        "図 1 の関数 FindProxyForURL は、PAC ファイルで決まった名前の関数。",
        "hosts ファイルは名前とアドレスの対応、ゾーンファイルは DNS サーバの設定。",
      ],
    },
    {
      key: "b",
      hint: "PAC の戻り値（英字）",
      answer: "DIRECT",
      explain:
        'PAC ファイルで、プロキシを使わず直接接続するときは "DIRECT" を返す。プロキシを使うときは "PROXY ホスト名:ポート" を返す。',
      steps: [
        "本文に「社内のサーバ（*.r-sha.lan）宛ては SWG を通さずに直接接続」とある。",
        "PAC ファイルで直接接続を表す戻り値は DIRECT。",
        '3 行目の "PROXY swg.example-sase.net:8080" は、それ以外を SWG へ送る指定。',
      ],
    },
    {
      key: "c",
      hint: "記号",
      choices: [
        { key: "ア", text: "拒否" },
        { key: "イ", text: "許可" },
      ],
      answer: "ア",
      explain:
        "SWG を経由しない直接の Web 通信を止めないと、PAC を無視するソフトやマルウェアが検査を受けずにインターネットへ出られてしまう。",
      steps: [
        "Web 通信は全て SWG で検査したい。SWG 宛ての 8080 番はルール 1 で許可している。",
        "PC からインターネットへの直接の 80・443 番を許可すると、SWG を通らない抜け道になる。",
        "よって拒否。ルール 3 でも結局拒否されるが、明示しておくと意図がはっきりし、ログでも見分けやすい。",
      ],
      figure: {
        type: "diagram",
        caption: "SWG を通らない直接の Web 通信は FW で止める",
        nodes: [
          { id: "pc", label: "社内の PC", col: 0, row: 0.7 },
          { id: "fw", label: "FW", col: 1.9, row: 0.7 },
          { id: "swg", label: "SWG", col: 3.8, row: 0, tone: "ok" },
          { id: "inet", label: "インターネット", col: 3.8, row: 1.5, shape: "cloud" },
        ],
        edges: [
          { from: "pc", to: "fw", arrow: "none" },
          { from: "fw", to: "swg", label: "8080 許可", tone: "ok" },
          { from: "fw", to: "inet", label: "80・443 拒否", tone: "ng", blocked: true },
        ],
      },
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        {
          key: "ア",
          text: "SWG による検査を受けない Web 通信（PAC を使わないソフトやマルウェアの通信）を防ぐ",
        },
        { key: "イ", text: "社内のサーバへの通信を速くする" },
        { key: "ウ", text: "SaaS の料金を下げる" },
        { key: "エ", text: "PC の IP アドレスを SWG に知られないようにする" },
      ],
      answer: "ア",
      explain:
        "PAC ファイルはブラウザが従う設定にすぎず、従わないソフトもある。FW で直接の通信を止めて初めて、全ての Web 通信が SWG を経由することが保証される。",
      steps: [
        "PAC ファイルはブラウザの設定で、従わないソフトやマルウェアは直接インターネットへ出ようとする。",
        "FW で直接の 80・443 番を拒否すれば、その通信は止まる。",
        "これで、インターネットへの Web 通信は SWG を通るものだけになり、検査とログが漏れなくそろう（空欄 c の図）。",
      ],
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "SWG のサービスのグローバルアドレス" },
        { key: "イ", text: "R 社の FW のグローバルアドレス" },
        { key: "ウ", text: "PC のプライベートアドレス" },
        { key: "エ", text: "SaaS 自身のアドレス" },
      ],
      answer: "ア",
      explain:
        "SaaS へのアクセスは SWG が中継するので、SaaS から見た送信元は SWG のグローバルアドレスになる。SaaS 側の許可リストを SWG のアドレス（R 社用に割り当てられたもの）に変える。",
      steps: [
        "切替え後は、PC → FW → SWG → SaaS の順に通る。",
        "SWG はプロキシなので、SaaS への接続は SWG が張り直す。送信元は SWG のアドレスになる。",
        "SaaS 側で R 社の FW のアドレスだけを許可したままだと、アクセスできなくなる。",
      ],
    },
    {
      key: "f",
      hint: "記号",
      choices: [
        { key: "ア", text: "サンドボックス" },
        { key: "イ", text: "URL フィルタリング" },
        { key: "ウ", text: "キャッシュ" },
        { key: "エ", text: "NAPT" },
      ],
      answer: "ア",
      explain:
        "ファイルを隔離した仮想環境（サンドボックス）で実際に動かし、ファイルの書換えや外部への通信などの不審な動きを見て、未知のマルウェアを見つける。",
      steps: [
        "条件は「隔離した環境で実際に動かし、不審な動きをしないか調べる」。",
        "砂場（サンドボックス）のように、外へ影響しない場所で試すのでサンドボックス。",
        "パターンファイルに無い未知のマルウェアも、動きから見つけられる。",
      ],
    },
  ],
  points: [
    'PAC ファイルの FindProxyForURL で、宛先ごとに "DIRECT" か "PROXY ホスト:ポート" を返す。',
    "FW で直接の Web 通信を止め、全ての通信が SWG を通るようにする。",
    "SWG 経由では SaaS から見た送信元が SWG のアドレスになる。サンドボックスで未知のマルウェアを調べる。",
  ],
};
