import type { NwDrill } from "../types";

/** TCP/IP とアプリケーション：メールの送信・転送・受信（SMTP・MX・IMAP4・OP25B・587）。 */
export const NW_DRILL_21: NwDrill = {
  id: "nw-drill-21",
  topic: "TCP/IP とアプリケーション",
  title: "メールが届くまでのプロトコル",
  body: [
    {
      kind: "p",
      text: "U 社の社員が V 社の社員へメールを送るときの流れを図 1 に示す。",
    },
    {
      kind: "figure",
      figure: {
        type: "diagram",
        caption: "図 1　メールの流れ",
        cell: { w: 130 },
        nodes: [
          { id: "pcU", label: "送信者の PC", col: 0, row: 0 },
          { id: "mailU", label: "U 社の\nメールサーバ", col: 1.7, row: 0 },
          { id: "mailV", label: "V 社の\nメールサーバ", col: 3.6, row: 0 },
          { id: "pcV", label: "受信者の PC", col: 5.3, row: 0 },
          { id: "dns", label: "DNS サーバ", col: 1.7, row: 1.4 },
        ],
        edges: [
          { from: "pcU", to: "mailU", label: "①" },
          { from: "mailU", to: "mailV", label: "②" },
          { from: "mailV", to: "pcV", label: "③" },
          { from: "mailU", to: "dns", arrow: "both", dashed: true, label: "問合せ" },
        ],
      },
    },
    {
      kind: "p",
      text: "①で PC から自社のメールサーバへメールを送るには，{{a}} を使う。",
    },
    {
      kind: "p",
      text: "U 社のメールサーバは，宛先のメールアドレスのドメイン名について DNS の {{b}} レコードを問い合わせ，V 社のメールサーバを知ってから②で転送する。",
    },
    {
      kind: "p",
      text: "受信者が③でメールを読むとき，メールをサーバに置いたまま，PC とスマートフォンのように複数の端末から同じ状態で読めるようにするには，{{c}} を使う。",
    },
    {
      kind: "p",
      text: "ISP の多くは，動的に割り当てたアドレスの端末から，ISP の外の 25 番ポートへの通信を遮断している。迷惑メールの送信を防ぐこの対策を {{d}} という。",
    },
    {
      kind: "p",
      text: "そのため，社外から自社のメールサーバへ送るときは，SMTP-AUTH で利用者を認証するサブミッションポートの {{e}} 番を使う。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "プロトコル名",
      answer: "SMTP",
      explain: "メールを送る（投稿する・転送する）のは SMTP。受け取るほうは POP3 か IMAP4。",
      steps: [
        "①は、送信者の PC から自社のメールサーバへメールを渡す（送る）部分。",
        "メールを送る・転送するプロトコルは SMTP。②のサーバ間の転送も SMTP。",
        "POP3 と IMAP4 は、③のように受信者がメールボックスから読み出すときに使う。",
      ],
      figure: {
        type: "diagram",
        caption: "送る・渡すのは SMTP、読むのは IMAP4 か POP3",
        cell: { w: 130 },
        nodes: [
          { id: "pcU", label: "送信者の PC", col: 0, row: 0 },
          { id: "mailU", label: "U 社の\nメールサーバ", col: 1.7, row: 0 },
          { id: "mailV", label: "V 社の\nメールサーバ", col: 3.6, row: 0 },
          { id: "pcV", label: "受信者の PC", col: 5.3, row: 0 },
          { id: "dns", label: "DNS サーバ", col: 1.7, row: 1.4 },
        ],
        edges: [
          { from: "pcU", to: "mailU", label: "① SMTP", tone: "accent" },
          { from: "mailU", to: "mailV", label: "② SMTP", tone: "accent" },
          { from: "mailV", to: "pcV", label: "③ IMAP4" },
          { from: "mailU", to: "dns", arrow: "both", dashed: true, label: "MX を引く" },
        ],
      },
    },
    {
      key: "b",
      hint: "レコードのタイプ",
      answer: "MX",
      explain:
        "MX レコードは、そのドメイン宛てのメールを受けるサーバの名前と優先度を示す。U 社のサーバはその名前の A レコードも引いて、アドレスを知る。",
      steps: [
        "U 社のメールサーバは、宛先のメールアドレスの @ の後ろ（V 社のドメイン名）から、送り先のメールサーバを探す。",
        "「そのドメイン宛てのメールを受けるサーバ」を示すのは MX レコード。優先度の値が小さいサーバから使う。",
        "MX にはサーバの名前が書かれているので、続けてその名前の A レコードを引き、IP アドレスを知ってから②で送る。",
      ],
    },
    {
      key: "c",
      hint: "記号",
      choices: [
        { key: "ア", text: "IMAP4" },
        { key: "イ", text: "POP3" },
        { key: "ウ", text: "SMTP" },
        { key: "エ", text: "SNMP" },
      ],
      answer: "ア",
      explain:
        "IMAP4 はメールをサーバに置いたまま読み、既読などの状態もサーバで持つ。POP3 は基本的に端末へ取り込んでサーバから消す使い方で、複数の端末で状態を合わせにくい。",
      steps: [
        "「メールをサーバに置いたまま」「複数の端末から同じ状態で読める」がキーワード。",
        "IMAP4 はメールをサーバに置いたまま読み、既読などの状態もサーバで持つ。だから PC とスマートフォンで同じ状態になる。",
        "POP3 は基本的に端末へ取り込んでサーバから消す使い方。SMTP は送信、SNMP はネットワーク機器の監視で、読むためのものではない。",
      ],
      figure: {
        type: "table",
        caption: "POP3 と IMAP4 の違い",
        headers: ["項目", "POP3", "IMAP4"],
        rows: [
          ["メールの置き場所", "端末に取り込む（サーバから消すことが多い）", "サーバに置いたまま"],
          ["既読などの状態", "端末ごとに持つ", "サーバで共有する"],
          ["ポート番号（暗号化したもの）", "110（995）", "143（993）"],
        ],
      },
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "OP25B（Outbound Port 25 Blocking）" },
        { key: "イ", text: "SPF" },
        { key: "ウ", text: "DKIM" },
        { key: "エ", text: "S/MIME" },
      ],
      answer: "ア",
      explain:
        "OP25B は、ISP の内側から外の 25 番への接続を止め、感染した PC が直接迷惑メールをばらまくのを防ぐ。SPF・DKIM は受け手が送信元のなりすましを見破る仕組み、S/MIME はメール本文の暗号化と署名。",
      steps: [
        "「ISP の外の 25 番ポートへの通信を遮断」「迷惑メールの送信を防ぐ」が手がかり。",
        "25 番（SMTP）は、メールサーバへ直接メールを渡すポート。感染した PC が直接 25 番へ送るのを、ISP の出口で止めるのが OP25B（Outbound Port 25 Blocking）。",
        "SPF・DKIM は受け手が送信元のなりすましを見破る仕組み、S/MIME はメールの暗号化と電子署名で、通信を遮断するものではない。",
      ],
      figure: {
        type: "diagram",
        caption: "OP25B：ISP の外の 25 番へは出られないが、587 番（認証付き）なら送れる",
        nodes: [
          { id: "pc", label: "社外の PC", col: 0, row: 0.7 },
          { id: "isp", label: "ISP の出口", col: 2, row: 0.7 },
          { id: "mx", label: "メールサーバの 25 番", col: 4.3, row: 0 },
          { id: "sub", label: "自社のメールサーバの\n587 番（SMTP-AUTH）", col: 4.3, row: 1.4 },
        ],
        edges: [
          { from: "pc", to: "isp" },
          { from: "isp", to: "mx", label: "遮断", tone: "ng", blocked: true },
          { from: "isp", to: "sub", label: "通る", tone: "ok" },
        ],
      },
    },
    {
      key: "e",
      hint: "数値",
      answer: "587",
      explain:
        "サブミッションポート（587 番）では、SMTP-AUTH で利用者を確かめてから送信を受け付ける。OP25B の対象外なので、社外からも送れる。",
      steps: [
        "OP25B で 25 番が使えないので、別のポートで自社のメールサーバへ送る必要がある。",
        "投稿用のサブミッションポートは 587 番。SMTP-AUTH で利用者（ID とパスワード）を確かめてから受け付ける。",
        "587 番は OP25B の対象外なので、社外からでも送れる（空欄 d の図）。",
      ],
    },
  ],
  points: [
    "送信と転送は SMTP（サーバ間は 25 番、PC からの投稿は 587 番＋SMTP-AUTH）。受信は POP3（110）か IMAP4（143）。",
    "宛先ドメインのメールサーバは MX レコードで調べる。",
    "OP25B は内側から外の 25 番を止める。送信ドメイン認証（SPF・DKIM・DMARC）はなりすましを見破る別の対策。",
  ],
};
