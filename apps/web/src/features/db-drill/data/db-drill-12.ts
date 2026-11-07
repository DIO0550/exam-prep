import { relationChoices } from "../relation-choices";
import type { DbDrill } from "../types";

/** E-R 図：多対多の関連を、連関エンティティで解消する。 */
export const DB_DRILL_12: DbDrill = {
  id: "db-drill-12",
  topic: "E-R 図",
  title: "研修の受講：多対多を解消する",
  body: [
    {
      kind: "p",
      text: "C 社では，社員が受講した社内研修を管理する。1 人の社員は複数の研修を受講し，1 つの研修は複数の社員が受講する。この関係を素直に書くと図 1 になる。",
    },
    {
      kind: "er",
      caption: "図 1　社員と研修の E-R 図（概念）",
      entities: [
        {
          id: "emp",
          name: "社員",
          col: 0,
          row: 0,
          attrs: [{ name: "社員番号", key: "pk" }, { name: "氏名" }],
        },
        {
          id: "course",
          name: "研修",
          col: 1,
          row: 0,
          attrs: [{ name: "研修コード", key: "pk" }, { name: "研修名" }, { name: "日数" }],
        },
      ],
      relations: [{ from: "emp", to: "course", kind: "N:M" }],
    },
    {
      kind: "p",
      text: "多対多の関連は，そのままでは関係データベースの表にできない。そこで，受講を表すエンティティを加えて図 2 のようにした。受講日と評価は，社員と研修の組ごとに 1 つ決まる。",
    },
    {
      kind: "er",
      caption: "図 2　受講を加えた E-R 図",
      entities: [
        {
          id: "emp",
          name: "社員",
          col: 0,
          row: 0,
          attrs: [{ name: "社員番号", key: "pk" }, { name: "氏名" }],
        },
        {
          id: "take",
          name: "受講",
          col: 1,
          row: 0,
          attrs: [
            { name: "社員番号", key: "pk" },
            { name: "{{a}}", key: "pk" },
            { name: "受講日" },
            { name: "評価" },
          ],
        },
        {
          id: "course",
          name: "研修",
          col: 2,
          row: 0,
          attrs: [{ name: "研修コード", key: "pk" }, { name: "研修名" }, { name: "日数" }],
        },
      ],
      relations: [
        { from: "emp", to: "take", blank: "b" },
        { from: "take", to: "course", blank: "c" },
      ],
    },
    {
      kind: "p",
      text: "受講のように，多対多の関連を解消するために間に置くエンティティを {{d}} という。",
    },
    {
      kind: "p",
      text: "後日，同じ社員が同じ研修を別の日に再受講できるようにすることになった。この場合は，受講の主キーに {{e}} を加える。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "属性名",
      answer: "研修コード",
      explain:
        "受講は「どの社員が、どの研修を」受けたかを表すので、両方の主キーを持つ。社員番号と研修コードの組が受講の主キーになり、それぞれが社員・研修を参照する外部キーも兼ねる（主キーの一部なので破線は付けない）。",
    },
    {
      key: "b",
      hint: "記号（引く線）",
      choices: relationChoices("社員", "受講"),
      answer: "イ",
      explain:
        "1 人の社員に受講が何件もあり、受講 1 件の社員は 1 人。社員が 1、受講が多なので、受講の側に矢印を向ける。",
    },
    {
      key: "c",
      hint: "記号（引く線）",
      choices: relationChoices("受講", "研修"),
      answer: "ウ",
      explain:
        "1 つの研修に受講が何件もあり、受講 1 件の研修は 1 つ。研修が 1、受講が多なので、受講の側（図の左）に矢印を向ける。多対多は、間のエンティティに向かう 2 本の 1 対多に分かれる。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        { key: "ア", text: "連関エンティティ" },
        { key: "イ", text: "スーパータイプ" },
        { key: "ウ", text: "サブタイプ" },
        { key: "エ", text: "ビュー" },
      ],
      answer: "ア",
      explain:
        "2 つのエンティティの組に対して 1 つずつ決まる事実（受講日・評価）を持たせるために置くのが連関エンティティ。スーパータイプ・サブタイプは「社員」と「正社員・契約社員」のような汎化の関係で使う。",
    },
    {
      key: "e",
      hint: "属性名",
      answer: "受講日",
      explain:
        "（社員番号，研修コード）だけでは、同じ社員の同じ研修の 2 回目が重複してしまう。別の日なら受講日で区別できるので、主キーを（社員番号，研修コード，受講日）にする。",
    },
  ],
  points: [
    "多対多は、間に連関エンティティを置いて 2 本の 1 対多に分ける。矢印は両方とも連関エンティティに向く。",
    "連関エンティティの主キーは、ふつう両側の主キーの組。同じ組が何度も現れるなら、区別できる属性を主キーに加える。",
    "組ごとに決まる属性（受講日・評価）は、両側のどちらでもなく連関エンティティに置く。",
  ],
};
