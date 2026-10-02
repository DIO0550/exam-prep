import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { GAIP_MOCK_5 } from "../data/gaip-mock-5";
import { parseRecord } from "../progress/record";
import { STORAGE_KEY } from "../progress/storage";
import { progressStore } from "../progress/store";
import { sourceId } from "../types";
import { QuizApp } from "./quiz-app";

const FIRST = GAIP_MOCK_5[0];
const ID = sourceId(FIRST.source);
const choice = (index: number) =>
  screen.getByRole("checkbox", { name: new RegExp(FIRST.choices[index]?.text ?? "") });
const submit = () => screen.getByRole("button", { name: "解答を確定" });
const start = async (user: ReturnType<typeof userEvent.setup>) => {
  progressStore.selectSet("gaip-mock-5");
  const view = render(<QuizApp />);
  expect(screen.getByText(/複数選択30問/)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "演習を開始" }));
  return view;
};

describe("複数選択の演習", () => {
  it("正答が3個の問題も、すべて選んで確定すれば正解になる", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(screen.getByRole("button", { name: "3" }));
    const choices = screen.getAllByRole("checkbox");
    for (const index of [3, 0, 1]) {
      await user.click(choices[index] as HTMLElement);
    }
    await user.click(submit());
    expect(screen.getByText("正解：ア・イ・エ")).toBeInTheDocument();
    expect(screen.getByText("（1/1問）")).toBeInTheDocument();
  });

  it("複数を選択・解除してから確定し、1問分だけ採点する", async () => {
    const user = userEvent.setup();
    await start(user);
    expect(submit()).toBeDisabled();
    choice(0).focus();
    await user.keyboard(" ");
    expect(choice(0)).toBeChecked();
    await user.click(choice(0));
    expect(submit()).toBeDisabled();
    await user.click(choice(2));
    await user.click(choice(0));
    expect(screen.getByText("正答率 —")).toBeInTheDocument();
    expect(progressStore.snapshot().recent).toEqual([]);
    await user.click(submit());
    expect(screen.getByText("（1/1問）")).toBeInTheDocument();
    expect(screen.getByText("正解：ア・ウ")).toBeInTheDocument();
    expect(choice(0)).toBeDisabled();
    expect(choice(2)).toBeChecked();
    expect(progressStore.snapshot().recent).toEqual([true]);
  });

  it.each([[0], [0, 1, 2]])("不足・余分な選択 %j は不正解で苦手登録に入る", async (...picked) => {
    const user = userEvent.setup();
    await start(user);
    for (const index of picked) {
      await user.click(choice(index));
    }
    await user.click(submit());
    expect(screen.getByText("不正解", { exact: true })).toBeInTheDocument();
    expect(progressStore.snapshot().attempts[ID]).toMatchObject({
      picked,
      revealed: true,
      weak: true,
    });
  });

  it("選択済みの項目を除外したら選択からも外し、除外解除後に再選択できる", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(choice(0));
    await user.click(screen.getByRole("button", { name: "選択肢アを除外" }));
    expect(choice(0)).not.toBeChecked();
    expect(choice(0)).toBeDisabled();
    expect(submit()).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "選択肢アを除外" }));
    await user.click(choice(0));
    expect(choice(0)).toBeChecked();
  });

  it("未確定の選択を保存し、別の問題から戻っても再マウントしても維持する", async () => {
    const user = userEvent.setup();
    const view = await start(user);
    await user.click(choice(2));
    const saved = parseRecord(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null"));
    expect(saved.attempts[ID]).toMatchObject({ picked: [2], revealed: false });
    await user.click(screen.getByRole("button", { name: "2" }));
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "1" }));
    expect(choice(2)).toBeChecked();
    view.unmount();
    render(<QuizApp />);
    await user.click(screen.getByRole("button", { name: "演習を開始" }));
    expect(choice(2)).toBeChecked();
    expect(screen.getByText("正答率 —")).toBeInTheDocument();
  });

  it("シャッフル中も内容で採点し、別画面の解説から取り消して選び直せる", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(screen.getByRole("button", { name: "シャッフル" }));
    await user.click(screen.getByRole("button", { name: "別画面" }));
    const options = screen.getAllByRole("checkbox");
    const keys = ["ア", "イ", "ウ", "エ"];
    const correctLabel = options
      .map((option, index) => (option === choice(0) || option === choice(2) ? keys[index] : null))
      .filter(Boolean)
      .join("・");
    await user.click(choice(2));
    await user.click(choice(0));
    await user.click(submit());
    expect(
      screen.getByText(`あなたの解答：${correctLabel} ／ 正解：${correctLabel}`),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /解答を取り消す/ }));
    expect(choice(0)).not.toBeChecked();
    expect(submit()).toBeDisabled();
    expect(progressStore.snapshot().recent).toEqual([]);
  });
});
