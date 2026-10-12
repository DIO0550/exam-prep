import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { QuizApp } from "../../quiz/components/quiz-app";
import { LABS } from "../data/labs";
import { HANDS_ON_KEY, handsOnStore } from "../store";
import { HandsOnApp } from "./hands-on-app";

const lab = LABS[0];
if (!lab) {
  throw new Error("演習データが必要です");
}

const start = async () => {
  const user = userEvent.setup();
  const view = render(<HandsOnApp />);
  await user.click(screen.getByRole("button", { name: `演習を始める：${lab.title}` }));
  return { user, view };
};

it("ヘッダーからハンズオンに移動し模試に戻れる", async () => {
  const user = userEvent.setup();
  render(<QuizApp />);
  await user.click(screen.getByRole("button", { name: "ACE ハンズオン" }));
  expect(screen.getByRole("navigation", { name: "ハンズオンのカテゴリ" })).toBeInTheDocument();
  expect(screen.queryByText("解説表示")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "学習ホーム" }));
  expect(screen.getByRole("button", { name: "演習を開始" })).toBeInTheDocument();
});

it("解答例と誤入力だけでは完了せず、正しい入力で次の手順が解放される", async () => {
  const { user } = await start();
  const next = screen.getByRole("button", { name: /^手順2 / });
  expect(next).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "解答例を見る" }));
  expect(next).toBeDisabled();
  fireEvent.change(screen.getByLabelText("コマンド"), {
    target: { value: "gcloud projects create production" },
  });
  await user.click(screen.getByRole("button", { name: "入力を確認" }));
  expect(screen.getByRole("alert")).toHaveTextContent("まだ条件を満たしていません");
  expect(next).toBeDisabled();
  fireEvent.change(screen.getByLabelText("コマンド"), { target: { value: lab.steps[0].answer } });
  await user.click(screen.getByRole("button", { name: "入力を確認" }));
  expect(next).toBeEnabled();
  expect(screen.getByLabelText("コマンド")).toHaveAttribute("readonly");
  expect(handsOnStore.snapshot().record.labs[lab.id]?.assisted).toEqual([lab.steps[0].id]);
});

it("再読込後に入力・完了状態を復元して続きから再開できる", async () => {
  const { user, view } = await start();
  fireEvent.change(screen.getByLabelText("コマンド"), { target: { value: lab.steps[0].answer } });
  await user.click(screen.getByRole("button", { name: "入力を確認" }));
  view.unmount();
  handsOnStore.reset();
  render(<HandsOnApp />);
  await user.click(screen.getByRole("button", { name: `続きから再開：${lab.title}` }));
  expect(screen.getByRole("heading", { name: lab.steps[1]?.title })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /^手順1 / }));
  expect(screen.getByLabelText("コマンド")).toHaveValue(lab.steps[0].answer);
});

it("やり直しをキャンセルでき、実行すると入力が消える", async () => {
  const { user } = await start();
  fireEvent.change(screen.getByLabelText("コマンド"), { target: { value: "draft" } });
  await user.click(screen.getByRole("button", { name: "この演習をやり直す" }));
  await user.click(screen.getByRole("button", { name: "キャンセル" }));
  expect(screen.getByLabelText("コマンド")).toHaveValue("draft");
  await user.click(screen.getByRole("button", { name: "この演習をやり直す" }));
  await user.click(screen.getByRole("button", { name: "最初から始める" }));
  expect(screen.getByLabelText("コマンド")).toHaveValue("");
});

it("保存不能でも演習を継続でき、保存できないことを表示する", async () => {
  const { user } = await start();
  const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  fireEvent.change(screen.getByLabelText("コマンド"), { target: { value: lab.steps[0].answer } });
  await user.click(screen.getByRole("button", { name: "入力を確認" }));
  expect(screen.getByRole("alert")).toHaveTextContent("ブラウザへの保存ができません");
  expect(screen.getByRole("button", { name: /^手順2 / })).toBeEnabled();
  spy.mockRestore();
});

it("別タブで進捗が消されたら未解放の手順から進めない", async () => {
  const { user } = await start();
  fireEvent.change(screen.getByLabelText("コマンド"), { target: { value: lab.steps[0].answer } });
  await user.click(screen.getByRole("button", { name: "入力を確認" }));
  await user.click(screen.getByRole("button", { name: "次の手順 →" }));
  window.localStorage.removeItem(HANDS_ON_KEY);
  fireEvent(window, new StorageEvent("storage", { key: HANDS_ON_KEY }));
  expect(screen.getByRole("heading", { name: lab.steps[0].title })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /^手順2 / })).toBeDisabled();
});
