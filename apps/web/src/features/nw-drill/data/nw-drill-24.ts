import type { NwDrill } from "../types";

/** 無線 LAN と VPN：チャネルの割当て、周波数帯、ESSID、WPA2 と WPA3。 */
export const NW_DRILL_24: NwDrill = {
  id: "nw-drill-24",
  topic: "無線 LAN と VPN",
  title: "無線 LAN のチャネルと暗号化を決める",
  body: [
    {
      kind: "p",
      text: "Y 社は，事務所の西側・中央・東側に無線 LAN のアクセスポイント（AP1〜AP3）を置き，2.4 GHz 帯で使う（図 1）。2.4 GHz 帯のチャネルは 5 MHz おきに並んでいるが，1 つのチャネルが使う幅は約 20 MHz あるので，番号の近いチャネルどうしは周波数が重なり，互いに干渉する。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　AP の配置",
        nodes: [
          { id: "ap1", label: "AP1", col: 0, row: 0, note: "西側" },
          { id: "ap2", label: "AP2", col: 1.5, row: 0, note: "中央" },
          { id: "ap3", label: "AP3", col: 3, row: 0, note: "東側" },
          { id: "sw", label: "L2SW", col: 1.5, row: -1.1 },
        ],
        edges: [
          { from: "sw", to: "ap1", arrow: "none" },
          { from: "sw", to: "ap2", arrow: "none" },
          { from: "sw", to: "ap3", arrow: "none" },
        ],
      },
    },
    {
      kind: "p",
      text: "AP1 を 1 チャネルにしたとき，AP2 と AP3 をそれぞれ {{a}} チャネルにすると，3 台の周波数が重ならない。",
    },
    { kind: "p", text: "5 GHz 帯は 2.4 GHz 帯と比べて，{{b}}。" },
    {
      kind: "p",
      text: "端末は，AP が知らせる無線 LAN のネットワークの識別子である {{c}} を選んで接続する。",
    },
    {
      kind: "p",
      text: "通信の暗号化には WPA2 以降を使う。WPA2 の暗号化方式 CCMP は，暗号アルゴリズムに {{d}} を使う。",
    },
    {
      kind: "p",
      text: "WPA3 のパーソナルモードでは，事前共有鍵から鍵を作る手順を {{e}} に改め，盗聴したやり取りからパスフレーズを総当たりで割り出す攻撃（オフライン辞書攻撃）に強くした。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: [
        { key: "ア", text: "2 と 3" },
        { key: "イ", text: "6 と 11" },
        { key: "ウ", text: "3 と 5" },
        { key: "エ", text: "1 と 1" },
      ],
      answer: "イ",
      explain:
        "チャネルは 5 MHz おきなので、20 MHz 幅が重ならないには 5 つ以上離す。1・6・11 なら互いに重ならない。2 と 3 や 3 と 5 は近すぎて重なり、同じ 1 どうしは同じ周波数を取り合う。",
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        {
          key: "ア",
          text: "重ならないチャネルが多く，電子レンジなどの干渉を受けにくい",
        },
        { key: "イ", text: "障害物を回り込みやすく，遠くまで届きやすい" },
        { key: "ウ", text: "屋外でも全てのチャネルを自由に使える" },
        { key: "エ", text: "最大の通信速度が低い" },
      ],
      answer: "ア",
      explain:
        "5 GHz 帯はチャネルの数が多く、電子レンジや Bluetooth と同じ 2.4 GHz 帯の干渉を受けない。一方、周波数が高いので壁などの障害物に弱く、屋外では使えないチャネルもある。",
    },
    {
      key: "c",
      hint: "名前（英字）",
      answer: "ESSID",
      accepts: ["SSID"],
      explain:
        "ESSID（SSID）は無線 LAN のネットワークの名前。ESSID を知らせない設定（ステルス）は、それだけでは安全対策にならない。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "AES" },
        { key: "イ", text: "RC4" },
        { key: "ウ", text: "DES" },
        { key: "エ", text: "RSA" },
      ],
      answer: "ア",
      explain:
        "WPA2 の CCMP は AES を使う。RC4 は WEP や TKIP が使う古いストリーム暗号で、もう使わない。RSA は公開鍵暗号で、無線の通信の暗号化には使わない。",
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "SAE" },
        { key: "イ", text: "TKIP" },
        { key: "ウ", text: "WEP" },
        { key: "エ", text: "WPS" },
      ],
      answer: "ア",
      explain:
        "SAE（Simultaneous Authentication of Equals）は、盗聴したやり取りだけではパスフレーズを試せない鍵交換。WPA2 の PSK は 4 ウェイハンドシェイクを盗聴されるとオフラインで総当たりできた。",
    },
  ],
  points: [
    "2.4 GHz 帯で互いに重ならない組合せは 1・6・11（5 つ以上離す）。5 GHz 帯は重ならないチャネルが多い。",
    "ESSID はネットワークの名前。ステルスや MAC アドレスフィルタは補助で、暗号化と認証の代わりにはならない。",
    "WEP（RC4）と TKIP は使わない。WPA2 は AES（CCMP）、WPA3 は SAE で鍵を作る。",
  ],
};
