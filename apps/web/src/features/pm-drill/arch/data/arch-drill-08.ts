import type { ArchTopic, PmDrill } from "../../types";

/** Web システムと IoT の方式：LPWA と BLE、電池の持ち、エッジコンピューティング、MQTT の QoS。 */
export const ARCH_DRILL_08: PmDrill<ArchTopic> = {
  id: "arch-drill-08",
  topic: "Web システムと IoT の方式",
  title: "農場のセンサの通信方式と電池の持ちを考える",
  body: [
    {
      kind: "p",
      text: "H 社は，農場に置いた土壌センサの値を集めるシステムを作る。センサは電池で動き，最も遠いセンサはゲートウェイから 5 km 離れている。1 回に送るデータは数十バイトで，1 時間に 1 回送ればよい（図 1）。この条件に合う無線の方式は {{a}} である。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　センサの値を集める構成",
        nodes: [
          { id: "sensor", label: "土壌センサ", col: 0, row: 0 },
          { id: "phone", label: "作業者の\nスマートフォン", col: 0, row: 1.5 },
          { id: "gw", label: "ゲートウェイ", col: 2, row: 0, tone: "accent" },
          { id: "cloud", label: "クラウド", col: 4, row: 0, shape: "cloud" },
        ],
        edges: [
          { from: "sensor", to: "gw", label: "最大 5 km", dashed: true },
          { from: "phone", to: "sensor", label: "設定（数 m）", dashed: true },
          { from: "gw", to: "cloud", label: "MQTT" },
        ],
      },
    },
    {
      kind: "p",
      text: "センサの設定は，作業者がスマートフォンを数 m まで近づけて行う。この通信には，近距離で消費電力の小さい {{b}} を使う。",
    },
    {
      kind: "p",
      text: "センサの電池の容量は 2,400 mAh で，平均の消費電流は 0.1 mA である。電池は約 {{c}} 日もつ。",
    },
    {
      kind: "p",
      text: "ゲートウェイは，集めた値が異常かどうかをその場で判定し，異常なときだけすぐに管理者へ知らせ，正常な値は 1 日分をまとめてクラウドへ送る。このように，データが生まれる場所の近くで処理する方式を {{d}} という。",
    },
    {
      kind: "p",
      text: "ゲートウェイからクラウドへは MQTT で送る。異常の知らせは，通信が一時的に切れても，届くまで送り直してほしい。そこで，MQTT の QoS を {{e}} 以上にする。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "記号",
      choices: [
        { key: "ア", text: "LPWA" },
        { key: "イ", text: "無線 LAN（IEEE 802.11ac）" },
        { key: "ウ", text: "BLE" },
        { key: "エ", text: "NFC" },
      ],
      answer: "ア",
      explain:
        "LPWA（Low Power Wide Area）は、通信速度は低いが、消費電力が小さく、数 km 以上の広い範囲で使える無線の方式。少ないデータをまれに送るセンサに向く。",
      steps: [
        "条件は「電池で動く」「5 km 離れている」「数十バイトを 1 時間に 1 回」。",
        "消費電力が小さく、遠くまで届き、速度は低くてよい方式は LPWA。",
        "無線 LAN は消費電力が大きく届く範囲も狭い。BLE と NFC は近距離用。",
      ],
      figure: {
        type: "table",
        caption: "IoT で使う無線の方式の比べ方",
        headers: ["方式", "届く距離", "速度", "消費電力"],
        rows: [
          ["LPWA", "数 km 〜 十数 km", "低い", "小さい"],
          ["BLE", "数 m 〜 数十 m", "中くらい", "小さい"],
          ["無線 LAN", "数十 m", "高い", "大きい"],
          ["NFC", "数 cm", "低い", "小さい"],
        ],
      },
    },
    {
      key: "b",
      hint: "英字",
      answer: "BLE",
      accepts: ["Bluetooth Low Energy", "Bluetooth"],
      explain:
        "BLE（Bluetooth Low Energy）は、数 m 〜 数十 m の近距離で、消費電力を小さく抑えた Bluetooth の方式。多くのスマートフォンが対応している。",
      steps: [
        "条件は「スマートフォンと数 m」「消費電力が小さい」。",
        "スマートフォンが対応していて、近距離・省電力の方式は BLE（Bluetooth Low Energy）。",
        "センサの電池をなるべく減らさずに設定できる。",
      ],
    },
    {
      key: "c",
      hint: "数値（日）",
      answer: "1000",
      accepts: ["1,000"],
      explain: "2,400 mAh ÷ 0.1 mA ＝ 24,000 時間。24 で割って 1,000 日（約 2.7 年）。",
      steps: [
        "mAh（ミリアンペア時）は、何 mA を何時間流せるかを表す。",
        "2,400 ÷ 0.1 ＝ 24,000 時間。",
        "24,000 ÷ 24 ＝ 1,000 日。送信の回数を減らすと平均の消費電流が下がり、もっと長くもつ。",
      ],
      figure: {
        type: "calc",
        caption: "電池がもつ日数",
        lines: [
          { expr: "2,400 mAh ÷ 0.1 mA ＝ 24,000 時間", note: "容量 ÷ 平均の電流" },
          { expr: "24,000 ÷ 24 ＝ 1,000 日", note: "時間 → 日" },
        ],
      },
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "エッジコンピューティング" },
        { key: "イ", text: "グリッドコンピューティング" },
        { key: "ウ", text: "バッチ処理" },
        { key: "エ", text: "ストリーミング配信" },
      ],
      answer: "ア",
      explain:
        "データが生まれる場所の近く（エッジ）で処理し、必要なものだけをクラウドへ送る方式をエッジコンピューティングという。応答が速く、送る量も減らせる。",
      steps: [
        "ゲートウェイ（センサの近く）で異常を判定している。",
        "データの発生源の近くで処理する方式はエッジコンピューティング。",
        "異常はクラウドを往復せずにすぐ知らせられ、正常な値はまとめて送るので通信の量も減る。",
      ],
    },
    {
      key: "e",
      hint: "数値",
      answer: "1",
      explain:
        "MQTT の QoS は 0（最大 1 回、届かないこともある）、1（少なくとも 1 回、重複はあり得る）、2（ちょうど 1 回）の 3 段階。届くまで送り直すには QoS 1 以上にする。",
      steps: [
        "QoS 0 は送りっぱなしで、届いたかを確かめない。",
        "QoS 1 は、受け取った側の確認（PUBACK）が来るまで送り直す。重複して届くことはある。",
        "QoS 2 は、やり取りを増やして、ちょうど 1 回だけ届ける。届くまで送り直すなら 1 以上。",
      ],
      figure: {
        type: "table",
        caption: "MQTT の QoS",
        headers: ["QoS", "届け方", "確認"],
        rows: [
          ["0", "最大 1 回（届かないこともある）", "なし"],
          ["1", "少なくとも 1 回（重複はあり得る）", "PUBACK が来るまで送り直す"],
          ["2", "ちょうど 1 回", "4 回のやり取りで確かめる"],
        ],
      },
    },
  ],
  points: [
    "遠く・省電力・少量なら LPWA、近距離・省電力なら BLE。",
    "電池の持ち ＝ 容量（mAh）÷ 平均の電流（mA）で時間を出し、日に直す。",
    "近くで処理して必要なものだけ送るのがエッジ。MQTT の QoS は 0・1・2。",
  ],
};
