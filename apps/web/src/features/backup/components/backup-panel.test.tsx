import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { emptyNotes } from "../../quiz/notes/note";
import { emptyRecord } from "../../quiz/progress/record";
import { emptyWeak } from "../../vocab/weak/weak";
import type { Backup } from "../backup";
import { buildAllBackup, buildSetBackup } from "../backup";
import { emptyPmPast } from "../pm-past";
import { readBackupFile } from "../transfer";
import { BackupPanel } from "./backup-panel";

const ANSWERED = { picked: 2, revealed: true, flagged: false, weak: false, excluded: [] };

const records = () => ({
  record: { ...emptyRecord(), attempts: { "ap-r07-aki-am-01": ANSWERED } },
  notes: emptyNotes(),
  weak: emptyWeak(),
  pm: {
    ...emptyPmPast(),
    attempts: { "ap-r06-aki-pm-05": { solvedOn: "2026-09-21", score: 70 } },
    answers: { "ap-r06-aki-pm-05": { 設問1: "VLAN" } },
  },
});

/** 書き出したものをそのままファイルにする。選ぶところから通して見る。 */
const fileOf = (backup: Backup) =>
  new File([JSON.stringify(backup)], "exam-prep-all-20260922.json", {
    type: "application/json",
  });

const setup = (onImport = vi.fn(), extra: Partial<ComponentProps<typeof BackupPanel>> = {}) => {
  const user = userEvent.setup();
  render(
    <BackupPanel
      setLabel="令和7年 秋期"
      onExportAll={vi.fn()}
      onExportSet={vi.fn()}
      onRead={readBackupFile}
      onImport={onImport}
      {...extra}
    />,
  );
  return { user, onImport, input: screen.getByLabelText("ファイルを読み込む") };
};

describe("BackupPanel", () => {
  it("読み込む前に中身を出し、押してから反映する", async () => {
    const { user, onImport, input } = setup();

    await user.upload(input, fileOf(buildAllBackup(records())));

    expect(
      await screen.findByText(/全体・解答 1問 \/ 午後の過去問 1問 \/ メモ 0問/),
    ).toBeInTheDocument();
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
    expect(screen.getByText(/ほかの回・ほかの試験の記録はそのまま残ります/)).toBeInTheDocument();
  });

  it("午後の 1 回分のファイルは、午後の問の数を出す（解答 0問とは出さない）", async () => {
    const { user, input } = setup();
    const backup = buildSetBackup(records(), {
      id: "ap-r06-aki-pm",
      label: "応用情報 午後 令和6年度 秋期",
      questionIds: ["ap-r06-aki-pm-05"],
    });

    await user.upload(input, fileOf(backup));

    expect(
      await screen.findByText(/個別（応用情報 午後 令和6年度 秋期）・午後の過去問 1問 \/ メモ 0問/),
    ).toBeInTheDocument();
  });

  it("応用情報の画面では、過去問をまとめて書き出すボタンを出す", async () => {
    const onExportApPast = vi.fn();
    const { user } = setup(vi.fn(), { onExportApPast });

    await user.click(
      screen.getByRole("button", { name: "応用情報の過去問をまとめて書き出す（午前・午後）" }),
    );

    expect(onExportApPast).toHaveBeenCalledOnce();
  });

  it("ほかの試験では、過去問をまとめて書き出すボタンを出さない", () => {
    setup();

    expect(screen.queryByRole("button", { name: /過去問をまとめて/ })).not.toBeInTheDocument();
  });

  it("回を選ぶ部品を渡すと、その隣に「この回だけ」を出す", async () => {
    const onExportSet = vi.fn();
    const { user } = setup(vi.fn(), {
      setLabel: "令和6年度 秋期",
      onExportSet,
      setPicker: <span>回を選ぶ</span>,
    });

    expect(screen.getByText("回を選ぶ")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "この回だけ書き出す（令和6年度 秋期）" }));

    expect(onExportSet).toHaveBeenCalledOnce();
    expect(screen.getAllByRole("button", { name: /この回だけ書き出す/ })).toHaveLength(1);
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
      pm: emptyPmPast(),
    });

    await user.upload(input, fileOf(empty));

    expect(await screen.findByRole("alert")).toHaveTextContent("記録が入っていないファイルです。");
  });
});
