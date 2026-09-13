import type { ProgressRecord } from "./record";
import { emptyRecord, parseRecord } from "./record";

/**
 * 学習記録の保存先。
 *
 * localStorage を使う。IndexedDB でも持てるが、
 * - 記録は 1 件（数十 KB。800 問すべてを解いても 100 KB に届かない）で、容量の心配が無い
 * - 読み出しが同期なので、最初の描画で「記録なし」を出してから差し替える必要が無い
 * - static export でサーバが無く、保存先はブラウザに閉じる
 * ため。1 回ごとの解答履歴のような、件数が伸びるものを持ち始めたら IndexedDB へ移す。
 *
 * 読み書きはどちらも例外を握る。localStorage は Safari のプライベートモードや
 * サイトデータのブロックで参照そのものが投げることがあり、学習記録が残らないことより
 * 画面が出ないことのほうが困るため。
 */

export const STORAGE_KEY = "exam-prep:progress:v1";

export const loadRecord = (): ProgressRecord => {
  if (typeof window === "undefined") return emptyRecord();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === null ? emptyRecord() : parseRecord(JSON.parse(raw));
  } catch {
    // 壊れた JSON、あるいは参照拒否。記録が無いものとして続ける。
    return emptyRecord();
  }
};

export const saveRecord = (record: ProgressRecord): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // 容量超過や書き込み拒否。この回の学習はメモリ上の記録だけで続く。
  }
};

export const clearRecord = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 消せなくても画面側は空の記録で動く。
  }
};
