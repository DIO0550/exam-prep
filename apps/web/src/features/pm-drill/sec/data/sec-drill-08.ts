import type { PmDrill, SecTopic } from "../../types";

/** メールと DNS の安全：SPF・DKIM・DMARC の TXT レコードを読み、空欄を埋める。 */
export const SEC_DRILL_08: PmDrill<SecTopic> = {
  id: "sec-drill-08",
  topic: "メールと DNS の安全",
  title: "SPF・DKIM・DMARC のレコードを書く",
  body: [
    {
      kind: "p",
      text: "W 社（ドメイン w-sha.example）の名をかたったメールが取引先に届いたため，送信ドメイン認証を設定する。W 社のメールは，送信用のメールサーバ（203.0.113.25）からだけ送る。W 社の DNS に登録する TXT レコードを図 1 に示す。",
    },
    {
      kind: "code",
      caption: "図 1　W 社の DNS に登録する TXT レコード",
      lines: [
        'w-sha.example.                IN TXT "v=spf1 ip4:203.0.113.25 {{a}}"',
        'sel1._domainkey.w-sha.example. IN TXT "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3…"',
        '_dmarc.w-sha.example.         IN TXT "v=DMARC1; p={{b}}; rua=mailto:dmarc-report@w-sha.example"',
      ],
    },
    {
      kind: "p",
      text: "1 行目は SPF のレコードで，末尾の {{a}} は「ここに挙げた IP アドレス以外から送られたメールは認証失敗として扱ってよい」という意味である。",
    },
    {
      kind: "p",
      text: "2 行目は DKIM のレコードで，p= の値は，受信側が電子署名の検証に使う {{c}} である。sel1 はセレクタと呼ばれ，署名のヘッダに書かれた値から，受信側が参照するレコードを決める。",
    },
    {
      kind: "p",
      text: "3 行目は DMARC のレコードで，認証に失敗したメールは受信を拒否してほしいので，p= に {{b}} を指定した。rua= には {{d}} を指定する。",
    },
    {
      kind: "p",
      text: "メールが途中のメールサーバで転送されると，SPF の認証に失敗することがある。これは {{e}} からである。DKIM は，署名の対象のヘッダと本文が変わらなければ，転送されても認証に成功する。また DMARC では，SPF や DKIM で認証したドメインが，メールのヘッダの From のドメインと一致すること（アライメント）を確かめるので，{{f}}。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SPF の記述（記号と英字）",
      answer: "-all",
      explain:
        "SPF のレコードの末尾の all は「それ以外の全て」を指す。前に付く記号で扱いが変わり、-all は fail（認証失敗）、~all は softfail（失敗の疑い）、?all は neutral を意味する。",
      steps: [
        "SPF のレコードは「v=spf1」で始まり、許可する送信元（ip4:203.0.113.25）を並べ、最後に「それ以外」の扱いを書く。",
        "「それ以外」は all で表し、前の記号で扱いを決める。認証失敗として扱ってよいなら「-」。",
        "よって -all。「~all」は失敗の疑い（softfail）で、受信側に強く拒否を求めない。",
      ],
      figure: {
        type: "table",
        caption: "SPF の all の前に付ける記号",
        headers: ["書き方", "結果", "意味"],
        rows: [
          ["-all", "fail", "挙げた送信元以外は認証失敗"],
          ["~all", "softfail", "挙げた送信元以外は失敗の疑い"],
          ["?all", "neutral", "判断しない"],
          ["+all", "pass", "どこからでも合格（使ってはいけない）"],
        ],
      },
    },
    {
      key: "b",
      hint: "DMARC のポリシー（英字）",
      answer: "reject",
      explain:
        "DMARC のポリシー p= は none（何もしない・報告だけ）、quarantine（隔離）、reject（拒否）の 3 つ。拒否してほしいので reject。",
      steps: [
        "DMARC のレコードの p= は、認証に失敗したメールを受信側にどう扱ってほしいかの宣言。",
        "値は none・quarantine・reject の 3 つで、拒否してほしいときは reject。",
        "導入直後はまず none で報告を受け、問題が無いことを確かめてから quarantine、reject と強めていくのが一般的。",
      ],
      figure: {
        type: "table",
        caption: "DMARC のポリシー（p=）",
        headers: ["値", "受信側の扱い", "使う場面"],
        rows: [
          ["none", "そのまま受信し、報告だけ送る", "導入直後の様子見"],
          ["quarantine", "迷惑メールのフォルダなどに隔離", "段階的に強めるとき"],
          ["reject", "受信を拒否", "なりすましを確実に止めたいとき"],
        ],
      },
    },
    {
      key: "c",
      hint: "記号",
      choices: [
        { key: "ア", text: "W 社の送信用メールサーバの公開鍵" },
        { key: "イ", text: "W 社の送信用メールサーバの秘密鍵" },
        { key: "ウ", text: "受信側のメールサーバの公開鍵" },
        { key: "エ", text: "電子署名そのもの" },
      ],
      answer: "ア",
      explain:
        "DKIM では、送信側のメールサーバが秘密鍵で署名し、検証用の公開鍵を自ドメインの DNS に公開する。p= の値がその公開鍵。秘密鍵は送信用のメールサーバだけが持つ。",
      steps: [
        "DKIM の署名は、W 社の送信用メールサーバが自分の秘密鍵で付ける。",
        "受信側は、署名のヘッダにある d=（ドメイン）と s=（セレクタ）から DNS のレコードを引き、公開鍵を得て検証する。",
        "DNS に公開するのは誰でも見てよい公開鍵。秘密鍵を DNS に載せることはない。",
      ],
      figure: {
        type: "sequence",
        caption: "DKIM：送信側が署名し、受信側は送信ドメインの DNS から公開鍵を引いて検証する",
        actors: ["W 社の送信サーバ", "受信側のサーバ", "W 社の DNS"],
        steps: [
          { over: ["W 社の送信サーバ"], note: "秘密鍵で署名（d=w-sha.example; s=sel1）" },
          { from: "W 社の送信サーバ", to: "受信側のサーバ", label: "署名付きのメール" },
          {
            from: "受信側のサーバ",
            to: "W 社の DNS",
            label: "sel1._domainkey.w-sha.example の TXT を問合せ",
          },
          { from: "W 社の DNS", to: "受信側のサーバ", label: "公開鍵（p=…）", dashed: true },
          { over: ["受信側のサーバ"], note: "公開鍵で署名を検証", tone: "ok" },
        ],
      },
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "受信側が認証の結果をまとめた集計レポートの送り先" },
        { key: "イ", text: "認証に失敗したメールの転送先" },
        { key: "ウ", text: "W 社の送信用メールサーバのアドレス" },
        { key: "エ", text: "取引先の問合せ窓口のアドレス" },
      ],
      answer: "ア",
      explain:
        "rua= には、受信側がまとめて送ってくる集計レポートの宛先を書く。W 社は、自社名義のメールがどこから送られ、どれだけ認証に失敗しているかを把握できる。",
      steps: [
        "DMARC には、受信側が認証の結果を送信ドメインの管理者に知らせる仕組みがある。",
        "rua= は集計レポート（aggregate report）の宛先。失敗したメールそのものを転送させるわけではない。",
        "レポートを見ると、なりすましメールの送信元や、設定の漏れた正規の送信元に気付ける。",
      ],
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        {
          key: "ア",
          text: "受信側から見た送信元の IP アドレスが，転送したメールサーバのものになる",
        },
        { key: "イ", text: "転送の途中でメールの本文が暗号化される" },
        { key: "ウ", text: "転送したメールサーバが電子署名を削除する" },
        { key: "エ", text: "転送したメールサーバが DNS を書き換える" },
      ],
      answer: "ア",
      explain:
        "SPF は、受信側に接続してきたサーバの IP アドレスを、送信ドメインの SPF レコードと照らし合わせる。転送されると接続してくるのは転送したサーバなので、W 社のレコードに無い IP アドレスになり、失敗する。",
      steps: [
        "SPF で比べるのは、受信側のメールサーバに SMTP で接続してきた相手の IP アドレス。",
        "途中で転送されると、最後に接続してくるのは転送したメールサーバで、その IP アドレスは W 社の SPF レコードに無い。",
        "DKIM は IP アドレスではなく署名を見るので、ヘッダと本文が変わらなければ転送されても成功する。",
      ],
    },
    {
      key: "f",
      hint: "記号",
      choices: [
        {
          key: "ア",
          text: "攻撃者が自分のドメインで SPF に合格させても，From を w-sha.example にしたメールは認証に失敗する",
        },
        { key: "イ", text: "メールの本文の盗聴を防げる" },
        { key: "ウ", text: "添付ファイルのマルウェアを検知できる" },
        { key: "エ", text: "W 社の社員が誤った宛先に送ったメールを取り消せる" },
      ],
      answer: "ア",
      explain:
        "SPF が確かめるのは封筒の差出人（MAIL FROM）のドメインで、利用者に見えるヘッダの From とは別。攻撃者は自分のドメインで SPF に合格させ、From だけ W 社にできてしまう。DMARC は From のドメインとの一致を求めるので、これを止められる。",
      steps: [
        "SPF で認証されるのは SMTP の MAIL FROM（封筒の差出人）のドメイン。利用者が見るヘッダの From は別に書ける。",
        "攻撃者は自分のドメインを MAIL FROM にして SPF に合格させ、ヘッダの From だけ w-sha.example にできる。",
        "DMARC は、認証したドメインとヘッダの From のドメインが一致するか（アライメント）を確かめるので、このなりすましを見抜ける。",
      ],
    },
  ],
  points: [
    "SPF＝送信元 IP アドレスを DNS で宣言（-all で失敗扱い）。DKIM＝秘密鍵で署名、公開鍵を DNS に公開。DMARC＝失敗時の扱い（none・quarantine・reject）と報告先を宣言。",
    "SPF は転送で失敗しやすい。DKIM は内容が変わらなければ転送されても成功する。",
    "DMARC はヘッダの From のドメインとの一致（アライメント）を確かめる。",
  ],
};
