import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PmText, parseUnderline, plainText } from "./pm-reader";

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
});
