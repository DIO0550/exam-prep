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
    },
    {
      key: "b",
      hint: "レコードのタイプ",
      answer: "MX",
      explain:
        "MX レコードは、そのドメイン宛てのメールを受けるサーバの名前と優先度を示す。U 社のサーバはその名前の A レコードも引いて、アドレスを知る。",
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
    },
    {
      key: "e",
      hint: "数値",
      answer: "587",
      explain:
        "サブミッションポート（587 番）では、SMTP-AUTH で利用者を確かめてから送信を受け付ける。OP25B の対象外なので、社外からも送れる。",
    },
  ],
  points: [
    "送信と転送は SMTP（サーバ間は 25 番、PC からの投稿は 587 番＋SMTP-AUTH）。受信は POP3（110）か IMAP4（143）。",
    "宛先ドメインのメールサーバは MX レコードで調べる。",
    "OP25B は内側から外の 25 番を止める。送信ドメイン認証（SPF・DKIM・DMARC）はなりすましを見破る別の対策。",
  ],
};
