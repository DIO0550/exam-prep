import type { AbbrEntry } from "../types";
import { AcronymText } from "./acronym-text";

type AbbrRowProps = {
  entry: AbbrEntry;
};

/** 略語 1 語。左に略語、右に正式名称・日本語・説明を置く。 */
export const AbbrRow = ({ entry }: AbbrRowProps) => {
  return (
    <div className="flex flex-col gap-2.5 border-line-softer border-b px-6 py-[18px] last:border-b-0 sm:flex-row sm:gap-5">
      <div className="sm:flex-[0_0_136px]">
        <span className="inline-block rounded-lg bg-chip px-2.5 py-1 font-bold text-[13px] text-ink tracking-[0.02em]">
          {entry.abbr}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
        <span className="text-pretty text-read-md leading-[1.6]">
          <AcronymText full={entry.full} acronym={entry.acronym} />
        </span>
        <span className="text-pretty font-medium text-[12.5px] text-muted leading-[1.6]">
          {entry.ja}
        </span>
        <span className="max-w-[100ch] text-pretty text-read-sm text-ink-soft leading-[1.85]">
          {entry.desc}
        </span>
        {entry.note && (
          <span className="mt-1 flex flex-wrap items-baseline gap-2 rounded-lg bg-flag-soft px-3 py-2 text-read-sm text-ink-soft leading-[1.8]">
            <span className="font-bold text-[10.5px] text-flag-ink tracking-[0.12em]">
              {entry.note.label}
            </span>
            <span className="min-w-0 flex-1 text-pretty">{entry.note.text}</span>
          </span>
        )}
      </div>
    </div>
  );
};
