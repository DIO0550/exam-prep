import { relationChoices } from "../relation-choices";
import type { DbDrill } from "../types";

/** E-R 図：業務の記述から 1 対 1 と 1 対多を読み分け、1 対 1 を一意性制約で守る。 */
export const DB_DRILL_65: DbDrill = {
  id: "db-drill-65",
  topic: "E-R 図",
  title: "ホテルの予約と宿泊：1 対 1 と 1 対多を読む",
  body: [
    {
      kind: "p",
      text: "U 社はビジネスホテルを経営している。予約と宿泊の管理のデータベースを設計するにあたり，業務を次のように整理した。",
    },
    {
      kind: "p",
      text: "顧客は何回でも予約できる。予約 1 件では，シングルやツインなどの客室タイプを 1 つ指定する。客室は必ずどれか 1 つの客室タイプに属する。チェックインのときに，予約 1 件に客室を 1 室割り当てて宿泊を記録する。1 件の予約から作られる宿泊は 1 件だけで，予約の無い宿泊は無い。1 つの客室は，日を変えて何回も宿泊に使われる。",
    },
    {
      kind: "p",
      text: "これを基に作成した E-R 図（一部の関連と属性は空欄）を図 1 に示す。",
    },
    {
      kind: "er",
      caption: "図 1　予約と宿泊の E-R 図",
      entities: [
        {
          id: "customer",
          name: "顧客",
          col: 0,
          row: 0,
          attrs: [{ name: "顧客番号", key: "pk" }, { name: "氏名" }],
        },
        {
          id: "reserve",
          name: "予約",
          col: 1,
          row: 0,
          attrs: [
            { name: "予約番号", key: "pk" },
            { name: "顧客番号", key: "fk" },
            { name: "客室タイプコード", key: "fk" },
            { name: "到着日" },
            { name: "泊数" },
          ],
        },
        {
          id: "rtype",
          name: "客室タイプ",
          col: 2,
          row: 0,
          attrs: [{ name: "客室タイプコード", key: "pk" }, { name: "タイプ名" }, { name: "料金" }],
        },
        {
          id: "stay",
          name: "宿泊",
          col: 1,
          row: 1,
          attrs: [
            { name: "宿泊番号", key: "pk" },
            { name: "予約番号", key: "fk" },
            { name: "客室番号", key: "fk" },
            { name: "チェックイン日時" },
          ],
        },
        {
          id: "room",
          name: "客室",
          col: 2,
          row: 1,
          attrs: [{ name: "客室番号", key: "pk" }, { name: "{{a}}", key: "fk" }, { name: "階" }],
        },
      ],
      relations: [
        { from: "reserve", to: "rtype", blank: "b" },
        { from: "reserve", to: "stay", blank: "c" },
        { from: "stay", to: "room", blank: "d" },
        { from: "customer", to: "reserve", kind: "1:N" },
        { from: "rtype", to: "room", kind: "1:N" },
      ],
    },
    {
      kind: "p",
      text: "1 件の予約から 2 件の宿泊が記録されないよう，宿泊の予約番号に {{e}} 制約を付ける。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "属性名",
      answer: "客室タイプコード",
      explain:
        "客室は必ず 1 つの客室タイプに属するので、客室の側に客室タイプを指す外部キーを持たせる。",
    },
    {
      key: "b",
      hint: "記号（引く線）",
      choices: relationChoices("予約", "客室タイプ"),
      answer: "ウ",
      explain:
        "1 つの客室タイプは何件もの予約で指定され、予約 1 件の客室タイプは 1 つ。客室タイプが 1、予約が多なので、予約の側（図の左）に矢印を向ける。予約が外部キーの客室タイプコードを持つことからも分かる。",
    },
    {
      key: "c",
      hint: "記号（引く線）",
      choices: relationChoices("予約", "宿泊"),
      answer: "ア",
      explain:
        "1 件の予約から作られる宿泊は 1 件だけで、宿泊 1 件の予約も 1 件。1 対 1 なので矢印の無い線になる。",
    },
    {
      key: "d",
      hint: "記号（引く線）",
      choices: relationChoices("宿泊", "客室"),
      answer: "ウ",
      explain:
        "1 つの客室は何回も宿泊に使われ、宿泊 1 件の客室は 1 つ。客室が 1、宿泊が多なので、宿泊の側（図の左）に矢印を向ける。",
    },
    {
      key: "e",
      hint: "SQL のキーワード",
      answer: "UNIQUE",
      explain:
        "外部キーは同じ値の行を何行でも作れるので、そのままでは 1 対多になる。予約番号に一意性制約（UNIQUE）を付ければ、同じ予約の宿泊は 1 行に限られ、1 対 1 を守れる。",
    },
  ],
  points: [
    "「1 件の〜から 1 件だけ」「〜の無い…は無い」は 1 対 1、「何回も」「複数の」は 1 対多の手がかり。",
    "1 対 1 の関連を外部キーで表すときは、外部キーに UNIQUE 制約を付ける。",
    "関連の向きは、外部キーを持つ側が多。矢印は多の側に向ける。",
  ],
};
