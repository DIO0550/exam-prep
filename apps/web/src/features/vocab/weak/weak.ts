/**
 * 「あやふや」を付けた札。
 *
 * 持つのは札の ID だけ。覚えたら外すので、増え続けることはない。
 */
export type WeakRecord = {
  version: number;
  ids: string[];
};

export const WEAK_VERSION = 1;

export const EMPTY_WEAK: WeakRecord = { version: WEAK_VERSION, ids: [] };

export const emptyWeak = (): WeakRecord => ({ version: WEAK_VERSION, ids: [] });

/** 保存されていた値を読む。形が違えば空として扱う（古い版も同じ）。 */
export const parseWeak = (value: unknown): WeakRecord => {
  if (typeof value !== "object" || value === null) return emptyWeak();
  const record = value as Partial<WeakRecord>;
  if (record.version !== WEAK_VERSION || !Array.isArray(record.ids)) return emptyWeak();
  return { version: WEAK_VERSION, ids: record.ids.filter((id) => typeof id === "string") };
};

/** 付ける・外す。同じ状態なら元の値をそのまま返す（描き直しを起こさないため）。 */
export const withWeak = (record: WeakRecord, id: string, weak: boolean): WeakRecord => {
  const has = record.ids.includes(id);
  if (has === weak) return record;
  return {
    version: WEAK_VERSION,
    ids: weak ? [...record.ids, id] : record.ids.filter((kept) => kept !== id),
  };
};
