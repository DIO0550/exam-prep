import type { AmbiguousAbbr } from "../types";

type AmbiguousRowProps = {
  item: AmbiguousAbbr;
};

/** 同じ略語で意味が分かれるもの 1 組。意味を並べ、最後に見分け方を添える。 */
export const AmbiguousRow = ({ item }: AmbiguousRowProps) => {
  return (
    <div className="flex flex-col gap-2.5 border-line-softer border-b px-6 py-[18px] last:border-b-0 sm:flex-row sm:gap-5">
      <div className="sm:flex-[0_0_136px]">
        <span className="inline-block rounded-lg bg-flag-soft px-2.5 py-1 font-bold text-[13px] text-flag-ink tracking-[0.02em]">
          {item.abbr}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {item.meanings.map((meaning) => (
          <div key={meaning.en} className="flex flex-col gap-0.5">
            <span className="text-pretty font-bold text-read-md text-accent leading-[1.6]">
              {meaning.en}
            </span>
            <span className="text-pretty font-medium text-[12.5px] text-muted leading-[1.6]">
              {meaning.ja}
            </span>
            <span className="max-w-[100ch] text-pretty text-read-sm text-ink-soft leading-[1.85]">
              {meaning.desc}
            </span>
          </div>
        ))}

        <span className="flex flex-wrap items-baseline gap-2 rounded-lg bg-accent-soft px-3 py-2 text-read-sm text-ink-soft leading-[1.8]">
          <span className="font-bold text-[10.5px] text-accent-deep tracking-[0.12em]">
            見分け方
          </span>
          <span className="min-w-0 flex-1 text-pretty">{item.hint}</span>
        </span>
      </div>
    </div>
  );
};
