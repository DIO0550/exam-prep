import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { QUESTION_SETS } from "../data/questions";
import { choiceKey, formatSource } from "../types";
import { QuizApp } from "./quiz-app";

const FIRST_SET = QUESTION_SETS[0];
const QUESTIONS = FIRST_SET.questions;
const FIRST = QUESTIONS[0];

/** 選択肢ボタンは読み上げ名がキー（ア〜エ）で始まる。除外ボタンは「選択肢〜を除外」。 */
const choiceButton = (index: number) =>
  screen.getByRole("button", { name: new RegExp(`^${choiceKey(index)}`) });

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
    expect(screen.getByText(`1 / ${QUESTIONS.length}問`)).toBeInTheDocument();
  });

  it("解答するまで「次の問題へ」は押せない", async () => {
    const user = userEvent.setup();
    await startQuiz(user);

    const next = screen.getByRole("button", { name: "次の問題へ" });
    expect(next).toBeDisabled();

    await user.click(choiceButton(FIRST.answer));
    expect(next).toBeEnabled();
  });

  it("正解すると同じ画面に解説と出典が出る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);

    await user.click(choiceButton(FIRST.answer));

    expect(screen.getByText(`出典：${formatSource(FIRST.source)}`)).toBeInTheDocument();
    if (FIRST.explain) expect(screen.getByText(FIRST.explain)).toBeInTheDocument();
  });

  it("出典は年度・期・試験区分・時間区分・問番号まで出る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await user.click(choiceButton(FIRST.answer));

    expect(
      screen.getByText(/^出典：令和\d年度 (春|秋)期 応用情報技術者試験 午前 問1/),
    ).toBeInTheDocument();
  });

  it("図のある問題では、原本から切り出した画像が basePath 付きで出る", async () => {
    // どの回が既定でも動くよう、図を持つ最初の問題を探して開く
    const target = QUESTIONS.findIndex((q) => q.stem?.image || q.choices.some((c) => c.image));
    expect(target).toBeGreaterThanOrEqual(0);
    const question = QUESTIONS[target];
    if (!question) throw new Error("図のある問題が無い");
    const image = question.stem?.image ?? question.choices.find((c) => c.image)?.image;
    if (!image) throw new Error("画像が取れない");

    const user = userEvent.setup();
    await startQuiz(user);
    await user.click(screen.getByRole("button", { name: new RegExp(`^${target + 1}$`) }));

    expect(screen.getByAltText(image.alt)).toHaveAttribute("src", `/exam-prep${image.src}`);
  });

  it("間違えた問題は苦手登録に入る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);

    expect(screen.getByRole("button", { name: "苦手に登録" })).toBeInTheDocument();

    await user.click(choiceButton(FIRST.answer === 0 ? 1 : 0));

    expect(screen.getByRole("button", { name: "苦手登録済" })).toBeInTheDocument();
  });

  it("解説表示を「別画面」にすると解答後に解説画面へ移る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await user.click(screen.getByRole("button", { name: "別画面" }));

    await user.click(choiceButton(FIRST.answer));

    expect(screen.getByRole("heading", { name: "正解" })).toBeInTheDocument();
    expect(screen.getByText(/あなたの解答：/)).toBeInTheDocument();
  });

  it("選択肢を除外すると打ち消し線が付く", async () => {
    const user = userEvent.setup();
    await startQuiz(user);

    const exclude = screen.getByRole("button", { name: "選択肢アを除外" });
    expect(exclude).toHaveAttribute("aria-pressed", "false");

    await user.click(exclude);

    expect(exclude).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(FIRST.choices[0]?.text ?? "")).toHaveClass("line-through");
  });

  it("見直し画面の「不正解のみ」で間違えた問題だけが残る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await user.click(choiceButton(FIRST.answer === 0 ? 1 : 0));

    await user.click(screen.getByRole("button", { name: "問題一覧・見直し" }));
    expect(screen.getAllByText("未解答")).toHaveLength(QUESTIONS.length - 1);

    await user.click(screen.getByRole("button", { name: "不正解のみ" }));

    expect(screen.queryByText("未解答")).not.toBeInTheDocument();
    expect(screen.getByText("不正解")).toBeInTheDocument();
  });

  it("全問正解すると結果画面が 100% を出す", { timeout: 60_000 }, async () => {
    // 80 問ぶんクリックするので、イベント間の既定の遅延を切る
    const user = userEvent.setup({ delay: null });
    await startQuiz(user);

    for (const question of QUESTIONS) {
      await user.click(choiceButton(question.answer));
      await user.click(screen.getByRole("button", { name: /次の問題へ|結果を見る/ }));
    }

    const score = screen.getByText("SCORE").parentElement;
    expect(score).not.toBeNull();
    expect(within(score as HTMLElement).getByText("100")).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${QUESTIONS.length}問中 ${QUESTIONS.length}問正解`)),
    ).toBeInTheDocument();
  });

  it("出題する回を切り替えると問題が入れ替わり、解答状況が消える", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await user.click(choiceButton(FIRST.answer));
    expect(screen.getByRole("button", { name: "次の問題へ" })).toBeEnabled();

    const other = QUESTION_SETS[1];
    if (!other) throw new Error("収録回が2つ以上必要");
    await user.selectOptions(screen.getByLabelText("出題する回"), other.id);

    // 学習ホームへ戻る
    expect(screen.getByRole("button", { name: "演習を開始" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "演習を開始" }));
    expect(screen.getByText(other.questions[0].text)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "次の問題へ" })).toBeDisabled();
  });

  it("サイドバーで試験を切り替えると見出しが変わる", async () => {
    const user = userEvent.setup();
    render(<QuizApp />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("応用情報技術者試験");

    await user.click(screen.getByRole("button", { name: /基本情報技術者試験/ }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("基本情報技術者試験");
  });
});
