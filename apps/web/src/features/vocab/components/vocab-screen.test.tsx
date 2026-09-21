import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { VocabScreen } from "./vocab-screen";

const searchBox = () => screen.getByRole("searchbox", { name: "略語を検索" });

describe("略語単語帳の画面", () => {
  it("語数と分類を出す", () => {
    render(<VocabScreen />);
    expect(screen.getByText("360 語")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /ネットワーク/ })).toBeInTheDocument();
  });

  it("検索すると当たった語だけ残り、件数がその場で変わる", async () => {
    const user = userEvent.setup();
    render(<VocabScreen />);

    await user.type(searchBox(), "cpu");

    expect(screen.getByText("CPU")).toBeInTheDocument();
    expect(screen.queryByText("ASIC")).not.toBeInTheDocument();
    expect(screen.getByText(/\/ 360 語$/)).toBeInTheDocument();
  });

  it("説明の中の言葉は「説明も含む」でだけ当たる", async () => {
    const user = userEvent.setup();
    render(<VocabScreen />);

    await user.type(searchBox(), "命令の取出し");
    expect(screen.getByText("該当する語はありません。")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "説明も含む" }));
    expect(screen.getByText("CPU")).toBeInTheDocument();
  });

  it("正式名称は、略語の字になっているところだけ色を変えて出す", () => {
    render(<VocabScreen />);

    const heads = screen.getAllByText("C", { selector: "span.text-accent" });
    expect(heads.length).toBeGreaterThan(0);
  });

  it("同じ略語で違う意味も引ける", async () => {
    const user = userEvent.setup();
    render(<VocabScreen />);

    await user.type(searchBox(), "mandatory access control");

    expect(screen.getByText("Mandatory Access Control")).toBeInTheDocument();
    expect(screen.getByText(/文脈で見分ける/)).toBeInTheDocument();
  });
});
