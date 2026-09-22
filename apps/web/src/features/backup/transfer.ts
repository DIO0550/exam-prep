import type { Backup, BackupParse } from "./backup";
import { backupFileName, parseBackup } from "./backup";

/**
 * 書き出しと読み込みのファイル操作。
 *
 * ブラウザに閉じた処理（Blob とリンクのクリック、File の読み出し）だけをここに置く。
 * 形の組み立てと検証は backup.ts にあり、こちらは DOM に触るぶんだけを持つので、
 * 中身の扱いはブラウザ無しでも試験できる。
 */

/** JSON にして保存させる。static export なのでサーバは介さず、その場で作って渡す。 */
export const downloadBackup = (backup: Backup, now: Date = new Date()): void => {
  // 読んで直せる形で出す（端末を移すとき、中身を確かめたくなる）。空白 2 つで整形する。
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = backupFileName(backup, now);
  link.click();
  // クリックは同期に始まるので、この時点で開放してよい。残すとタブを閉じるまで解放されない。
  URL.revokeObjectURL(url);
};

/** 選ばれたファイルを読んで、取り込める形に直す。読めない理由はそのまま画面に出す。 */
export const readBackupFile = async (file: File): Promise<BackupParse> => {
  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ok: false, reason: "ファイルを読めませんでした。" };
  }

  try {
    return parseBackup(JSON.parse(text));
  } catch {
    return { ok: false, reason: "JSON として読めないファイルです。" };
  }
};
