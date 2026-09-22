import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { emptyNotes } from "../../quiz/notes/note";
import { emptyRecord } from "../../quiz/progress/record";
import { emptyWeak } from "../../vocab/weak/weak";
import type { Backup } from "../backup";
import { buildAllBackup, buildSetBackup } from "../backup";
import { readBackupFile } from "../transfer";
import { BackupPanel } from "./backup-panel";

const ANSWERED = { picked: 2, revealed: true, flagged: false, weak: false, excluded: [] };

const records = () => ({
  record: { ...emptyRecord(), attempts: { "ap-r07-aki-am-01": ANSWERED } },
  notes: emptyNotes(),
  weak: emptyWeak(),
});

/** 書き出したものをそのままファイルにする。選ぶところから通して見る。 */
const fileOf = (backup: Backup) =>
  new File([JSON.stringify(backup)], "exam-prep-all-20260922.json", {
    type: "application/json",
  });

const setup = (onImport = vi.fn()) => {
  const user = userEvent.setup();
  render(
    <BackupPanel
      setLabel="令和7年 秋期"
      onExportAll={vi.fn()}
      onExportSet={vi.fn()}
      onRead={readBackupFile}
      onImport={onImport}
    />,
  );
  return { user, onImport, input: screen.getByLabelText("ファイルを読み込む") };
};

describe("BackupPanel", () => {
  it("読み込む前に中身を出し、押してから反映する", async () => {
    const { user, onImport, input } = setup();

    await user.upload(input, fileOf(buildAllBackup(records())));

    expect(await screen.findByText(/全体・解答 1問/)).toBeInTheDocument();
    expect(onImport).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "読み込む" }));

    expect(onImport).toHaveBeenCalledOnce();
    expect(screen.getByRole("status")).toHaveTextContent("読み込みました");
  });

  it("やめれば何も起きない", async () => {
    const { user, onImport, input } = setup();

    await user.upload(input, fileOf(buildAllBackup(records())));
    await user.click(await screen.findByRole("button", { name: "やめる" }));

    expect(onImport).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "読み込む" })).not.toBeInTheDocument();
  });

  it("個別のファイルは、その回だけが上書きされると伝える", async () => {
    const { user, input } = setup();
    const backup = buildSetBackup(records(), {
      id: "ap-r07-aki-am",
      label: "令和7年 秋期",
      questionIds: ["ap-r07-aki-am-01"],
    });

    await user.upload(input, fileOf(backup));

    expect(await screen.findByText(/個別（令和7年 秋期）/)).toBeInTheDocument();
    expect(screen.getByText(/他の回の記録はそのまま残ります/)).toBeInTheDocument();
  });

  it("別のサイトの JSON は理由を出して断る", async () => {
    const { user, onImport, input } = setup();

    await user.upload(input, new File(['{"foo":1}'], "other.json", { type: "application/json" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "このサイトで書き出したファイルではありません。",
    );
    expect(onImport).not.toHaveBeenCalled();
  });

  it("記録が入っていないファイルは読み込ませない", async () => {
    const { user, input } = setup();
    const empty = buildAllBackup({
      record: emptyRecord(),
      notes: emptyNotes(),
      weak: emptyWeak(),
    });

    await user.upload(input, fileOf(empty));

    expect(await screen.findByRole("alert")).toHaveTextContent("記録が入っていないファイルです。");
  });
});
