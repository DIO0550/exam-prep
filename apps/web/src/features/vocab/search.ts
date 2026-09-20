import type { AbbrEntry, AbbrGroup, AmbiguousAbbr } from "./types";

/** 検索でどこまで見るか。 */
export const SEARCH_SCOPES = ["略語・正式名称", "説明も含む"] as const;
export type SearchScope = (typeof SEARCH_SCOPES)[number];

const normalize = (text: string): string => text.trim().toLowerCase();

/** その語が検索語に当たるか。scope が「略語・正式名称」なら説明は見ない。 */
export const matchesEntry = (entry: AbbrEntry, key: string, scope: SearchScope): boolean => {
  if (key === "") return true;
  const head = `${entry.abbr} ${entry.full} ${entry.ja}`;
  const target = scope === "説明も含む" ? `${head} ${entry.desc} ${entry.note?.text ?? ""}` : head;
  return normalize(target).includes(key);
};

export const matchesAmbiguous = (item: AmbiguousAbbr, key: string, scope: SearchScope): boolean => {
  if (key === "") return true;
  const head = `${item.abbr} ${item.meanings.map((meaning) => `${meaning.en} ${meaning.ja}`).join(" ")}`;
  const target =
    scope === "説明も含む"
      ? `${head} ${item.meanings.map((meaning) => meaning.desc).join(" ")} ${item.hint}`
      : head;
  return normalize(target).includes(key);
};

/** 検索語で絞った分類。1 語も残らなかった分類は落とす。 */
export const filterGroups = (groups: AbbrGroup[], key: string, scope: SearchScope): AbbrGroup[] => {
  const normalized = normalize(key);
  if (normalized === "") return groups;
  return groups
    .map((group) => ({
      ...group,
      entries: group.entries.filter((entry) => matchesEntry(entry, normalized, scope)),
    }))
    .filter((group) => group.entries.length > 0);
};

export const filterAmbiguous = (
  items: AmbiguousAbbr[],
  key: string,
  scope: SearchScope,
): AmbiguousAbbr[] => {
  const normalized = normalize(key);
  if (normalized === "") return items;
  return items.filter((item) => matchesAmbiguous(item, normalized, scope));
};

export const countEntries = (groups: AbbrGroup[]): number =>
  groups.reduce((total, group) => total + group.entries.length, 0);
