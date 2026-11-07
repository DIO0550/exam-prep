import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { QuizApp } from "@/features/quiz/components/quiz-app";

import { DB_DRILL_KEY } from "../store";

const openDrills = async (user: ReturnType<typeof userEvent.setup>) => {
  render(<QuizApp />);
  await user.click(screen.getByRole("button", { name: /^穴埋\s*応用情報 SQL・表 穴埋め/ }));
};

describe("SQL・表の穴埋めドリル", () => {
  it("左の試験の一覧から開け、分野ごとに問題が並ぶ", async () => {
    const user = userEvent.setup();
    await openDrills(user);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("SQL・表の穴埋めドリル");
    expect(screen.getByRole("region", { name: "表の設計" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "実行結果" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^穴埋\s*応用情報 SQL・表 穴埋め/ })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("空欄に書いて答え合わせすると、欄ごとの正誤・正解・解説と、まとめを出す", async () => {
    const user = userEvent.setup();
    await openDrills(user);
    await user.click(
      screen.getByRole("button", { name: /社員と部署を結合して一覧にする を解く$/ }),
    );

    // 左は問題文。SQL 文の空欄は枠
    expect(screen.getByText(/2020 年中に入社した社員/)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "空欄a" })).toBeInTheDocument();

    const answers = within(screen.getByRole("complementary", { name: "解答欄" }));
    // 大文字・小文字、全角・半角、空白の違いは問わない
    await user.type(answers.getByRole("textbox", { name: "空欄a の答え" }), "inner  join");
    await user.type(answers.getByRole("textbox", { name: "空欄b の答え" }), "ＯＮ");
    await user.type(answers.getByRole("textbox", { name: "空欄c の答え" }), "IN");
    const saved = JSON.parse(window.localStorage.getItem(DB_DRILL_KEY) ?? "{}");
    expect(saved.answers["db-drill-03"]).toMatchObject({ a: "inner  join", b: "ＯＮ" });

    await user.click(answers.getByRole("button", { name: "答え合わせ" }));
    expect(answers.getAllByText("○ 正解")).toHaveLength(2);
    expect(answers.getAllByText("× 不正解")).toHaveLength(2);
    expect(answers.getByText("2/4 正解")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "空欄c（不正解）" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "この問のまとめ" })).toBeInTheDocument();

    // 次の問題へ移ると、答え合わせの表示は戻る
    await user.click(answers.getByRole("button", { name: "次の問題へ" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("注文の無い顧客");
    expect(screen.queryByText("○ 正解")).not.toBeInTheDocument();

    // 一覧には、最後に答え合わせした結果が出る
    await user.click(screen.getByRole("button", { name: "← 穴埋めドリルの一覧へ" }));
    expect(screen.getByText(/^2\/4 正解/)).toBeInTheDocument();
  });

  it("選ぶ欄は、記号に中身を添えた選択肢から選ぶ", async () => {
    const user = userEvent.setup();
    await openDrills(user);
    await user.click(screen.getByRole("button", { name: /図書館の貸出管理.* を解く$/ }));
    const answers = within(screen.getByRole("complementary", { name: "解答欄" }));
    const slotB = answers.getByRole("combobox", { name: "空欄b の答え" });
    expect(
      within(slotB).getByRole("option", { name: "ウ　会員番号と蔵書番号" }),
    ).toBeInTheDocument();
    await user.selectOptions(slotB, "ウ");
    await user.click(answers.getByRole("button", { name: "答え合わせ" }));
    expect(screen.getByRole("img", { name: "空欄b（正解）" })).toBeInTheDocument();
  });

  it("E-R 図は図として描き、関連の空欄には引く線を選んで答える", async () => {
    const user = userEvent.setup();
    await openDrills(user);
    // E-R 図の分野が一覧の先頭に来る
    const [first] = screen.getAllByRole("button", { name: / を解く$/ });
    if (!first) throw new Error("解くボタンが無い");
    expect(first).toHaveAccessibleName(/^No\.1 ネットスーパーの注文/);
    await user.click(first);

    // 図はエンティティ・属性（主キー・外部キー）・関連・空欄を代替テキストに持つ
    const figure = screen.getByRole("img", { name: /^図 1　注文管理の E-R 図/ });
    expect(figure).toHaveAccessibleName(
      /注文明細（注文番号〔主〕、明細番号〔主〕、商品コード〔外〕、数量）/,
    );
    expect(figure).toHaveAccessibleName(/会員と注文の間は空欄b/);
    expect(figure).toHaveAccessibleName(/商品→注文明細（1 対多）/);
    expect(figure.querySelectorAll("rect").length).toBeGreaterThan(5);

    const answers = within(screen.getByRole("complementary", { name: "解答欄" }));
    const slotB = answers.getByRole("combobox", { name: "空欄b の答え" });
    expect(
      within(slotB).getByRole("option", { name: "イ　会員 → 注文（矢印：1 対多、注文 が多）" }),
    ).toBeInTheDocument();
    await user.selectOptions(slotB, "イ");
    await user.type(answers.getByRole("textbox", { name: "空欄a の答え" }), "カテゴリコード");
    await user.click(answers.getByRole("button", { name: "答え合わせ" }));
    expect(answers.getByText("2/4 正解")).toBeInTheDocument();
  });
});
