import type { NwDrill } from "../types";

/** NAT とファイアウォール：メールサーバの公開（MX・A レコード、静的 NAPT）、OP25B と 587 番、踏み台の防止。 */
export const NW_DRILL_33: NwDrill = {
  id: "nw-drill-33",
  topic: "NAT とファイアウォール",
  title: "メールサーバを公開し，OP25B に対応する",
  body: [
    {
      kind: "p",
      text: "K 社は，ドメイン k-sha.example のメールを受け取るメールサーバ（192.168.10.25）を DMZ に置き，FW の静的 NAPT でインターネットに公開する。FW のグローバルアドレスは 203.0.113.25 である。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　K 社のメールサーバの公開",
        nodes: [
          { id: "other", label: "他社のメールサーバ", col: 0, row: 0 },
          { id: "fw", label: "FW", col: 2.2, row: 0, note: "203.0.113.25" },
          { id: "mail", label: "メールサーバ", col: 4.2, row: 0, note: "192.168.10.25" },
        ],
        edges: [
          { from: "other", to: "fw", label: "SMTP" },
          { from: "fw", to: "mail", label: "静的 NAPT" },
        ],
        groups: [{ label: "DMZ", col: 3.3, row: -0.55, w: 2.1, h: 1.95 }],
      },
    },
    {
      kind: "code",
      caption: "図 2　k-sha.example のゾーンファイル（抜粋）",
      lines: [
        "k-sha.example.       IN {{a}} 10 mail.k-sha.example.",
        "mail.k-sha.example.  IN A     {{b}}",
      ],
    },
    {
      kind: "table",
      caption: "表 1　FW の静的 NAPT の設定",
      headers: ["変換前の宛先", "変換後の宛先"],
      rows: [["203.0.113.25:25", "192.168.10.25:{{c}}"]],
    },
    {
      kind: "p",
      text: "他社のメールサーバは，k-sha.example の {{a}} レコードからメールサーバの名前を，A レコードからアドレスを得て，TCP の 25 番ポートへメールを送る。",
    },
    {
      kind: "p",
      text: "K 社の社員が自宅の PC から，K 社のメールサーバを使ってメールを送ろうとしたところ，送信できなかった。自宅のインターネット接続事業者（ISP）が，自社の利用者からインターネット上の他のメールサーバの 25 番ポートへの通信を遮断する OP25B を行っていたためである。そこで，メールソフトからの送信には {{d}} 番ポート（サブミッションポート）を使い，送信のときに利用者 ID とパスワードで認証する {{e}} を必須にする。",
    },
    {
      kind: "p",
      text: "また，K 社のメールサーバが，K 社と関係の無い第三者から第三者へのメールを中継すると，迷惑メールの踏み台にされる。そこで，{{f}} 以外のメールは中継しない設定にする。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "レコードの種類（英字）",
      answer: "MX",
      explain:
        "そのドメイン宛てのメールを受け取るサーバを示すのは MX レコード。値は優先度（10）とメールサーバのホスト名。",
      steps: [
        "他社のメールサーバは「k-sha.example 宛てのメールをどこへ送るか」を DNS で調べる。",
        "ドメイン宛てのメールの受け取り先を示すレコードは MX（Mail eXchanger）。",
        "MX の値はホスト名なので、そのアドレスは別の A レコード（2 行目）で引く。",
      ],
      figure: {
        type: "sequence",
        caption: "他社のメールサーバは MX → A の順に引いてから送る",
        actors: ["他社のメールサーバ", "K 社の DNS", "FW", "メールサーバ"],
        steps: [
          { from: "他社のメールサーバ", to: "K 社の DNS", label: "k-sha.example の MX は？" },
          {
            from: "K 社の DNS",
            to: "他社のメールサーバ",
            label: "mail.k-sha.example",
            dashed: true,
          },
          { from: "他社のメールサーバ", to: "K 社の DNS", label: "mail.k-sha.example の A は？" },
          { from: "K 社の DNS", to: "他社のメールサーバ", label: "203.0.113.25", dashed: true },
          { from: "他社のメールサーバ", to: "FW", label: "203.0.113.25:25 へ SMTP" },
          { from: "FW", to: "メールサーバ", label: "192.168.10.25:25 へ変換" },
        ],
      },
    },
    {
      key: "b",
      hint: "IP アドレス",
      answer: "203.0.113.25",
      explain:
        "インターネットから届くアドレスを登録する。メールサーバのプライベートアドレス 192.168.10.25 はインターネットから届かないので、FW のグローバルアドレス 203.0.113.25 を登録し、FW で変換する。",
      steps: [
        "このゾーンはインターネット上の他社のメールサーバが引くもの。",
        "192.168.10.25 はプライベートアドレスなので、インターネットからは届かない。",
        "インターネットから届く FW のグローバルアドレス 203.0.113.25 を登録し、FW の静的 NAPT でメールサーバへ転送する（空欄 a の図）。",
      ],
    },
    {
      key: "c",
      hint: "数値",
      answer: "25",
      explain:
        "メールサーバも SMTP の 25 番で待ち受けるので、宛先のアドレスだけ変え、ポートは 25 のまま転送する。",
      steps: [
        "他社のメールサーバは 25 番に送ってくる。",
        "メールサーバ側も、サーバ間の SMTP を 25 番で待ち受ける。",
        "宛先のアドレスだけを 192.168.10.25 に変え、ポートは 25 のままにする。",
      ],
    },
    {
      key: "d",
      hint: "数値",
      answer: "587",
      explain:
        "OP25B は、ISP の利用者から外部の 25 番への通信を止める。メールソフトからの送信は 587 番（サブミッションポート）を使えば止められない。",
      steps: [
        "OP25B（Outbound Port 25 Blocking）で止まるのは、外部のメールサーバの 25 番宛ての通信。",
        "メールソフトから自社のメールサーバへ送るときは、25 番ではなく 587 番（サブミッションポート）を使う。",
        "TLS で最初から暗号化する方式では 465 番も使われる。",
      ],
      figure: {
        type: "diagram",
        caption: "OP25B で 25 番は止まるが、587 番は通る",
        nodes: [
          { id: "pc", label: "自宅の PC", col: 0, row: 0.6 },
          { id: "isp", label: "ISP", col: 2, row: 0.6 },
          { id: "k25", label: "K 社のメールサーバ\n（25 番）", col: 4.1, row: 0, tone: "ng" },
          { id: "k587", label: "K 社のメールサーバ\n（587 番）", col: 4.1, row: 1.3, tone: "ok" },
        ],
        edges: [
          { from: "pc", to: "isp", arrow: "none" },
          { from: "isp", to: "k25", label: "25 番", blocked: true, tone: "ng" },
          { from: "isp", to: "k587", label: "587 番＋SMTP-AUTH", tone: "ok" },
        ],
      },
    },
    {
      key: "e",
      hint: "記号",
      choices: [
        { key: "ア", text: "SMTP-AUTH" },
        { key: "イ", text: "POP before SMTP" },
        { key: "ウ", text: "IMAP" },
        { key: "エ", text: "S/MIME" },
      ],
      answer: "ア",
      explain:
        "SMTP-AUTH は、メールを送信するときに SMTP の中で利用者 ID とパスワードで認証する仕組み。認証した利用者からのメールだけを外部へ中継するので、踏み台にもされにくい。",
      steps: [
        "条件は「送信のときに利用者 ID とパスワードで認証する」。",
        "SMTP の手順の中で認証するのが SMTP-AUTH。",
        "POP before SMTP は、先に POP で受信の認証をした IP アドレスからの送信を一定時間許す古い方式。IMAP は受信のプロトコル。",
      ],
    },
    {
      key: "f",
      hint: "記号",
      choices: [
        { key: "ア", text: "K 社宛てのメールと，認証した K 社の利用者が送るメール" },
        { key: "イ", text: "25 番ポートに届いた全てのメール" },
        { key: "ウ", text: "他社のメールサーバから届いた，他社宛てのメール" },
        { key: "エ", text: "件名が空でないメール" },
      ],
      answer: "ア",
      explain:
        "受け取ってよいのは K 社のドメイン宛てのメール、外部へ中継してよいのは認証した K 社の利用者が送るメールだけ。それ以外（第三者から第三者へ）を中継しないことで、オープンリレーにならない。",
      steps: [
        "第三者から第三者へのメールを中継するサーバはオープンリレーと呼ばれ、迷惑メールの踏み台にされる。",
        "外から届くメールは、K 社のドメイン宛てだけ受け取る。",
        "外へ中継するのは、SMTP-AUTH で認証した K 社の利用者（または社内のアドレス）から送られたメールだけにする。",
      ],
    },
  ],
  points: [
    "メールの受け取り先は MX レコード（ホスト名）→ A レコード（グローバルアドレス）の順に引かれる。",
    "プライベートアドレスのサーバは、FW の静的 NAPT でグローバルアドレスから転送して公開する。",
    "OP25B があるので、メールソフトからの送信は 587 番＋SMTP-AUTH。中継は自ドメイン宛てと認証済みの利用者に限る。",
  ],
};
