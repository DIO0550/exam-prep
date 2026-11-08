import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { PM_ANSWERS_KEY, pmAnswerStore } from "../answers";
import { PM_EXAMS, PM_PROBLEMS, pmProblemId } from "../data";
import { PM_TRANSCRIPTS } from "../transcripts";
import {
  answerKeyLine,
  PmReader,
  PmText,
  parseKeyLine,
  parseUnderline,
  plainText,
} from "./pm-reader";

afterEach(() => {
  pmAnswerStore.clear();
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

    // 主キー（実線）に変えると、下線は不正解になる
    await user.click(picker.getByRole("radio", { name: "主キー（実線）" }));
    expect(answers.getByText("× 下線")).toBeInTheDocument();
    expect(
      answers.getByText("選んだのは主キー（実線）、解答例は外部キー（破線）"),
    ).toBeInTheDocument();
    expect(answers.getByText(/下線 0\/1 正解/)).toBeInTheDocument();
  });
});
