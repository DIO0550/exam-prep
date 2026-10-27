import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { GAIP_MOCK_5 } from "../data/gaip-mock-5";
import { QUESTION_SETS } from "../data/questions";
import { progressStore } from "../progress/store";
import { choiceKey } from "../types";
import { QuizApp } from "./quiz-app";

const QUESTIONS = QUESTION_SETS[0].questions;
const FIRST = QUESTIONS[0];
const singleAnswer = (question: (typeof QUESTIONS)[number]): number => {
  if (Array.isArray(question.answer)) {
    throw new Error("単一選択のテスト用問題が必要");
  }
  return question.answer;
};

const startQuiz = async (user: ReturnType<typeof userEvent.setup>) => {
  render(<QuizApp />);
  await user.click(screen.getByRole("button", { name: "演習を開始" }));
};

/** 今出ている問題の見出し（問 01 など）。 */
const heading = (index: number) =>
  screen.getByRole("heading", { name: `問 ${String(index + 1).padStart(2, "0")}` });

describe("演習のキー操作", () => {
  it("数字キーで選択肢を選んで解答し、Enter で次の問題へ進む", async () => {
    const user = userEvent.setup();
    await startQuiz(user);

    // シャッフルしていないので、並び順の n 番目が原本の n 番目
    await user.keyboard(String(singleAnswer(FIRST) + 1));
    expect(screen.getByText("（1/1問）")).toBeInTheDocument();
    expect(screen.getByText(`正解：${choiceKey(singleAnswer(FIRST))}`)).toBeInTheDocument();

    await user.keyboard("{Enter}");
    expect(heading(1)).toBeInTheDocument();
  });

  it("未解答のうちは Enter で進まない", async () => {
    const user = userEvent.setup();
    await startQuiz(user);

    await user.keyboard("{Enter}");
    expect(heading(0)).toBeInTheDocument();
    expect(screen.getByText("正答率 —")).toBeInTheDocument();
  });

  it("← → で前後の問題へ移る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);

    await user.keyboard("{ArrowLeft}");
    expect(heading(0)).toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(heading(1)).toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(heading(2)).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}");
    expect(heading(1)).toBeInTheDocument();
  });

  it("メモを書いている間は、数字や Enter を拾わない", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await user.click(screen.getByRole("button", { name: "メモ" }));

    const memo = screen.getByLabelText("メモ（文章）");
    await user.type(memo, "1{Enter}2{ArrowRight}");
    expect(memo).toHaveValue("1\n2");
    expect(screen.getByText("正答率 —")).toBeInTheDocument();
    expect(heading(0)).toBeInTheDocument();
  });

  it("解説を別画面にしていても、Enter で次の問題へ進む", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await user.click(screen.getByRole("button", { name: "別画面" }));
    // ボタンに当たったままの Enter はそのボタンを押すので、いったん外す。
    (document.activeElement as HTMLElement | null)?.blur();

    await user.keyboard(String(singleAnswer(FIRST) + 1));
    expect(screen.getByText(/あなたの解答：/)).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(heading(1)).toBeInTheDocument();
  });

  it("複数選択は数字キーで選び、Enter で確定する", async () => {
    const user = userEvent.setup();
    progressStore.selectSet("gaip-mock-5");
    await startQuiz(user);
    const answer = GAIP_MOCK_5[0]?.answer;
    if (!Array.isArray(answer)) throw new Error("複数選択のテスト用問題が必要");

    for (const index of answer) {
      await user.keyboard(String(index + 1));
    }
    expect(screen.getByText("正答率 —")).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(screen.getByText("（1/1問）")).toBeInTheDocument();
    expect(progressStore.snapshot().recent).toEqual([true]);
  });

  it("使えるキーを画面に出す", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    expect(screen.getByText(/キー操作：1〜4 ア〜エを選ぶ/)).toBeInTheDocument();
  });
});
