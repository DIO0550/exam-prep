import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { PM_ANSWERS_KEY, pmAnswerStore } from "../answers";
import { PM_EXAMS, PM_PROBLEMS, pmProblemId } from "../data";
import { answerKeyLine, parseKeyLine, parseUnderline } from "../key-line";
import { PM_MARKS_KEY, pmMarkStore } from "../marks";
import { PM_RECORD_KEY, pmRecordStore } from "../store";
import { PM_TRANSCRIPTS } from "../transcripts";
import { PmReader, PmText, plainText } from "./pm-reader";

afterEach(() => {
  // 画面を外してからストアを空にする（描画中の画面に、act の外で更新が届かないように）
  cleanup();
  pmAnswerStore.clear();
  pmMarkStore.clear();
  pmRecordStore.clear();
});

describe("主キー・外部キーの書き方", () => {
  it("[[主:…]]・[[外:…]] を印と属性名に分け、印の無い [[…]] は普通の下線にする", () => {
    expect(parseUnderline("主:受診者ID")).toEqual({ key: "主", text: "受診者ID" });
    expect(parseUnderline("外:部屋種別 ID")).toEqual({ key: "外", text: "部屋種別 ID" });
    expect(parseUnderline("下線①")).toEqual({ text: "下線①" });
  });

  it("主キーは実線、外部キーは破線の下線で描き、読み上げ用に「（主キー）」などを添える", () => {
    const { container } = render(
      <PmText text="外来受診：[[主:受診者ID]]、診療科コード、[[外:処方箋ID]]。[[下線①]]" />,
    );
    expect(container).toHaveTextContent(
      "外来受診：受診者ID（主キー）、診療科コード、処方箋ID（外部キー）。下線①",
    );
    const pk = container.querySelector('[title="主キー（実線の下線）"]');
    const fk = container.querySelector('[title="外部キー（破線の下線）"]');
    expect(pk).toHaveClass("underline");
    expect(pk).not.toHaveClass("decoration-dashed");
    expect(fk).toHaveClass("underline", "decoration-dashed");
  });

  it("図の代替テキストでは、主キー・外部キーを言葉に直す", () => {
    expect(plainText("部屋：[[主:部屋 ID]]、{{b}}、[[外:部屋種別 ID]]、[[部屋番号]]")).toBe(
      "部屋：部屋 ID（主キー）、空欄b、部屋種別 ID（外部キー）、部屋番号",
    );
  });

  it("解答例の下線は、全体に付いた印から読み、印が無ければ下線なし", () => {
    expect(answerKeyLine("[[外:施設 ID]]")).toBe("外");
    expect(answerKeyLine("[[主:日]]")).toBe("主");
    expect(answerKeyLine("割引率")).toBe("");
    expect(answerKeyLine("[[下線①]]")).toBe("");
    expect(parseKeyLine("外")).toBe("外");
    expect(parseKeyLine("破線")).toBe("");
    expect(parseKeyLine(undefined)).toBe("");
  });
});

describe("解答欄で下線を選ぶ", () => {
  const pmExam = PM_EXAMS.find((e) => pmProblemId(e, 6) === "ap-r02-oct-pm-06");
  const problem = PM_PROBLEMS.find((p) => p.no === 6);
  const transcript = PM_TRANSCRIPTS["ap-r02-oct-pm-06"];

  it("属性名の欄で下線（なし・主キー・外部キー）を選べ、解答例を見ると下線の正誤を出す", async () => {
    if (!pmExam || !problem || !transcript) throw new Error("R2 10月 問6 が見つからない");
    const user = userEvent.setup();
    render(
      <PmReader pmExam={pmExam} problem={problem} transcript={transcript} onBack={() => {}} />,
    );
    const answers = within(screen.getByRole("complementary", { name: "解答欄" }));

    // 関連を答える欄（設問1 a）には出さず、属性名を答える欄（設問1 b）にだけ出す
    expect(answers.queryByRole("radiogroup", { name: "設問1 a の下線" })).not.toBeInTheDocument();
    const picker = within(answers.getByRole("radiogroup", { name: "設問1 b の下線" }));
    expect(picker.getByRole("radio", { name: "なし" })).toBeChecked();

    await user.type(answers.getByRole("textbox", { name: "設問1 b の答え" }), "施設 ID");
    await user.click(picker.getByRole("radio", { name: "外部キー（破線）" }));
    expect(picker.getByRole("radio", { name: "外部キー（破線）" })).toBeChecked();
    const saved = JSON.parse(window.localStorage.getItem(PM_ANSWERS_KEY) ?? "{}");
    expect(saved["ap-r02-oct-pm-06"]).toMatchObject({
      "設問1 b": "施設 ID",
      "設問1 b（下線）": "外",
    });

    await user.click(answers.getByRole("button", { name: "解答例を見る" }));
    expect(answers.getByText("○ 下線")).toBeInTheDocument();
    expect(answers.getByText("下線 1/1 正解")).toBeInTheDocument();
    // この問には解答群から選ぶ欄が無いので、記号の欄の正解数（0/0）は出さない
    expect(answers.queryByText(/記号の欄/)).not.toBeInTheDocument();
    // 下線が合っていれば、属性名は解答例と見比べて自分で ○× を付ける
    expect(answers.getByRole("group", { name: "設問1 b の自己採点" })).toBeInTheDocument();

    // 主キー（実線）に変えると、下線は不正解になる
    await user.click(picker.getByRole("radio", { name: "主キー（実線）" }));
    expect(answers.getByText("× 下線")).toBeInTheDocument();
    expect(
      answers.getByText("選んだのは主キー（実線）、解答例は外部キー（破線）"),
    ).toBeInTheDocument();
    expect(answers.getByText(/下線 0\/1 正解/)).toBeInTheDocument();
    // 下線が違えば、属性名が合っていても欄ごと × になり、自分で付けるボタンは出さない
    expect(answers.queryByRole("group", { name: "設問1 b の自己採点" })).not.toBeInTheDocument();
    expect(answers.getByRole("region", { name: "自己採点" })).toHaveTextContent(/× 1/);
  });
});

describe("欄ごとの自己採点", () => {
  const pmExam = PM_EXAMS.find((e) => pmProblemId(e, 1) === "ap-r07-aki-pm-01");
  const problem = PM_PROBLEMS.find((p) => p.no === 1);
  const transcript = PM_TRANSCRIPTS["ap-r07-aki-pm-01"];
  const ID = "ap-r07-aki-pm-01";

  const savedScore = (): number | undefined =>
    JSON.parse(window.localStorage.getItem(PM_RECORD_KEY) ?? "{}").attempts?.[ID]?.score;

  it("記述の欄に ○× を付けると集計し、全部の欄に付いたら欄数で按分した点数の目安を記録する", async () => {
    if (!pmExam || !problem || !transcript) throw new Error("R7 秋 問1 が見つからない");
    const user = userEvent.setup();
    render(
      <PmReader pmExam={pmExam} problem={problem} transcript={transcript} onBack={() => {}} />,
    );
    const answers = within(screen.getByRole("complementary", { name: "解答欄" }));
    await user.selectOptions(answers.getByRole("combobox", { name: "設問1 a の答え" }), "ク");
    await user.selectOptions(answers.getByRole("combobox", { name: "設問1 b の答え" }), "ア");
    await user.type(answers.getByRole("textbox", { name: "設問2 c の答え" }), "初期");
    // 解答例を見る前は、○× を付けるボタンを出さない
    expect(answers.queryByRole("group", { name: /の自己採点$/ })).not.toBeInTheDocument();

    await user.click(answers.getByRole("button", { name: "解答例を見る" }));
    const summary = answers.getByRole("region", { name: "自己採点" });
    expect(summary).toHaveTextContent(/○ 1 ・ × 1 ・ 未採点 6（全 8 欄）/);

    // 記述の欄（設問2 c など）と、選んでいない記号の欄（設問1 d など）は自分で付ける
    const marks: [string, "○ 正解" | "× 不正解"][] = [
      ["設問1 d", "× 不正解"],
      ["設問1 e", "○ 正解"],
      ["設問2 c", "○ 正解"],
      ["設問3 (1)", "○ 正解"],
      ["設問3 (2)", "○ 正解"],
    ];
    for (const [key, label] of marks) {
      const group = within(answers.getByRole("group", { name: `${key} の自己採点` }));
      await user.click(group.getByRole("button", { name: label }));
      expect(group.getByRole("button", { name: label })).toHaveAttribute("aria-pressed", "true");
    }
    expect(summary).toHaveTextContent(/○ 5 ・ × 2 ・ 未採点 1（全 8 欄）/);
    // まだ付いていない欄があるうちは、点数を付けない
    expect(savedScore()).toBeUndefined();

    const last = within(answers.getByRole("group", { name: "設問3 (3) の自己採点" }));
    await user.click(last.getByRole("button", { name: "× 不正解" }));
    // 8 欄中 5 欄が ○ → 100 点換算で 63 点、1 問 20 点の配点では 12.5 点
    expect(summary).toHaveTextContent(/目安 63点（本番の配点では 20点中 12.5点）記録済み/);
    expect(savedScore()).toBe(63);
    expect(within(summary).getByRole("spinbutton")).toHaveValue(63);

    // 解説の見出しにも ○× を添える
    const explain = within(answers.getByRole("region", { name: "解説" }));
    expect(explain.getByRole("article", { name: "設問1 b の解説" })).toHaveTextContent("× 不正解");

    // 付け直しても、記録済みの点数は黙って書き換えず、記録し直すボタンを出す
    await user.click(last.getByRole("button", { name: "○ 正解" }));
    expect(summary).toHaveTextContent(/目安 75点（本番の配点では 20点中 15点）/);
    expect(savedScore()).toBe(63);
    await user.click(within(summary).getByRole("button", { name: "75点で記録し直す" }));
    expect(savedScore()).toBe(75);
    expect(summary).toHaveTextContent("記録済み");

    // もう一度押すと、付けていない状態に戻る
    await user.click(last.getByRole("button", { name: "○ 正解" }));
    expect(last.getByRole("button", { name: "○ 正解" })).toHaveAttribute("aria-pressed", "false");
    expect(summary).toHaveTextContent(/未採点 1/);
  });

  it("× の欄だけ解き直すと、× の欄の答えと印だけを消し、○ の欄は残す", async () => {
    if (!pmExam || !problem || !transcript) throw new Error("R7 秋 問1 が見つからない");
    const user = userEvent.setup();
    render(
      <PmReader pmExam={pmExam} problem={problem} transcript={transcript} onBack={() => {}} />,
    );
    const answers = within(screen.getByRole("complementary", { name: "解答欄" }));
    await user.selectOptions(answers.getByRole("combobox", { name: "設問1 a の答え" }), "ク");
    await user.selectOptions(answers.getByRole("combobox", { name: "設問1 b の答え" }), "ア");
    await user.type(answers.getByRole("textbox", { name: "設問2 c の答え" }), "初期");
    await user.type(answers.getByRole("textbox", { name: "設問3 (2) の答え" }), "見つかるから");
    await user.click(answers.getByRole("button", { name: "解答例を見る" }));
    await user.click(
      within(answers.getByRole("group", { name: "設問2 c の自己採点" })).getByRole("button", {
        name: "○ 正解",
      }),
    );
    await user.click(
      within(answers.getByRole("group", { name: "設問3 (2) の自己採点" })).getByRole("button", {
        name: "× 不正解",
      }),
    );

    await user.click(answers.getByRole("button", { name: "× の欄だけ解き直す（2欄）" }));
    // 解答例は隠れ、× の欄（設問1 b・設問3 (2)）だけが空になる
    expect(answers.getByRole("button", { name: "解答例を見る" })).toBeInTheDocument();
    expect(answers.getByRole("combobox", { name: "設問1 a の答え" })).toHaveValue("ク");
    expect(answers.getByRole("combobox", { name: "設問1 b の答え" })).toHaveValue("");
    expect(answers.getByRole("textbox", { name: "設問2 c の答え" })).toHaveValue("初期");
    expect(answers.getByRole("textbox", { name: "設問3 (2) の答え" })).toHaveValue("");
    expect(JSON.parse(window.localStorage.getItem(PM_MARKS_KEY) ?? "{}")[ID]).toEqual({
      "設問2 c": "ok",
    });

    // 解き直して解答例を見ると、○ を付けた欄はそのまま
    await user.click(answers.getByRole("button", { name: "解答例を見る" }));
    expect(
      within(answers.getByRole("group", { name: "設問2 c の自己採点" })).getByRole("button", {
        name: "○ 正解",
      }),
    ).toHaveAttribute("aria-pressed", "true");

    // 答えを消して解き直すと、印もいっしょに消える
    await user.click(answers.getByRole("button", { name: "答えを消して解き直す" }));
    expect(JSON.parse(window.localStorage.getItem(PM_MARKS_KEY) ?? "{}")[ID]).toBeUndefined();
  });
});
