import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DB_DRILL_KEY } from "@/features/db-drill/store";
import { QuizApp } from "@/features/quiz/components/quiz-app";

import { NW_DRILL_KEY } from "../store";

const openDrills = async (user: ReturnType<typeof userEvent.setup>) => {
  render(<QuizApp />);
  await user.click(screen.getByRole("button", { name: /^穴埋\s*応用情報 ネットワーク 穴埋め/ }));
};

describe("ネットワークの穴埋めドリル", () => {
  it("左の試験の一覧から開け、分野ごとに問題が並ぶ", async () => {
    const user = userEvent.setup();
    await openDrills(user);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "ネットワークの穴埋めドリル",
    );
    expect(screen.getByRole("region", { name: "構成と経路制御" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "IPv6 と新しい技術" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^穴埋\s*応用情報 ネットワーク 穴埋め/ }),
    ).toHaveAttribute("aria-current", "true");
    // SQL・表のドリルの行は選択中にならない
    expect(
      screen.getByRole("button", { name: /^穴埋\s*応用情報 SQL・表 穴埋め/ }),
    ).not.toHaveAttribute("aria-current");
  });

  it("構成図を描き、アドレスの書き方の違いを問わずに採点する", async () => {
    const user = userEvent.setup();
    await openDrills(user);
    const [first] = screen.getAllByRole("button", { name: / を解く$/ });
    if (!first) throw new Error("解くボタンが無い");
    expect(first).toHaveAccessibleName(/^No\.1 2 台のルータの経路表を完成させる/);
    await user.click(first);

    // 構成図は機器・アドレス・つながりを代替テキストに持つ
    const figure = screen.getByRole("img", { name: /^図 1　A 社のネットワーク構成。/ });
    expect(figure).toHaveAccessibleName(/LAN1（192\.168\.1\.0\/24）/);
    expect(figure).toHaveAccessibleName(/インターネット－ルータ R1（203\.0\.113\.0\/30）/);
    expect(figure.querySelectorAll("rect").length).toBeGreaterThan(4);

    const answers = within(screen.getByRole("complementary", { name: "解答欄" }));
    // スラッシュの前後の空白、全角の数字とピリオドは問わない
    await user.type(answers.getByRole("textbox", { name: "空欄a の答え" }), "192.168.2.0 / 23");
    await user.type(
      answers.getByRole("textbox", { name: "空欄b の答え" }),
      "２０３．０．１１３．１",
    );
    await user.type(answers.getByRole("textbox", { name: "空欄c の答え" }), "10.0.0.2");
    await user.selectOptions(answers.getByRole("combobox", { name: "空欄d の答え" }), "ア");
    const saved = JSON.parse(window.localStorage.getItem(NW_DRILL_KEY) ?? "{}");
    expect(saved.answers["nw-drill-01"]).toMatchObject({ a: "192.168.2.0 / 23", d: "ア" });
    // SQL・表のドリルの記録とは別のキーに置く
    expect(window.localStorage.getItem(DB_DRILL_KEY)).toBeNull();

    await user.click(answers.getByRole("button", { name: "答え合わせ" }));
    expect(answers.getByText("3/5 正解")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "空欄c（不正解）" })).toBeInTheDocument();
    // 表の中と段落の中の同じ空欄 a は、どちらも正解の色になる
    expect(screen.getAllByRole("img", { name: "空欄a（正解）" })).toHaveLength(2);
    expect(screen.getByRole("region", { name: "この問のまとめ" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "← 穴埋めドリルの一覧へ" }));
    expect(screen.getByText(/^3\/5 正解/)).toBeInTheDocument();
  });

  it("解答欄の境目をつまんで幅を変えられ、変えた幅は次に開いた問でも使う", async () => {
    const user = userEvent.setup();
    await openDrills(user);
    const solve = (index: number) => {
      const button = screen.getAllByRole("button", { name: / を解く$/ })[index];
      if (!button) throw new Error("解くボタンが足りない");
      return user.click(button);
    };
    await solve(0);

    const handle = screen.getByRole("button", { name: /^解答欄の幅を変える（今 400px/ });
    // 解答欄は右端に寄せてあるので、幅は画面の右端（jsdom では 1024px）からポインタまで
    fireEvent.pointerDown(handle);
    fireEvent.pointerMove(window, { clientX: 500 });
    fireEvent.pointerUp(window);
    expect(handle).toHaveAccessibleName(/今 524px/);
    // ← → でも変えられる
    handle.focus();
    await user.keyboard("{ArrowRight}");
    expect(handle).toHaveAccessibleName(/今 484px/);
    expect(window.localStorage.getItem("exam-prep:fill-drill-answer-width:v1")).toBe("484");

    await user.click(screen.getByRole("button", { name: "← 穴埋めドリルの一覧へ" }));
    await solve(1);
    expect(screen.getByRole("button", { name: /^解答欄の幅を変える/ })).toHaveAccessibleName(
      /今 484px/,
    );
  });
});
