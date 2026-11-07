import type { DbDrill } from "../types";

/** 更新と制約：GRANT・REVOKE とビューによるアクセス制御。 */
export const DB_DRILL_31: DbDrill = {
  id: "db-drill-31",
  topic: "更新と制約",
  title: "権限を与える・取り消す",
  body: [
    {
      kind: "p",
      text: "U 社では，データベースの利用者ごとに操作できる範囲を決めている。商品の担当者 TANAKA には，商品の表の参照と更新を許可する。",
    },
    {
      kind: "code",
      caption: "図 1　権限を与える SQL 文",
      lines: ["{{a}} SELECT, UPDATE ON 商品 {{b}} TANAKA"],
    },
    {
      kind: "p",
      text: "その後，TANAKA は商品の参照だけを行うことになったので，更新の権限を取り消した。",
    },
    {
      kind: "code",
      caption: "図 2　権限を取り消す SQL 文",
      lines: ["{{c}} UPDATE ON 商品 FROM TANAKA"],
    },
    {
      kind: "p",
      text: "社員の表には給与の列がある。人事部以外の利用者 SUZUKI に，給与以外の列だけを参照させたい。このための方法として適切なものは {{d}} である。",
    },
  ],
  blanks: [
    {
      key: "a",
      hint: "SQL のキーワード",
      answer: "GRANT",
      explain:
        "権限を与えるのは GRANT 権限 ON 表 TO 利用者。権限には SELECT・INSERT・UPDATE・DELETE などがある。",
    },
    {
      key: "b",
      hint: "SQL のキーワード",
      answer: "TO",
      explain: "GRANT … ON 表 TO 利用者。与える相手は TO の後に書く。",
    },
    {
      key: "c",
      hint: "SQL のキーワード",
      answer: "REVOKE",
      explain:
        "権限を取り消すのは REVOKE 権限 ON 表 FROM 利用者。GRANT の TO に対して FROM になる。",
    },
    {
      key: "d",
      hint: "記号",
      choices: [
        {
          key: "ア",
          text: "給与の列を含まないビューを作り，そのビューに対する SELECT 権限だけを SUZUKI に与える",
        },
        {
          key: "イ",
          text: "社員の表に対する SELECT 権限を SUZUKI に与え，給与の列を NULL に更新する",
        },
        { key: "ウ", text: "社員の表に対する UPDATE 権限だけを SUZUKI に与える" },
        { key: "エ", text: "SUZUKI 用に社員の表を丸ごと複写した表を作り，SELECT 権限を与える" },
      ],
      answer: "ア",
      explain:
        "ビューは見せる列や行を絞った仮想表なので、元の表ではなくビューにだけ権限を与えれば、給与を見せずに済む。エの複写は元の表とずれていき、給与も含んだままになる。",
    },
  ],
  points: [
    "GRANT 権限 ON 対象 TO 利用者、REVOKE 権限 ON 対象 FROM 利用者。",
    "見せたい列・行だけのビューを作り、ビューに権限を与えると、細かいアクセス制御ができる。",
    "必要な権限だけを与えるのが最小権限の原則。",
  ],
};
