import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { SelectMenu } from "./select-menu";

const FIRST = { value: "a", label: "令和7年 秋期" };
const OPTIONS = [
  FIRST,
  { value: "b", label: "令和7年 春期" },
  { value: "c", label: "令和6年 秋期" },
];

/** onChange を state に受けて、選び直しが表示に反映されるところまで見る。 */
const Harness = () => {
  const [value, setValue] = useState(FIRST.value);
  return <SelectMenu label="出題する回" value={value} options={OPTIONS} onChange={setValue} />;
};

const trigger = () => screen.getByRole("button", { name: /^出題する回/ });

describe("SelectMenu", () => {
  it("閉じているあいだは選択中の値だけを出す", () => {
    render(<Harness />);

    expect(trigger()).toHaveAccessibleName("出題する回 令和7年 秋期");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("押すと一覧が開き、選ぶと閉じて値が変わる", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(trigger());
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "令和7年 秋期" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.click(screen.getByRole("option", { name: "令和6年 秋期" }));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger()).toHaveAccessibleName("出題する回 令和6年 秋期");
  });

  it("矢印キーで移動して Enter で選べる", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    trigger().focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "令和7年 秋期" }).id,
    );

    await user.keyboard("{ArrowDown}{Enter}");

    expect(trigger()).toHaveAccessibleName("出題する回 令和7年 春期");
    expect(trigger()).toHaveFocus();
  });

  it("Escape は選び直さずに閉じる", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(trigger());
    await user.keyboard("{ArrowDown}{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger()).toHaveAccessibleName("出題する回 令和7年 秋期");
    expect(trigger()).toHaveFocus();
  });

  it("外側を押すと閉じる", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Harness />
        <button type="button">外側</button>
      </div>,
    );

    await user.click(trigger());
    await user.click(screen.getByRole("button", { name: "外側" }));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
