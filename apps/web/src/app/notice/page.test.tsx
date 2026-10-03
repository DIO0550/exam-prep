import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Notice from "./page";

describe("Notice", () => {
  it("非公式である旨と収録範囲を出す", () => {
    render(<Notice />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("ご利用上の注意");
    expect(screen.getByText(/無関係の個人制作です/)).toBeInTheDocument();
    expect(screen.getByText(/応用情報技術者試験 午前 \d+回分/)).toBeInTheDocument();
  });
});
