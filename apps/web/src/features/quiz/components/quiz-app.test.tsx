import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { QUESTION_SETS } from "../data/questions";
import { NOTES_KEY } from "../notes/storage";
import { DEFAULT_NOTE_WIDTH, dayKey, NOTE_WIDTH_MAX, RECORD_VERSION } from "../progress/record";
import { STORAGE_KEY } from "../progress/storage";
import { TEXT_SCALE_RATIO } from "../text-scale";
import { choiceKey, formatSource, sourceId } from "../types";
import { QuizApp } from "./quiz-app";

const FIRST_SET = QUESTION_SETS[0];
const QUESTIONS = FIRST_SET.questions;
const FIRST = QUESTIONS[0];
const ANSWER_TEXT = FIRST.choices[FIRST.answer]?.text ?? "";

/** 選択肢ボタンは読み上げ名がキー（ア〜エ）で始まる。除外ボタンは「選択肢〜を除外」。 */
const choiceButton = (index: number) =>
  screen.getByRole("button", { name: new RegExp(`^${choiceKey(index)}`) });

/** 今出ている選択肢ボタンを、画面に並んでいる順で返す。 */
const choiceButtons = () => screen.getAllByRole("button", { name: /^[アイウエ]/ });

/** 選択肢の中身だけを並び順に取り出す（先頭のラベルは落とす）。 */
const choiceTexts = () =>
  choiceButtons().map((button) => (button.textContent ?? "").replace(/^[アイウエ]/, ""));

/** 中身で選択肢ボタンを引く。並べ替えるとラベルが変わるので、こちらで引く。 */
const choiceButtonOf = (text: string) => {
  const button = choiceButtons().find((candidate) => candidate.textContent?.includes(text));
  if (!button) throw new Error(`「${text}」の選択肢が無い`);
  return button;
};

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

/** メモを開く（開いていれば閉じる）。 */
const toggleNotes = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "メモ" }));
};

/**
 * 手書きの枠。jsdom は要素の大きさを持たないので、表示されているつもりの大きさを教える
 * （枠の幅が 0 のままだと、どこを触っても座標に直せない）。
 */
const sketchPad = () => {
  const pad = screen.getByLabelText("メモ（手書き）");
  vi.spyOn(pad, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 400,
    height: 300,
    right: 400,
    bottom: 300,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
  return pad;
};

/** 保存してある学習記録を読む。 */
const readRecord = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");

/** 学習ホームの記録カード（この回の正答率・連続学習・苦手登録）。値と単位は別の要素で出る。 */
const statCard = (label: string) => {
  const card = screen.getByText(label).parentElement;
  if (!card) throw new Error(`${label} のカードが無い`);
  return within(card);
};

describe("QuizApp", () => {
  it("演習中でも、解くたびにこの回の正答率が出る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);

    // 1 問目を解く前は母数が無いので、数字は出さない
    expect(screen.getByText("正答率 —")).toBeInTheDocument();

    await user.click(choiceButton(FIRST.answer));
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("（1/1問）")).toBeInTheDocument();

    // 2 問目を間違えると、その場で半分に落ちる
    await user.click(screen.getByRole("button", { name: "次の問題へ" }));
    const second = QUESTIONS[1];
    if (!second) throw new Error("2 問目が無い");
    await user.click(choiceButton((second.answer + 1) % second.choices.length));
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("（1/2問）")).toBeInTheDocument();
  });

  it("メモの幅はドラッグで変えられ、記録に残る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await toggleNotes(user);

    const handle = screen.getByRole("button", { name: /メモの幅を変える/ });

    // つまんで左へ引くと広がる（幅は画面の右端からポインタまで）
    fireEvent.pointerDown(handle);
    fireEvent.pointerMove(window, { clientX: window.innerWidth - 520 });
    fireEvent.pointerUp(window);

    expect(readRecord().noteWidth).toBe(520);

    // 端より外へは行かない
    fireEvent.pointerDown(handle);
    fireEvent.pointerMove(window, { clientX: window.innerWidth - 9999 });
    fireEvent.pointerUp(window);

    expect(readRecord().noteWidth).toBe(NOTE_WIDTH_MAX);
  });

  it("メモの幅はキーでも変えられる", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await toggleNotes(user);

    const handle = screen.getByRole("button", { name: /メモの幅を変える/ });
    handle.focus();
    await user.keyboard("{ArrowLeft}");

    expect(readRecord().noteWidth).toBeGreaterThan(DEFAULT_NOTE_WIDTH);
  });

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

  it("選択肢をシャッフルすると並びが変わり、正誤は選んだ中身で決まる", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    const original = choiceTexts();

    await user.click(screen.getByRole("button", { name: "シャッフル" }));

    const shuffled = choiceTexts();
    expect(shuffled).not.toEqual(original);
    expect([...shuffled].sort()).toEqual([...original].sort());

    const position = shuffled.findIndex((text) => text.includes(ANSWER_TEXT));
    await user.click(choiceButtonOf(ANSWER_TEXT));

    // 「正解：ウ」のラベルも、原本の記号ではなく並べ替えた後の位置で出る
    expect(screen.getByText(`正解：${choiceKey(position)}`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "次の問題へ" })).toBeEnabled();
  });

  it("シャッフル中は、出典に並べ替えた旨が出て、解説に原本の記号も併記される", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await user.click(screen.getByRole("button", { name: "シャッフル" }));

    await user.click(choiceButtonOf(ANSWER_TEXT));

    expect(
      screen.getByText(`出典：${formatSource(FIRST.source, "選択肢の順序を入れ替えて表示")}`),
    ).toBeInTheDocument();
    expect(screen.getByText(`原本 ${choiceKey(FIRST.answer)}`)).toBeInTheDocument();
  });

  it("解答したあとに切り替えても、正解と自分の解答は同じ選択肢に付く", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await user.click(choiceButton(FIRST.answer));

    await user.click(screen.getByRole("button", { name: "シャッフル" }));

    expect(choiceButtonOf(ANSWER_TEXT).textContent).toContain("正解");
    await user.click(screen.getByRole("button", { name: "原本順" }));
    expect(choiceButtonOf(ANSWER_TEXT).textContent).toContain("正解");
  });

  it("原本の図が選択肢の記号を指す問題は、シャッフル中でも原本の並びのまま出す", async () => {
    const set = QUESTION_SETS.find((candidate) =>
      candidate.questions.some((question) => question.keepChoiceOrder),
    );
    if (!set) throw new Error("並べ替えを止めている問題が無い");
    const target = set.questions.findIndex((question) => question.keepChoiceOrder);
    const question = set.questions[target];
    if (!question) throw new Error("問題が取れない");

    const user = userEvent.setup();
    render(<QuizApp />);
    await user.click(screen.getByRole("button", { name: "シャッフル" }));
    await selectSet(user, set.label);
    await user.click(screen.getByRole("button", { name: /^演習を(開始|再開)/ }));
    await user.click(screen.getByRole("button", { name: new RegExp(`^${target + 1}$`) }));

    expect(choiceTexts()).toEqual(question.choices.map((choice) => choice.text));
  });

  it("シャッフルの設定は保存され、開き直しても残る", async () => {
    const user = userEvent.setup();
    const view = render(<QuizApp />);
    await user.click(screen.getByRole("button", { name: "シャッフル" }));

    view.unmount();
    render(<QuizApp />);

    expect(screen.getByRole("button", { name: "シャッフル" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("文字サイズを変えると読む文字の倍率が変わり、開き直しても残る", async () => {
    const user = userEvent.setup();
    // 倍率は画面全体を包む枠の CSS 変数として配り、text-read-* がそれを掛けて出す。
    const frameOf = (view: ReturnType<typeof render>) => view.container.firstElementChild;

    const view = render(<QuizApp />);
    expect(frameOf(view)).toHaveStyle({ "--text-scale": String(TEXT_SCALE_RATIO.standard) });

    await user.click(screen.getByRole("button", { name: "特大" }));
    expect(frameOf(view)).toHaveStyle({ "--text-scale": String(TEXT_SCALE_RATIO.xlarge) });

    view.unmount();
    const reopened = render(<QuizApp />);

    expect(screen.getByRole("button", { name: "特大" })).toHaveAttribute("aria-pressed", "true");
    expect(frameOf(reopened)).toHaveStyle({ "--text-scale": String(TEXT_SCALE_RATIO.xlarge) });
  });

  it("メモを開くと、自由入力と手書きの枠が出る", async () => {
    const user = userEvent.setup();
    await startQuiz(user);

    expect(screen.queryByLabelText("メモ（文章）")).not.toBeInTheDocument();

    await toggleNotes(user);

    expect(screen.getByRole("complementary", { name: "メモ" })).toBeInTheDocument();
    expect(screen.getByLabelText("メモ（文章）")).toBeInTheDocument();
    expect(screen.getByLabelText("メモ（手書き）")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "メモを閉じる" }));

    expect(screen.queryByLabelText("メモ（文章）")).not.toBeInTheDocument();
  });

  it("メモの書き出しに改行だけを打っても消えない", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await toggleNotes(user);

    const text = screen.getByLabelText("メモ（文章）");
    await user.type(text, "{Enter}{Enter}");
    expect(text).toHaveValue("\n\n");

    // 改行だけのうちは「メモあり」の印は出さない（読めるものが無いため）
    expect(screen.getByRole("button", { name: "メモ" })).toBeInTheDocument();

    await user.type(text, "あとで書く");
    expect(text).toHaveValue("\n\nあとで書く");
  });

  it("書いたメモは問題ごとに保存され、開き直しても残る", async () => {
    const user = userEvent.setup();
    const view = await startQuiz(user);
    await toggleNotes(user);
    await user.type(screen.getByLabelText("メモ（文章）"), "桁落ちに注意");

    // 次の問題へ移るとメモも切り替わる（前の問題の書き込みは出てこない）
    await user.click(choiceButton(FIRST.answer));
    await user.click(screen.getByRole("button", { name: "次の問題へ" }));
    expect(screen.getByLabelText("メモ（文章）")).toHaveValue("");

    // 開き直しても、1 問目のメモは残っている
    view.unmount();
    render(<QuizApp />);
    await user.click(screen.getByRole("button", { name: "演習を再開" }));
    await user.click(screen.getByRole("button", { name: /^1$/ }));
    await toggleNotes(user);

    expect(screen.getByLabelText("メモ（文章）")).toHaveValue("桁落ちに注意");
  });

  it("手書きはドラッグで足され、一つ戻す・全部消すで減らせる", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await toggleNotes(user);
    expect(screen.getByRole("button", { name: "全部消す" })).toBeDisabled();

    const pad = sketchPad();
    fireEvent.pointerDown(pad, { clientX: 40, clientY: 30 });
    fireEvent.pointerMove(pad, { clientX: 200, clientY: 150 });
    fireEvent.pointerUp(pad, { clientX: 200, clientY: 150 });

    expect(screen.getByRole("button", { name: "全部消す" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "一つ戻す" }));

    expect(screen.getByRole("button", { name: "全部消す" })).toBeDisabled();
  });

  it("学習記録を消すとメモも消える", async () => {
    const user = userEvent.setup();
    await startQuiz(user);
    await toggleNotes(user);
    await user.type(screen.getByLabelText("メモ（文章）"), "あとで見る");
    expect(window.localStorage.getItem(NOTES_KEY)).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "学習ホーム" }));
    await user.click(screen.getByRole("button", { name: "学習記録を消す" }));
    await user.click(screen.getByRole("button", { name: "消す" }));

    expect(window.localStorage.getItem(NOTES_KEY)).toBeNull();
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

    // 前に選んでいた回・その回の正答率・連続学習日数が、サンプル値ではなく記録から出る
    expect(screen.getByRole("button", { name: /^出題する回/ })).toHaveAccessibleName(
      `出題する回 ${other.label}`,
    );
    expect(statCard("この回の正答率").getByText("100")).toBeInTheDocument();
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

  it("試験を選び直すと、その試験の問題集に切り替わる", async () => {
    const user = userEvent.setup();
    render(<QuizApp />);

    const sidebar = within(screen.getByRole("complementary"));
    await user.click(sidebar.getByRole("button", { name: /Cloud Digital Leader/ }));

    // 見出しと出題する回が、選び直した試験のものになる
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Cloud Digital Leader");
    expect(screen.getByRole("button", { name: /^出題する回/ })).toHaveAccessibleName(
      "出題する回 シナリオ問題1",
    );

    // 「出題する回」には、選んでいる試験の問題集だけが並ぶ
    await user.click(screen.getByRole("button", { name: /^出題する回/ }));
    expect(screen.getByRole("option", { name: "サービス確認問題1" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: FIRST_SET.label })).not.toBeInTheDocument();
  });
});
