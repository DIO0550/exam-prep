import type { VocabDeck } from "../types";

type VocabSidebarProps = {
  decks: VocabDeck[];
  /** 選んでいる単語帳の id。 */
  deckId: string;
  /** 「あやふや」を付けている語の数。 */
  weakCount: number;
  onSelectDeck: (id: string) => void;
};

/** 単語帳の一覧。演習側の回の一覧（ExamSidebar）と同じ置き方・同じ見た目にしてある。 */
export const VocabSidebar = ({ decks, deckId, weakCount, onSelectDeck }: VocabSidebarProps) => {
  return (
    <aside className="flex flex-col gap-5 self-stretch border-line border-r bg-surface px-4 pt-5 pb-8 md:flex-[1_1_232px] md:overflow-y-auto md:overscroll-contain">
      <nav className="flex flex-col gap-[5px]">
        <div className="flex items-center gap-2 px-2 pt-1 pb-[5px]">
          <span className="flex-1 font-bold text-[10.5px] text-muted tracking-[0.12em]">
            単語帳
          </span>
          <span className="text-[10.5px] text-muted-soft tabular-nums">{decks.length}件</span>
        </div>

        <div className="flex flex-col gap-[3px]">
          {decks.map((deck) => {
            const selected = deck.id === deckId;
            return (
              <button
                key={deck.id}
                type="button"
                aria-current={selected ? "true" : undefined}
                onClick={() => onSelectDeck(deck.id)}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-r-[9px] border-l-[2.5px] py-[9px] pr-2.5 pl-2 text-left hover:bg-hover ${
                  selected ? "border-l-accent bg-accent-soft" : "border-l-transparent"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-7 flex-none items-center justify-center rounded-lg font-bold text-[10px] ${
                    selected ? "bg-accent text-surface" : "bg-chip text-muted-soft"
                  }`}
                >
                  A
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={`text-pretty text-[12.5px] leading-[1.45] ${
                      selected ? "font-bold text-accent-deep" : "font-medium text-ink"
                    }`}
                  >
                    {deck.name}
                  </span>
                  <span className="truncate text-[10.5px] text-muted-soft leading-[1.4]">
                    {deck.sub}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <p className="px-2 text-[11px] text-muted-soft leading-[1.8]">
        「あやふや」を付けた語 {weakCount} 件。この端末に残るので、次に開いたときも
        「あやふや」だけめくり直せます。
      </p>
    </aside>
  );
};
