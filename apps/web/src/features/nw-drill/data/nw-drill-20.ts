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
      steps: [
        "Web の閲覧に使う HTTP は TCP の 80 番。暗号化した HTTPS は、表 1 のとおり 443 番。",
        "HTTP 80 と HTTPS 443 は組で覚える。よく出る番号は下の表にまとめた。",
      ],
      figure: {
        type: "table",
        caption: "よく出るポート番号",
        headers: ["ポート番号", "サービス", "トランスポート層"],
        rows: [
          ["20・21", "FTP", "TCP"],
          ["22", "SSH", "TCP"],
          ["23", "TELNET", "TCP"],
          ["25", "SMTP（サーバ間の転送）", "TCP"],
          ["53", "DNS", "UDP（と TCP）"],
          ["67・68", "DHCP（サーバ・クライアント）", "UDP"],
          ["80", "HTTP", "TCP"],
          ["110", "POP3", "TCP"],
          ["123", "NTP", "UDP"],
          ["143", "IMAP4", "TCP"],
          ["443", "HTTPS", "TCP"],
          ["587", "サブミッション（メールの投稿）", "TCP"],
        ],
      },
    },
    {
      key: "b",
      hint: "数値",
      answer: "25",
      explain:
        "メールサーバ間の転送は SMTP の 25 番。PC からメールサーバへの投稿には、認証付きのサブミッションポート 587 番を使うことが多い。",
      steps: [
        "SMTP のうち、メールサーバどうしの転送に使うのは TCP の 25 番。",
        "PC からメールサーバへの投稿には、認証付きのサブミッションポート 587 番を使うことが多い。表 1 は「サーバ間の転送」なので 25 番。",
      ],
    },
    {
      key: "c",
      hint: "数値",
      answer: "53",
      explain: "DNS は 53 番。問合せは主に UDP、大きな応答やゾーン転送は TCP。",
      steps: [
        "DNS は UDP・TCP とも 53 番。問合せは主に UDP、大きな応答やゾーン転送は TCP を使う。",
        "FW で DNS を通すなら、UDP と TCP の両方の 53 番を考える。",
      ],
    },
    {
      key: "d",
      hint: "数値",
      answer: "22",
      explain: "SSH は TCP の 22 番。遠隔操作のほか、SFTP や SCP のファイル転送にも使う。",
      steps: [
        "SSH（暗号化した遠隔操作）は TCP の 22 番。",
        "隣の 23 番が、暗号化しない TELNET（空欄 f）。22 と 23 を取り違えないよう、組で覚える。",
        "SFTP や SCP のファイル転送も SSH の上で動くので、同じ 22 番を使う。",
      ],
    },
    {
      key: "e",
      hint: "プロトコル名",
      answer: "UDP",
      explain: "時刻を合わせる NTP は UDP の 123 番。DHCP（67・68）や SNMP（161）も UDP。",
      steps: [
        "時刻を合わせる NTP は、短い問合せと応答を繰り返すだけなので UDP を使う。ポート番号は 123。",
        "UDP を使う代表は DNS（53）、DHCP（67・68）、NTP（123）、SNMP（161）。表 1 のほかのサービスは TCP。",
      ],
    },
    {
      key: "f",
      hint: "プロトコル名",
      answer: "TELNET",
      explain:
        "TELNET（23 番）はパスワードも操作内容も平文で流れるので、盗聴されると丸見えになる。代わりに SSH を使う。",
      steps: [
        "本文に、暗号化しない遠隔操作で、ポート番号が 23 とある。",
        "これは TELNET。パスワードも操作の内容も平文で流れるので、盗聴されると丸見えになる。",
        "代わりに、通信を暗号化する SSH（22 番）を使う。",
      ],
    },
  ],
  points: [
    "FTP 20/21、SSH 22、TELNET 23、SMTP 25、DNS 53、DHCP 67/68、HTTP 80、POP3 110、NTP 123、IMAP4 143、SNMP 161、HTTPS 443、サブミッション 587、IMAPS 993、POP3S 995。",
    "DNS・DHCP・NTP・SNMP は主に UDP。",
  ],
};
