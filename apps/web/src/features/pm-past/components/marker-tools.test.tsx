import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PM_EXAMS, PM_PROBLEMS, pmProblemId } from "../data";
import { offsetsIn, rangeAt } from "../marker-range";
import { PM_MARKERS_KEY, pmMarkerStore } from "../markers";
import { PM_TRANSCRIPTS } from "../transcripts";
import { PmReader, PmText } from "./pm-reader";

const ID = "ap-r07-aki-pm-01";
const pmExam = PM_EXAMS.find((e) => pmProblemId(e, 1) === ID);
const problem = PM_PROBLEMS.find((p) => p.no === 1);
const transcript = PM_TRANSCRIPTS[ID];

/** jsdom には CSS Custom Highlight API が無いので、登録された範囲を覗ける作り物に差し替える。 */
class FakeHighlight extends Set<AbstractRange> {
  constructor(...ranges: AbstractRange[]) {
    super(ranges);
  }
}

const highlights = new Map<string, FakeHighlight>();

beforeEach(() => {
  highlights.clear();
  vi.stubGlobal("Highlight", FakeHighlight);
  vi.stubGlobal("CSS", { highlights });
});

afterEach(() => {
  cleanup();
  pmMarkerStore.clear();
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

const renderReader = () => {
  if (!pmExam || !problem || !transcript) throw new Error("R7 秋 問1 が見つからない");
  render(
    <PmReader
      pmExam={pmExam}
      problem={problem}
      transcript={transcript}
      notesOpen={false}
      onToggleNotes={() => {}}
      onBack={() => {}}
    />,
  );
};

/** 本文の 1 段落目の文字の節。 */
const firstParagraph = (): Text => {
  const node = screen.getByText(/産業機械を製造する企業で/).firstChild;
  if (!(node instanceof Text)) throw new Error("本文の文字が見つからない");
  return node;
};

/** node の中の needle を選ぶ（なぞったのと同じ）。 */
const select = (node: Text, needle: string) => {
  const start = node.data.indexOf(needle);
  if (start === -1) throw new Error(`${needle} が見つからない`);
  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, start + needle.length);
  const selection = document.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
};

const saved = () => JSON.parse(window.localStorage.getItem(PM_MARKERS_KEY) ?? "{}")[ID];

/** 塗った範囲の文字列（色ごと）。 */
const painted = (color: string) =>
  [...(highlights.get(`pm-marker-${color}`) ?? [])].map((range) => (range as Range).toString());

describe("問題文にマーカーを引く", () => {
  it("マーカーを持ってなぞると、その色で引き、問ごとに残す", async () => {
    const user = userEvent.setup();
    renderReader();
    const button = screen.getByRole("button", { name: "マーカー" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");

    select(firstParagraph(), "産業機械を製造する企業");
    fireEvent.pointerUp(document, { pointerType: "mouse" });

    expect(saved()).toEqual([
      expect.objectContaining({ text: "産業機械を製造する企業", color: "yellow" }),
    ]);
    expect(painted("yellow")).toEqual(["産業機械を製造する企業"]);
    // 引いたら選びは解く（選んだ色ではなく、マーカーの色が見えるように）
    expect(document.getSelection()?.isCollapsed ?? true).toBe(true);
  });

  it("色を選び直して引ける。先に文字を選んでから色を押しても、その所に引く", async () => {
    const user = userEvent.setup();
    renderReader();
    await user.click(screen.getByRole("button", { name: "マーカー" }));
    await user.click(screen.getByRole("button", { name: "青のマーカー" }));
    expect(screen.getByRole("button", { name: "青のマーカー" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    select(firstParagraph(), "複数の子会社");
    await user.click(screen.getByRole("button", { name: "ピンクのマーカー" }));
    expect(saved()).toEqual([expect.objectContaining({ text: "複数の子会社", color: "pink" })]);
    expect(painted("pink")).toEqual(["複数の子会社"]);
  });

  it("マーカーを持っていなくても、選んでから「マーカー」を押すとその所に引く", async () => {
    const user = userEvent.setup();
    renderReader();
    select(firstParagraph(), "Z 社グループ");
    await user.click(screen.getByRole("button", { name: "マーカー" }));
    expect(saved()).toEqual([expect.objectContaining({ text: "Z 社グループ", color: "yellow" })]);
  });

  it("持っていないときは、なぞっても引かない", () => {
    renderReader();
    select(firstParagraph(), "産業機械");
    fireEvent.pointerUp(document, { pointerType: "mouse" });
    expect(saved()).toBeUndefined();
  });

  it("消しゴムでなぞった所だけ消え、残りは分かれて残る", async () => {
    const user = userEvent.setup();
    renderReader();
    await user.click(screen.getByRole("button", { name: "マーカー" }));
    select(firstParagraph(), "産業機械を製造する企業");
    fireEvent.pointerUp(document, { pointerType: "mouse" });

    await user.click(screen.getByRole("button", { name: /消し\s*ゴム/ }));
    select(firstParagraph(), "製造");
    fireEvent.pointerUp(document, { pointerType: "mouse" });
    expect(saved()).toEqual([
      expect.objectContaining({ text: "産業機械を" }),
      expect.objectContaining({ text: "する企業" }),
    ]);
    expect(painted("yellow")).toEqual(["産業機械を", "する企業"]);
  });

  it("指で選んだときは、離した時点では引かず、選びが解けたときに引く", async () => {
    const user = userEvent.setup();
    renderReader();
    await user.click(screen.getByRole("button", { name: "マーカー" }));
    select(firstParagraph(), "産業機械");
    act(() => {
      document.dispatchEvent(new Event("selectionchange"));
    });
    fireEvent.pointerUp(document, { pointerType: "touch" });
    expect(saved()).toBeUndefined();

    // つまみで広げた
    select(firstParagraph(), "産業機械を製造する");
    act(() => {
      document.dispatchEvent(new Event("selectionchange"));
    });
    // ほかの所を押して、選びが解けた
    act(() => {
      document.getSelection()?.removeAllRanges();
      document.dispatchEvent(new Event("selectionchange"));
    });
    expect(saved()).toEqual([expect.objectContaining({ text: "産業機械を製造する" })]);
  });

  it("「全部消す」は確かめてから、この問のマーカーを全部消す", async () => {
    const user = userEvent.setup();
    renderReader();
    await user.click(screen.getByRole("button", { name: "マーカー" }));
    select(firstParagraph(), "産業機械");
    fireEvent.pointerUp(document, { pointerType: "mouse" });

    await user.click(screen.getByRole("button", { name: "この問のマーカーを全部消す" }));
    expect(saved()).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "この問のマーカーを全部消す（確定）" }));
    expect(saved()).toBeUndefined();
    expect(painted("yellow")).toEqual([]);
  });

  it("開き直しても、保存したマーカーを塗る。答えを消して解き直してもマーカーは消さない", async () => {
    const user = userEvent.setup();
    pmMarkerStore.set(ID, [{ start: 0, end: 4, text: "企業グル", color: "green" }]);
    renderReader();
    expect(painted("green")).toEqual(["企業グル"]);
    await user.click(screen.getByRole("button", { name: "解答例を見る" }));
    await user.click(screen.getByRole("button", { name: "答えを消して解き直す" }));
    expect(saved()).toHaveLength(1);
  });

  it("CSS Custom Highlight API が無いブラウザでは、マーカーの道具を出さない", () => {
    vi.unstubAllGlobals();
    renderReader();
    expect(screen.queryByRole("button", { name: "マーカー" })).not.toBeInTheDocument();
  });
});

describe("マーカーの位置の数え方", () => {
  it("空欄の枠や読み上げ用の文字をまたいでも、選んだ所と塗る所がずれない", () => {
    const { container } = render(
      <div>
        <PmText text="関係：[[主:受診者ID]]、{{a}}、[[外:処方箋ID]]、診療科" />
      </div>,
    );
    const area = container.firstElementChild as HTMLElement;
    const text = area.textContent ?? "";
    // 「受診者ID（主キー）、a、処方箋」を選んだとする
    const range = document.createRange();
    const start = screen.getByText("受診者ID", { exact: false }).firstChild as Text;
    const end = screen.getByText("処方箋ID", { exact: false }).firstChild as Text;
    range.setStart(start, 0);
    range.setEnd(end, 3);
    const offsets = offsetsIn(area, range);
    if (!offsets) throw new Error("範囲が取れない");
    expect(text.slice(offsets.start, offsets.end)).toBe(range.toString());
    expect(rangeAt(area, offsets.start, offsets.end)?.toString()).toBe(range.toString());
  });

  it("欄の外にはみ出した所は数えない", () => {
    const { container } = render(
      <div>
        <p data-testid="area">問題文</p>
        <p>解答欄</p>
      </div>,
    );
    const area = screen.getByTestId("area");
    const range = document.createRange();
    range.setStart(area.firstChild as Text, 2);
    range.setEnd(container.querySelectorAll("p")[1]?.firstChild as Text, 2);
    expect(offsetsIn(area, range)).toEqual({ start: 2, end: 3 });
  });
});
