"use client";

import { useMemo, useState } from "react";

import { ABBR_GROUPS, AMBIGUOUS_ABBRS } from "../data/abbreviations";
import type { SearchScope } from "../search";
import { countEntries, filterAmbiguous, filterGroups, SEARCH_SCOPES } from "../search";
import { AbbrRow } from "./abbr-row";
import { AmbiguousRow } from "./ambiguous-row";

const TOTAL = countEntries(ABBR_GROUPS);

/** 分類の見出しへ飛ぶ。ヘッダーの下に潜らないよう scroll-mt で余白を取ってある。 */
const jumpTo = (id: string): void => {
  document.getElementById(id)?.scrollIntoView({ block: "start" });
};

const sectionId = (id: string): string => `vocab-${id}`;

export const VocabScreen = () => {
  const [key, setKey] = useState("");
  const [scope, setScope] = useState<SearchScope>(SEARCH_SCOPES[0]);

  const groups = useMemo(() => filterGroups(ABBR_GROUPS, key, scope), [key, scope]);
  const ambiguous = useMemo(() => filterAmbiguous(AMBIGUOUS_ABBRS, key, scope), [key, scope]);
  const shown = countEntries(groups);
  const searching = key.trim() !== "";
  const empty = groups.length === 0 && ambiguous.length === 0;

  return (
    <div className="flex animate-rise-in flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2 className="font-bold text-[18px] tracking-[0.01em]">略語単語帳</h2>
          <span className="text-[12px] text-muted-soft tabular-nums">
            {searching ? `${shown} / ${TOTAL} 語` : `${TOTAL} 語`}
          </span>
        </div>

        <div className="flex rounded-lg bg-track p-[3px]">
          {SEARCH_SCOPES.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={scope === name}
              onClick={() => setScope(name)}
              className={`cursor-pointer whitespace-nowrap rounded-md px-[13px] py-[7px] font-bold text-[11.5px] ${
                scope === name
                  ? "bg-surface text-accent shadow-[0_1px_2px_rgba(22,24,29,0.12)]"
                  : "text-muted"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <input
        type="search"
        value={key}
        onChange={(event) => setKey(event.target.value)}
        placeholder={
          scope === "説明も含む" ? "略語・正式名称・説明を検索…" : "略語・正式名称を検索…"
        }
        aria-label="略語を検索"
        className="w-full rounded-[10px] border border-edge bg-surface px-4 py-[11px] text-[13.5px] text-ink placeholder:text-muted-soft focus:border-accent focus:outline-none"
      />

      <nav className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={() => jumpTo(sectionId(group.id))}
            className="cursor-pointer rounded-full border border-line bg-surface px-3 py-[5px] font-medium text-[11.5px] text-muted hover:bg-hover"
          >
            <span aria-hidden="true">{group.icon}</span> {group.title}
            <span className="ml-1.5 text-muted-soft tabular-nums">{group.entries.length}</span>
          </button>
        ))}
        {ambiguous.length > 0 && (
          <button
            type="button"
            onClick={() => jumpTo(sectionId("dup"))}
            className="cursor-pointer rounded-full border border-line bg-surface px-3 py-[5px] font-medium text-[11.5px] text-muted hover:bg-hover"
          >
            <span aria-hidden="true">⚠</span> 同じ略語で違う意味
            <span className="ml-1.5 text-muted-soft tabular-nums">{ambiguous.length}</span>
          </button>
        )}
      </nav>

      {groups.map((group) => (
        <section
          key={group.id}
          id={sectionId(group.id)}
          className="scroll-mt-4 overflow-hidden rounded-2xl border border-line bg-surface"
        >
          <header className="flex flex-wrap items-baseline gap-3 border-line border-b bg-panel px-6 py-3.5">
            <h3 className="font-bold text-[14px] tracking-[0.01em]">
              <span aria-hidden="true">{group.icon}</span> {group.title}
            </h3>
            <span className="text-[11px] text-muted-soft">{group.field}</span>
            <span className="ml-auto text-[11px] text-muted-soft tabular-nums">
              {group.entries.length} 語
            </span>
          </header>

          {group.entries.map((entry) => (
            <AbbrRow key={`${group.id}:${entry.abbr}:${entry.full}`} entry={entry} />
          ))}
        </section>
      ))}

      {ambiguous.length > 0 && (
        <section
          id={sectionId("dup")}
          className="scroll-mt-4 overflow-hidden rounded-2xl border border-line bg-surface"
        >
          <header className="flex flex-wrap items-baseline gap-3 border-line border-b bg-panel px-6 py-3.5">
            <h3 className="font-bold text-[14px] tracking-[0.01em]">
              <span aria-hidden="true">⚠</span> 同じ略語で違う意味
            </h3>
            <span className="text-[11px] text-muted-soft">分野をまたぐ頻出の落とし穴</span>
            <span className="ml-auto text-[11px] text-muted-soft tabular-nums">
              {ambiguous.length} 組
            </span>
          </header>

          {ambiguous.map((item) => (
            <AmbiguousRow key={item.abbr} item={item} />
          ))}
        </section>
      )}

      {empty && (
        <div className="rounded-2xl border border-line bg-surface px-6 py-10 text-center text-[13px] text-muted-soft">
          該当する語はありません。
        </div>
      )}
    </div>
  );
};
