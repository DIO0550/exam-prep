import type { ArchTopic, PmDrill } from "../../types";

/** Web システムと IoT の方式：SPA と REST の Web API（メソッドと状態コード）、CDN とオリジンサーバ、キャッシュの更新。 */
export const ARCH_DRILL_07: PmDrill<ArchTopic> = {
  id: "arch-drill-07",
  topic: "Web システムと IoT の方式",
  title: "予約サイトを SPA と Web API で作り直す",
  body: [
    {
      kind: "p",
      text: "G 社は，会員向けの予約サイトを SPA（シングルページアプリケーション）で作り直す。ブラウザは最初に HTML・JavaScript・CSS を読み込み，その後は JavaScript から Web API を呼び出してデータだけを受け取り，画面の一部を書き換える。Web API は REST の考え方で設計し，データは {{a}} 形式でやり取りする。",
    },
    {
      kind: "table",
      caption: "表 1　Web API の一覧（抜粋）",
      headers: ["操作", "メソッド", "URI"],
      rows: [
        ["予約の一覧を取得する", "GET", "/reservations"],
        ["予約を新しく作る", "POST", "/reservations"],
        ["予約を取り消す", "{{b}}", "/reservations/{予約番号}"],
      ],
    },
    {
      kind: "p",
      text: "予約を新しく作ることに成功したとき，Web API は HTTP の状態コード {{c}} を返し，作った予約の URI を応答に含める。",
    },
    {
      kind: "p",
      text: "HTML・JavaScript・CSS や画像は，全国の利用者に近い場所から配信して表示を速くするため，{{d}} を使う。{{d}} の配信サーバは，手元に無いファイルを G 社の Web サーバ（{{e}} という）から取得して保存し，次からは保存したものを返す。",
    },
    {
      kind: "p",
      text: "JavaScript のファイルを更新したときに，配信サーバやブラウザに保存された古いファイルが使われ続けないよう，{{f}}。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "英字",
      answer: "JSON",
      explain:
        'JSON（JavaScript Object Notation）は、{ "名前": 値 } の形でデータを表す文字列の形式。JavaScript でそのまま扱いやすく、Web API で広く使われる。',
      steps: [
        "SPA は、HTML ではなくデータだけを受け取って画面を書き換える。",
        "JavaScript で扱いやすい、名前と値の組でデータを表す形式は JSON。",
        "XML でもやり取りできるが、今の Web API では JSON が主流。",
      ],
      figure: {
        type: "sequence",
        caption: "SPA は最初に画面を読み込み，後はデータだけをやり取りする",
        actors: ["ブラウザ", "Web サーバ", "Web API"],
        steps: [
          { from: "ブラウザ", to: "Web サーバ", label: "HTML・JavaScript・CSS を要求" },
          { from: "Web サーバ", to: "ブラウザ", label: "画面のもと", dashed: true },
          { divider: "ここから画面は書き換えるだけ" },
          { from: "ブラウザ", to: "Web API", label: "GET /reservations" },
          {
            from: "Web API",
            to: "ブラウザ",
            label: "予約の一覧（JSON）",
            dashed: true,
            tone: "accent",
          },
        ],
      },
    },
    {
      key: "b",
      hint: "HTTP のメソッド（英字）",
      answer: "DELETE",
      explain:
        "REST では、URI で対象（リソース）を示し、操作はメソッドで表す。取得は GET、作成は POST、更新は PUT（または PATCH）、削除は DELETE。",
      steps: [
        "REST では、URI は「何を」（/reservations/{予約番号} はその予約）を表す。",
        "「どうする」はメソッドで表す。取り消す（削除する）は DELETE。",
        "URI に「/cancel」のような動詞を入れず、メソッドで操作を分けるのが REST の考え方。",
      ],
      figure: {
        type: "table",
        caption: "REST のメソッドと操作",
        headers: ["メソッド", "操作", "例"],
        rows: [
          ["GET", "取得", "予約の一覧を見る"],
          ["POST", "作成", "予約を新しく作る"],
          ["PUT・PATCH", "更新", "予約の日時を変える"],
          ["DELETE", "削除", "予約を取り消す"],
        ],
      },
    },
    {
      key: "c",
      hint: "数値",
      answer: "201",
      explain:
        "201 Created は、要求によって新しいリソースを作ったことを表す。作ったリソースの URI は Location ヘッダで返す。",
      steps: [
        "200 番台は成功。200 OK は一般的な成功。",
        "新しく作ったことを特に示すのは 201 Created。",
        "ほかに、400 番台は要求の誤り（404 Not Found など）、500 番台はサーバの誤り。",
      ],
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "CDN" },
        { key: "イ", text: "VPN" },
        { key: "ウ", text: "DNS ラウンドロビン" },
        { key: "エ", text: "リバースプロキシ 1 台" },
      ],
      answer: "ア",
      explain:
        "CDN（Content Delivery Network）は、各地に置いた配信サーバに静的なファイルを保存し、利用者に近い配信サーバから返す。応答が速くなり、元の Web サーバの負荷も減る。",
      steps: [
        "条件は「全国の利用者に近い場所から配信する」。",
        "各地の配信サーバにファイルを保存しておいて配るのが CDN。",
        "リバースプロキシ 1 台では、利用者に近い場所から配ることにならない。",
      ],
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "オリジンサーバ" },
        { key: "イ", text: "エッジサーバ" },
        { key: "ウ", text: "プロキシサーバ" },
        { key: "エ", text: "権威 DNS サーバ" },
      ],
      answer: "ア",
      explain:
        "CDN が元のファイルを取りに行く、G 社の Web サーバをオリジンサーバという。利用者に近い配信サーバの方はエッジサーバと呼ぶ。",
      steps: [
        "CDN の配信サーバ（エッジサーバ）は、手元に無いファイルを元のサーバへ取りに行く。",
        "その元のサーバをオリジンサーバという。",
        "利用者からの要求の多くはエッジサーバで返るので、オリジンサーバの負荷が減る。",
      ],
    },
    {
      key: "f",
      hint: "記号",
      choices: [
        {
          key: "ア",
          text: "ファイル名に，内容から計算した値や版の番号を含め，更新のたびに名前を変える",
        },
        { key: "イ", text: "JavaScript のファイルを，HTML の中に毎回書き込んで送る" },
        { key: "ウ", text: "CDN を使うのをやめる" },
        { key: "エ", text: "利用者に，毎日ブラウザのキャッシュを消してもらう" },
      ],
      answer: "ア",
      explain:
        "名前が変われば、配信サーバもブラウザも別のファイルとして新しく取得する。HTML からは新しい名前を参照させる。古い名前のファイルは長く保存されても問題にならない。",
      steps: [
        "配信サーバとブラウザは、同じ名前のファイルを保存したものから返す。",
        "更新のたびにファイル名（例：app.3f9a1c.js）を変えれば、新しいファイルとして取りに行く。",
        "HTML は短い期間だけ保存させ、新しい名前を参照させる。利用者に操作を頼る方法は確実でない。",
      ],
    },
  ],
  points: [
    "SPA は Web API で JSON をやり取りする。REST は URI で対象、メソッドで操作を表す。",
    "201 Created は作成の成功。404 は見つからない、500 番台はサーバの誤り。",
    "CDN はエッジサーバから配り、オリジンサーバへ取りに行く。更新はファイル名を変えて伝える。",
  ],
};
