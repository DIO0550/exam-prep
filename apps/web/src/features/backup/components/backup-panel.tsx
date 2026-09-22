"use client";

import { useId, useRef, useState } from "react";

import type { Backup, BackupParse } from "../backup";
import { backupCounts, isEmptyBackup, scopeLabel } from "../backup";

/**
 * 学習記録の書き出しと読み込み。
 *
 * 読み込みは 2 段階にしてある。全体の取り込みは今の記録を置き換えるので、
 * ファイルを選んだ時点では中身を読んで確かめるだけにして、実際に反映するのは
 * もう一度押してから。何が入っているファイルなのか（範囲・件数・書き出した日）を
 * その場に出すので、取り違えたファイルに気付ける。
 */

const BUTTON =
  "cursor-pointer rounded-[9px] border border-edge-strong bg-surface px-4 py-2.5 font-medium text-[12.5px] text-ink hover:bg-canvas";
const PRIMARY =
  "cursor-pointer rounded-[9px] bg-accent px-4 py-2.5 font-bold text-[12.5px] text-surface hover:bg-accent-hover";

type BackupPanelProps = {
  /** 選んでいる回のラベル。「この回だけ」がどれなのかをボタンに出す。 */
  setLabel: string;
  onExportAll: () => void;
  onExportSet: () => void;
  /** 選ばれたファイルを読んで、取り込める形に直す。 */
  onRead: (file: File) => Promise<BackupParse>;
  onImport: (backup: Backup) => void;
};

/** 取り込む前に出す説明。範囲によって、置き換えなのか重ね合わせなのかが変わる。 */
const describe = (backup: Backup): string => {
  const counts = backupCounts(backup);
  const parts = [`解答 ${counts.attempts}問`, `メモ ${counts.notes}問`];
  if (backup.scope.type === "all") parts.push(`あやふや ${counts.weak}語`);
  return `${scopeLabel(backup.scope)}・${parts.join(" / ")}`;
};

const exportedAtLabel = (backup: Backup): string => {
  const date = new Date(backup.exportedAt);
  return Number.isNaN(date.getTime()) ? "日時不明" : date.toLocaleString("ja-JP");
};

export const BackupPanel = ({
  setLabel,
  onExportAll,
  onExportSet,
  onRead,
  onImport,
}: BackupPanelProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Backup | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined): Promise<void> => {
    // 同じファイルを選び直しても change が起きるように、読む前に値を空にする。
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;

    setPending(null);
    setMessage(null);
    const result = await onRead(file);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    if (isEmptyBackup(result.backup)) {
      setError("記録が入っていないファイルです。");
      return;
    }
    setError(null);
    setPending(result.backup);
  };

  const apply = (): void => {
    if (!pending) return;
    onImport(pending);
    setPending(null);
    setMessage(`${describe(pending)} を読み込みました。`);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface">
      <h3 className="border-line-soft border-b px-6 py-[18px] font-bold text-[12.5px] tracking-[0.04em]">
        学習記録の書き出し・読み込み
      </h3>

      <div className="flex flex-col gap-4 px-6 py-5">
        <p className="max-w-[100ch] text-pretty text-[12.5px] text-muted-soft leading-[1.9]">
          記録はこのブラウザにしか残りません。JSON ファイルにして持ち出せば、別の端末で続けたり、
          サイトデータを消す前に取っておいたりできます。
          <strong className="font-bold text-ink">全体</strong>
          は解答・メモ・単語帳の「あやふや」・設定をまとめて出し、読み込むと今の記録を置き換えます。
          <strong className="font-bold text-ink">この回だけ</strong>
          は選んでいる回の解答とメモだけを出し、読み込んでもその回の分しか上書きしません
          （連続学習日数のような累計は回ごとに切り分けられないので、全体にだけ入ります）。
        </p>

        <div className="flex flex-wrap gap-2.5">
          <button type="button" onClick={onExportAll} className={BUTTON}>
            全体を書き出す
          </button>
          <button type="button" onClick={onExportSet} className={BUTTON}>
            この回だけ書き出す（{setLabel}）
          </button>
          <label htmlFor={inputId} className={BUTTON}>
            ファイルを読み込む
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              void pick(event.target.files?.[0]);
            }}
          />
        </div>

        {pending && (
          <div className="flex flex-col gap-2.5 rounded-xl border border-edge bg-canvas px-4 py-3.5">
            <p className="text-[12.5px] leading-[1.9]">
              {describe(pending)}
              <span className="pl-1.5 text-muted-soft">
                （{exportedAtLabel(pending)} 書き出し）
              </span>
            </p>
            <p className="text-[12px] text-muted-soft leading-[1.9]">
              {pending.scope.type === "all"
                ? "今このブラウザに入っている記録・メモ・あやふやは、すべてこの内容に置き換わります。"
                : "同じ問題の解答とメモは上書きされます。他の回の記録はそのまま残ります。"}
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button type="button" onClick={apply} className={PRIMARY}>
                読み込む
              </button>
              <button type="button" onClick={() => setPending(null)} className={BUTTON}>
                やめる
              </button>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="text-[12.5px] text-ng leading-[1.9]">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="text-[12.5px] text-muted-soft leading-[1.9]">
            {message}
          </p>
        )}
      </div>
    </section>
  );
};
