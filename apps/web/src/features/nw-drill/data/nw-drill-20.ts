import type { NwDrill } from "../types";

/** TCP/IP とアプリケーション：よく使うサービスのポート番号。 */
export const NW_DRILL_20: NwDrill = {
  id: "nw-drill-20",
  topic: "TCP/IP とアプリケーション",
  title: "サービスとポート番号の表を埋める",
  body: [
    {
      kind: "p",
      text: "T 社では，FW のルールを見直すため，社内で使うサービスとポート番号を表 1 にまとめた。",
    },
    {
      kind: "table",
      caption: "表 1　サービスとポート番号",
      headers: ["サービス", "トランスポート層", "ポート番号"],
      rows: [
        ["HTTP", "TCP", "{{a}}"],
        ["HTTPS", "TCP", "443"],
        ["SMTP（サーバ間の転送）", "TCP", "{{b}}"],
        ["DNS", "UDP（と TCP）", "{{c}}"],
        ["SSH", "TCP", "{{d}}"],
        ["NTP", "{{e}}", "123"],
        ["POP3", "TCP", "110"],
        ["IMAP4", "TCP", "143"],
      ],
    },
    {
      kind: "p",
      text: "サーバを遠隔で操作するときは，通信を暗号化する SSH を使い，暗号化しない {{f}}（ポート番号 23）は使わないことにした。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "数値",
      answer: "80",
      explain: "HTTP は TCP の 80 番。HTTPS は 443 番。",
    },
    {
      key: "b",
      hint: "数値",
      answer: "25",
      explain:
        "メールサーバ間の転送は SMTP の 25 番。PC からメールサーバへの投稿には、認証付きのサブミッションポート 587 番を使うことが多い。",
    },
    {
      key: "c",
      hint: "数値",
      answer: "53",
      explain: "DNS は 53 番。問合せは主に UDP、大きな応答やゾーン転送は TCP。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "22",
      explain: "SSH は TCP の 22 番。遠隔操作のほか、SFTP や SCP のファイル転送にも使う。",
    },
    {
      key: "e",
      hint: "プロトコル名",
      answer: "UDP",
      explain: "時刻を合わせる NTP は UDP の 123 番。DHCP（67・68）や SNMP（161）も UDP。",
    },
    {
      key: "f",
      hint: "プロトコル名",
      answer: "TELNET",
      explain:
        "TELNET（23 番）はパスワードも操作内容も平文で流れるので、盗聴されると丸見えになる。代わりに SSH を使う。",
    },
  ],
  points: [
    "FTP 20/21、SSH 22、TELNET 23、SMTP 25、DNS 53、DHCP 67/68、HTTP 80、POP3 110、NTP 123、IMAP4 143、SNMP 161、HTTPS 443、サブミッション 587、IMAPS 993、POP3S 995。",
    "DNS・DHCP・NTP・SNMP は主に UDP。",
  ],
};
