import type { WeakRecord } from "./weak";
import { emptyWeak, parseWeak } from "./weak";

/**
 * 「あやふや」の保存先。
 *
 * 学習記録（progress/）とは別のキーにしてある。単語帳は問題を解いた記録ではなく、
 * 「学習記録を消す」で一緒に消えると、めくり直す手がかりまで消えてしまうため。
 */

export const WEAK_KEY = "exam-prep:vocab-weak:v1";

export const loadWeak = (): WeakRecord => {
  if (typeof window === "undefined") return emptyWeak();
  try {
    const raw = window.localStorage.getItem(WEAK_KEY);
    return raw === null ? emptyWeak() : parseWeak(JSON.parse(raw));
  } catch {
    // 壊れた JSON、あるいは参照拒否。何も付いていないものとして続ける。
    return emptyWeak();
  }
};

export const saveWeak = (record: WeakRecord): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WEAK_KEY, JSON.stringify(record));
  } catch {
    // 容量超過や書き込み拒否。この回のあいだは画面の中だけで残る。
  }
};

export const clearWeak = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(WEAK_KEY);
  } catch {
    // 消せなくても画面側は空として動く。
  }
};
