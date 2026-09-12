import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("選択中の試験を見出しに出す", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("応用情報技術者試験");
  });

  it("学習ホームを最初に出す", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "本日の演習を始める" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "演習を開始" })).toBeInTheDocument();
  });
});
