import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { QUESTIONS } from "../data/questions";
import type { Question } from "../types";
import { QuizApp } from "./quiz-app";

const choiceText = (question: Question, index: number): string => {
  const choice = question.choices[index];
  if (!choice) throw new Error(`${question.id} に選択肢 ${index} が無い`);
  return choice.text;
};

const FIRST = QUESTIONS[0];
const CORRECT = choiceText(FIRST, FIRST.answer);
const WRONG = choiceText(FIRST, FIRST.answer === 0 ? 1 : 0);

const startQuiz = async (user: ReturnType<typeof userEvent.setup>) => {
  render(<QuizApp />);
  await user.click(screen.getByRole("button", { name: "演習を開始" }));
};

describe("QuizApp", () => {
  it("学習ホームから演習を開始すると 1 問目が出る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);

    expect(screen.getByRole("heading", { name: "問 01" })).toBeInTheDocument();
    expect(screen.getByText(FIRST.text)).toBeInTheDocument();
    expect(screen.getByText("1 / 8問")).toBeInTheDocument();
  });

  it("解答するまで「次の問題へ」は押せない", async () => {
    const user = userEvent.setup();
    await startQuiz(user);

    const next = screen.getByRole("button", { name: "次の問題へ" });
    expect(next).toBeDisabled();

    await user.click(screen.getByRole("button", { name: new RegExp(CORRECT) }));
    expect(next).toBeEnabled();
  });

  it("正解すると同じ画面に解説と出典が出る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);

    await user.click(screen.getByRole("button", { name: new RegExp(CORRECT) }));

    expect(screen.getByText(FIRST.explain)).toBeInTheDocument();
    expect(screen.getByText(`出典：${FIRST.source}`)).toBeInTheDocument();
    expect(screen.getByText(FIRST.figure.caption)).toBeInTheDocument();
  });

  it("間違えた問題は苦手登録に入る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);

    expect(screen.getByRole("button", { name: "苦手に登録" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: new RegExp(WRONG) }));

    expect(screen.getByRole("button", { name: "苦手登録済" })).toBeInTheDocument();
  });

  it("解説表示を「別画面」にすると解答後に解説画面へ移る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await user.click(screen.getByRole("button", { name: "別画面" }));

    await user.click(screen.getByRole("button", { name: new RegExp(CORRECT) }));

    expect(screen.getByRole("heading", { name: "正解" })).toBeInTheDocument();
    expect(screen.getByText(/あなたの解答：イ ／ 正解：/)).toBeInTheDocument();
    // 解説画面では問題の選択肢ボタンは出ない。
    expect(screen.queryByRole("button", { name: new RegExp(WRONG) })).not.toBeInTheDocument();
  });

  it("選択肢を除外すると打ち消し線が付く", async () => {
    const user = userEvent.setup();
    await startQuiz(user);

    const exclude = screen.getByRole("button", { name: "アを除外" });
    expect(exclude).toHaveAttribute("aria-pressed", "false");

    await user.click(exclude);

    expect(exclude).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(choiceText(FIRST, 0))).toHaveClass("line-through");
  });

  it("見直し画面の「不正解のみ」で間違えた問題だけが残る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await user.click(screen.getByRole("button", { name: new RegExp(WRONG) }));

    await user.click(screen.getByRole("button", { name: "問題一覧・見直し" }));
    expect(screen.getAllByText("未解答")).toHaveLength(QUESTIONS.length - 1);

    await user.click(screen.getByRole("button", { name: "不正解のみ" }));

    expect(screen.queryByText("未解答")).not.toBeInTheDocument();
    expect(screen.getByText("不正解")).toBeInTheDocument();
  });

  it("全問解き終えると結果画面に score が出る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);

    for (const question of QUESTIONS) {
      const answer = choiceText(question, question.answer);
      await user.click(screen.getByRole("button", { name: new RegExp(answer) }));
      await user.click(screen.getByRole("button", { name: /次の問題へ|結果を見る/ }));
    }

    const score = screen.getByText("SCORE").parentElement;
    expect(score).not.toBeNull();
    expect(within(score as HTMLElement).getByText("100")).toBeInTheDocument();
    expect(screen.getByText(/8問中 8問正解/)).toBeInTheDocument();
  });

  it("サイドバーで試験を切り替えると見出しが変わる", async () => {
    const user = userEvent.setup();
    render(<QuizApp />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("応用情報技術者試験");

    await user.click(screen.getByRole("button", { name: /基本情報技術者試験/ }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("基本情報技術者試験");
  });
});
