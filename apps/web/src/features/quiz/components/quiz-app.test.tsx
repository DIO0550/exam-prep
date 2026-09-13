import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { QUESTION_SETS } from "../data/questions";
import { dayKey, RECORD_VERSION } from "../progress/record";
import { STORAGE_KEY } from "../progress/storage";
import { choiceKey, formatSource, sourceId } from "../types";
import { QuizApp } from "./quiz-app";

const FIRST_SET = QUESTION_SETS[0];
const QUESTIONS = FIRST_SET.questions;
const FIRST = QUESTIONS[0];

/** 選択肢ボタンは読み上げ名がキー（ア〜エ）で始まる。除外ボタンは「選択肢〜を除外」。 */
const choiceButton = (index: number) =>
  screen.getByRole("button", { name: new RegExp(`^${choiceKey(index)}`) });

const startQuiz = async (user: ReturnType<typeof userEvent.setup>) => {
  const view = render(<QuizApp />);
  await user.click(screen.getByRole("button", { name: "演習を開始" }));
  return view;
};

/** 出題する回を選び直す。 */
const selectSet = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  await user.click(screen.getByRole("button", { name: /^出題する回/ }));
  await user.click(screen.getByRole("option", { name: label }));
};

/** 学習ホームの記録カード（累計正答率・連続学習・苦手登録）。値と単位は別の要素で出る。 */
const statCard = (label: string) => {
  const card = screen.getByText(label).parentElement;
  if (!card) throw new Error(`${label} のカードが無い`);
  return within(card);
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

  it("次の問題へ進むと、読む位置が先頭に戻る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);

    // 長い問題を下まで読んだ状態を作る（右側の枠と、枠が積まれる狭い幅でのページの両方）
    const content = screen.getByRole("main").parentElement;
    if (!content) throw new Error("右側の枠が無い");
    content.scrollTop = 400;
    document.documentElement.scrollTop = 400;

    await user.click(choiceButton(FIRST.answer));
    await user.click(screen.getByRole("button", { name: "次の問題へ" }));

    expect(screen.getByRole("heading", { name: "問 02" })).toBeInTheDocument();
    expect(content.scrollTop).toBe(0);
    expect(document.documentElement.scrollTop).toBe(0);
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

  it("出題する回を切り替えると問題が入れ替わり、戻すと解答状況が残る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await user.click(choiceButton(FIRST.answer));
    expect(screen.getByRole("button", { name: "次の問題へ" })).toBeEnabled();

    const other = QUESTION_SETS[1];
    if (!other) throw new Error("収録回が2つ以上必要");
    await selectSet(user, other.label);

    // 学習ホームへ戻る。切り替えた先はまだ手つかず
    expect(screen.getByRole("button", { name: "演習を開始" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "演習を開始" }));
    expect(screen.getByText(other.questions[0].text)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "次の問題へ" })).toBeDisabled();

    // 元の回へ戻すと、さっきの解答から続けられる
    await selectSet(user, FIRST_SET.label);
    await user.click(screen.getByRole("button", { name: "演習を再開" }));
    expect(screen.getByRole("heading", { name: "問 02" })).toBeInTheDocument();
  });

  it("解答は保存され、開き直しても続きから解ける", async () => {
    const user = userEvent.setup();
    const view = await startQuiz(user);
    await user.click(choiceButton(FIRST.answer));

    view.unmount();
    render(<QuizApp />);

    expect(
      screen.getByText(new RegExp(`${QUESTIONS.length}問中 1問 解答済み`)),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "演習を再開" }));
    expect(screen.getByRole("heading", { name: "問 02" })).toBeInTheDocument();
  });

  it("学習記録は localStorage から読み直す", () => {
    const other = QUESTION_SETS[1];
    if (!other) throw new Error("収録回が2つ以上必要");
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: RECORD_VERSION,
        setId: other.id,
        attempts: {
          [sourceId(other.questions[0].source)]: {
            picked: other.questions[0].answer,
            revealed: true,
            flagged: false,
            weak: false,
            excluded: [],
          },
        },
        recent: [true],
        days: [dayKey(new Date())],
      }),
    );

    render(<QuizApp />);

    // 前に選んでいた回・累計正答率・連続学習日数が、サンプル値ではなく記録から出る
    expect(screen.getByRole("button", { name: /^出題する回/ })).toHaveAccessibleName(
      `出題する回 ${other.label}`,
    );
    expect(statCard("累計正答率").getByText("100")).toBeInTheDocument();
    expect(statCard("連続学習").getByText("1")).toBeInTheDocument();
    expect(screen.getByText("学習 1日連続")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "演習を再開" })).toBeInTheDocument();
  });

  it("学習記録を消すと、数字も解答状況も戻る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await user.click(choiceButton(FIRST.answer === 0 ? 1 : 0));
    await user.click(screen.getByRole("button", { name: "学習ホーム" }));
    expect(statCard("苦手登録").getByText("1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "学習記録を消す" }));
    await user.click(screen.getByRole("button", { name: "消す" }));

    expect(statCard("苦手登録").getByText("0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "演習を開始" })).toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("サイドバーと右側は、幅があるときそれぞれスクロールする", () => {
    render(<QuizApp />);

    const content = screen.getByRole("main").parentElement;
    expect(screen.getByRole("complementary")).toHaveClass("md:overflow-y-auto");
    expect(content).toHaveClass("md:overflow-y-auto");
  });

  it("サイドバーには収録済みの試験だけが並ぶ", () => {
    render(<QuizApp />);

    const sidebar = within(screen.getByRole("complementary"));
    expect(sidebar.getByRole("button", { name: /応用情報技術者試験/ })).toBeInTheDocument();
    // 問題を収録していない区分は載せない（押しても中身が無い項目にしないため）
    expect(sidebar.queryByRole("button", { name: /基本情報技術者試験/ })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("応用情報技術者試験");
  });
});
