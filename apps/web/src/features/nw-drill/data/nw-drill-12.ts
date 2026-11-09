import type { NwDrill } from "../types";

/** DHCP と DNS：ゾーンファイルのリソースレコード（NS・A・MX・CNAME・PTR）。 */
export const NW_DRILL_12: NwDrill = {
  id: "nw-drill-12",
  topic: "DHCP と DNS",
  title: "ゾーンファイルにリソースレコードを書く",
  body: [
    {
      kind: "p",
      text: "L 社は，example.jp のゾーンを自社の権威 DNS サーバで管理している。ゾーンファイルの一部を図 1 に示す。@ はゾーンの名前（example.jp.）そのものを表す。",
    },
    {
      kind: "code",
      caption: "図 1　example.jp のゾーンファイル（一部）",
      lines: [
        "$ORIGIN example.jp.",
        "$TTL 3600",
        "; SOA レコードは省略",
        "@      IN  {{a}}     ns1.example.jp.",
        "ns1    IN  A      203.0.113.10",
        "www    IN  {{b}}     203.0.113.20",
        "@      IN  {{c}}     10 mail.example.jp.",
        "mail   IN  A      203.0.113.25",
        "shop   IN  {{d}}     www.example.jp.",
      ],
    },
    {
      kind: "p",
      text: "www.example.jp は Web サーバ，mail.example.jp はメールサーバで，shop.example.jp は www.example.jp の別名である。",
    },
    {
      kind: "p",
      text: "IP アドレス 203.0.113.20 から www.example.jp を引く逆引きには，{{e}} レコードを使う。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "レコードのタイプ",
      answer: "NS",
      explain:
        "ゾーンを管理する権威 DNS サーバを示すのは NS レコード。上位の jp のサーバにも同じ NS が登録され、問合せがここへ案内される。",
    },
    {
      key: "b",
      hint: "レコードのタイプ",
      answer: "A",
      explain:
        "ホスト名に IPv4 アドレスを対応付けるのは A レコード。IPv6 アドレスなら AAAA レコード。",
    },
    {
      key: "c",
      hint: "レコードのタイプ",
      answer: "MX",
      explain:
        "メールの宛先ドメイン（@example.jp）のメールサーバを示すのは MX レコード。10 は優先度で、値が小さいサーバほど先に使われる。",
    },
    {
      key: "d",
      hint: "レコードのタイプ",
      answer: "CNAME",
      explain:
        "別名を正式な名前に対応付けるのは CNAME。shop.example.jp を引くと www.example.jp に置き換えられ、その A レコードの 203.0.113.20 が返る。",
    },
    {
      key: "e",
      hint: "レコードのタイプ",
      answer: "PTR",
      explain:
        "逆引き（アドレス → 名前）は PTR レコード。20.113.0.203.in-addr.arpa. のように、アドレスを逆順に並べた名前に書く。",
    },
  ],
  points: [
    "A（名前 → IPv4）、AAAA（名前 → IPv6）、NS（権威サーバ）、MX（メールサーバと優先度）、CNAME（別名）、PTR（逆引き）、TXT（SPF などの文字列）。",
    "MX の優先度は値が小さいほど優先。値の大きいサーバを予備にできる。",
    "CNAME を付けた名前には他のレコードを置けない。そのため、ゾーンの頂点（@）には CNAME を置けない。",
  ],
};
