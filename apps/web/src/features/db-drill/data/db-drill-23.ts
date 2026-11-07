import type { DbDrill } from "../types";

/** 集約と副問合せ：グループごとの最大値を持つ行を求める。 */
export const DB_DRILL_23: DbDrill = {
  id: "db-drill-23",
  topic: "集約と副問合せ",
  title: "部署ごとに給与が最も高い社員を求める",
  body: [
    {
      kind: "p",
      text: "N 社の社員の表には，表 1 の行がある。",
    },
    {
      kind: "table",
      caption: "表 1　社員の行",
      headers: ["社員番号", "部署", "給与"],
      rows: [
        ["E1", "営業", "300"],
        ["E2", "営業", "450"],
        ["E3", "開発", "500"],
        ["E4", "開発", "500"],
        ["E5", "総務", "280"],
      ],
    },
    {
      kind: "p",
      text: "部署ごとの最高給与は，SELECT 部署, MAX(給与) FROM 社員 GROUP BY 部署 で求められ，結果は {{a}} 行になる。",
    },
    {
      kind: "p",
      text: "ところが，最高給与の社員番号も知りたくて SELECT 社員番号, 部署, MAX(給与) FROM 社員 GROUP BY 部署 と書くと，エラーになる。{{b}} からである。",
    },
    {
      kind: "p",
      text: "そこで，図 1 の SQL 文を作成した。",
    },
    {
      kind: "code",
      caption: "図 1　部署ごとに給与が最も高い社員を求める SQL 文",
      lines: [
        "SELECT X.社員番号, X.部署, X.給与",
        "  FROM 社員 X",
        " WHERE X.給与 = (SELECT {{c}}(Y.給与) FROM 社員 Y",
        "                  WHERE Y.部署 = X.部署)",
      ],
    },
    {
      kind: "p",
      text: "図 1 の実行結果は {{d}} 行になる。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "数値",
      answer: "3",
      explain: "部署は営業・開発・総務の 3 つ。GROUP BY は 1 グループにつき 1 行。",
    },
    {
      key: "b",
      hint: "記号",
      choices: [
        {
          key: "ア",
          text: "GROUP BY に書いていない社員番号は，グループに 1 つの値に決まらず SELECT に書けない",
        },
        { key: "イ", text: "MAX は数値の列にしか使えない" },
        { key: "ウ", text: "GROUP BY と MAX は同じ SQL 文で使えない" },
        { key: "エ", text: "社員番号は主キーなので SELECT に書けない" },
      ],
      answer: "ア",
      explain:
        "1 つのグループ（営業）には E1 と E2 の 2 行があり、社員番号が 1 つに決まらない。SELECT に書けるのは GROUP BY の列と集約関数だけ。",
    },
    {
      key: "c",
      hint: "集約関数",
      answer: "MAX",
      explain:
        "外側の社員（X）と同じ部署の最高給与を相関副問合せで求め、それと給与が等しい社員を残す。",
    },
    {
      key: "d",
      hint: "数値",
      answer: "4",
      explain:
        "営業は E2（450）、総務は E5（280）。開発は E3 と E4 がどちらも 500 で最高なので両方残る。合計 4 行。同点を 1 人に絞りたいなら、別の条件が要る。",
    },
  ],
  points: [
    "GROUP BY を使う SELECT には、GROUP BY の列と集約関数しか書けない。",
    "「グループの最大値を持つ行」は、相関副問合せで最大値を出して = で比べる。",
    "最大値が同点なら複数行が出る。結果の行数を問われたら同点に注意する。",
  ],
};
