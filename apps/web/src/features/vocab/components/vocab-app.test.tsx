import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { WEAK_KEY } from "../weak/storage";
import { VocabApp } from "./vocab-app";

const user = () => userEvent.setup();

/** 分野を 1 つだけ選んだ状態にして、そこからめくり始める。 */
const startDrill = async (actor: ReturnType<typeof userEvent.setup>, category = /データベース/) => {
  render(<VocabApp />);
  await actor.click(screen.getByRole("button", { name: "すべて解除" }));
  await actor.click(screen.getByRole("button", { name: category }));
  await actor.click(screen.getByRole("button", { name: "開始する" }));
};

describe("単語帳（フラッシュカード）", () => {
  it("左のパネルから単語帳を選ぶ。開いた直後は設定画面", () => {
    render(<VocabApp />);

    expect(screen.getByRole("button", { name: /応用情報 略語/ })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("heading", { name: "出題形式" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "開始する" })).toBeEnabled();
  });

  it("分野を選び直すと、出す枚数の案内がその場で変わる", async () => {
    const actor = user();
    render(<VocabApp />);

    await actor.click(screen.getByRole("button", { name: "すべて解除" }));
    expect(screen.getByRole("button", { name: "開始する" })).toBeDisabled();
    expect(screen.getByText(/出題できる語がありません/)).toBeInTheDocument();

    await actor.click(screen.getByRole("button", { name: /データベース/ }));
    expect(screen.getByText("21 語から 21 枚を出します。")).toBeInTheDocument();
  });

  it("めくって「覚えた」を押すと次の札へ進む", async () => {
    const actor = user();
    await startDrill(actor);

    expect(screen.getByText("1 / 21")).toBeInTheDocument();
    await actor.click(screen.getByRole("button", { name: "問い（押すと答えを見る）" }));
    await actor.click(screen.getByRole("button", { name: /覚えた/ }));

    expect(screen.getByText("2 / 21")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^答えを見る/ })).toBeInTheDocument();
  });

  it("「あやふや」を付けた語はこの端末に残り、次に開いたとき絞り込みに使える", async () => {
    const actor = user();
    await startDrill(actor);

    await actor.click(screen.getByRole("button", { name: "問い（押すと答えを見る）" }));
    await actor.click(screen.getByRole("button", { name: /あやふや/ }));

    const saved = JSON.parse(window.localStorage.getItem(WEAK_KEY) ?? "{}");
    expect(saved.ids).toHaveLength(1);
    expect(screen.getByText(/「あやふや」を付けた語 1 件/)).toBeInTheDocument();
  });

  it("最後の札まで進むと結果が出て、あやふやだけもう一周できる", async () => {
    const actor = user();
    render(<VocabApp />);

    await actor.click(screen.getByRole("button", { name: "すべて解除" }));
    await actor.click(screen.getByRole("button", { name: /標準化団体/ }));
    await actor.click(screen.getByRole("button", { name: "20枚" }));
    await actor.click(screen.getByRole("button", { name: "開始する" }));

    // 15 枚。1 枚目だけ「あやふや」にして、残りは送る。
    await actor.click(screen.getByRole("button", { name: "問い（押すと答えを見る）" }));
    await actor.click(screen.getByRole("button", { name: /あやふや/ }));
    for (let left = 14; left > 0; left -= 1) {
      await actor.click(screen.getByRole("button", { name: "次へ →" }));
    }

    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("回答 1 語 / 出題 15 語")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "あやふやだった語" })).toBeInTheDocument();

    await actor.click(screen.getByRole("button", { name: "あやふやだけもう一周" }));
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
  });

  it("キーでもめくれる（Space でめくり、2 であやふや）", async () => {
    const actor = user();
    await startDrill(actor);

    await actor.keyboard("[Space]");
    expect(screen.getByRole("button", { name: /^覚えた/ })).toBeInTheDocument();

    await actor.keyboard("2");
    expect(screen.getByText("2 / 21")).toBeInTheDocument();
  });

  it("出題形式を変えると、表に出るものが変わる", async () => {
    const actor = user();
    render(<VocabApp />);

    await actor.click(screen.getByRole("button", { name: "正式名称 → 略語" }));
    await actor.click(screen.getByRole("button", { name: "すべて解除" }));
    await actor.click(screen.getByRole("button", { name: /データベース/ }));
    await actor.click(screen.getByRole("button", { name: "収録順" }));
    await actor.click(screen.getByRole("button", { name: "開始する" }));

    expect(screen.getByText("この正式名称の略語は？")).toBeInTheDocument();
    expect(screen.getByText("DataBase Management System")).toBeInTheDocument();
  });
});
