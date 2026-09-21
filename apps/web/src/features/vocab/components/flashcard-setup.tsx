import { CARD_LIMITS, CARD_MODES, CARD_ORDERS } from "../deck";
import type { FlashcardSession } from "../hooks/use-flashcards";
import type { VocabDeck } from "../types";
import { Segmented } from "./segmented";

type FlashcardSetupProps = {
  deck: VocabDeck;
  session: FlashcardSession;
};

/** 出題形式の下に添える、何をできるようにする形式かの説明。 */
const MODE_HINT: Record<string, string> = {
  "略語 → 正式名称": "SIEM を見て Security Information and Event Management を言えるようにする。",
  "略語 → 意味": "SIEM を見て「ログを集約して相関分析する仕組み」と言えるようにする。",
  "正式名称 → 略語": "スペルアウトから略語を当てる逆引き。書き取りの仕上げに。",
};

export const FlashcardSetup = ({ deck, session }: FlashcardSetupProps) => {
  const { settings, poolSize, weakCount, weakIds } = session;

  return (
    <div className="flex animate-rise-in flex-col gap-3.5">
      <section className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface px-6 py-[22px]">
        <h3 className="font-bold text-[14px] tracking-[0.01em]">出題形式</h3>
        <Segmented
          label="形式"
          options={CARD_MODES.map((mode) => ({ label: mode, value: mode }))}
          value={settings.mode}
          onChange={session.setMode}
        />
        <p className="text-[12px] text-muted-soft leading-[1.8]">{MODE_HINT[settings.mode]}</p>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-6 py-[22px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-[14px] tracking-[0.01em]">出題する分野</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={session.selectAllCategories}
              className="cursor-pointer rounded-md border border-edge bg-surface px-2.5 py-[5px] font-medium text-[11px] text-muted hover:bg-hover"
            >
              すべて選択
            </button>
            <button
              type="button"
              onClick={session.clearCategories}
              className="cursor-pointer rounded-md border border-edge bg-surface px-2.5 py-[5px] font-medium text-[11px] text-muted hover:bg-hover"
            >
              すべて解除
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {deck.groups.map((group) => {
            const on = settings.categories.includes(group.id);
            // 「あやふや」だけに絞っているときは、その分野に何枚残っているかを出す。
            const count = settings.weakOnly
              ? group.entries.filter((entry) => weakIds.has(`${group.id}:${entry.abbr}`)).length
              : group.entries.length;

            return (
              <button
                key={group.id}
                type="button"
                aria-pressed={on}
                onClick={() => session.toggleCategory(group.id)}
                className={`cursor-pointer rounded-full border px-3 py-[6px] text-[11.5px] ${
                  on
                    ? "border-accent bg-accent-soft font-bold text-accent-deep"
                    : "border-line bg-surface font-medium text-muted hover:bg-hover"
                }`}
              >
                <span aria-hidden="true">{group.icon}</span> {group.title}
                <span className="ml-1.5 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface px-6 py-[22px]">
        <h3 className="font-bold text-[14px] tracking-[0.01em]">出題のしかた</h3>

        <Segmented
          label="順番"
          options={CARD_ORDERS.map((order) => ({ label: order, value: order }))}
          value={settings.order}
          onChange={session.setOrder}
        />

        <Segmented
          label="枚数"
          options={CARD_LIMITS.map((limit) => ({
            label: typeof limit === "number" ? `${limit}枚` : limit,
            value: limit,
          }))}
          value={settings.limit}
          onChange={session.setLimit}
        />

        <label className="flex cursor-pointer items-center gap-2.5 text-[12.5px] text-ink-soft">
          <input
            type="checkbox"
            checked={settings.weakOnly}
            onChange={(event) => session.setWeakOnly(event.target.checked)}
            className="size-4 cursor-pointer accent-accent"
          />
          「あやふや」を付けた語だけ
          <span className="rounded-md bg-chip px-2 py-0.5 font-bold text-[11px] text-muted tabular-nums">
            {weakCount}
          </span>
        </label>
      </section>

      <div className="flex flex-col items-center gap-2 pt-1">
        <button
          type="button"
          disabled={poolSize === 0}
          onClick={session.start}
          className="cursor-pointer rounded-[10px] bg-accent px-10 py-[15px] font-bold text-[14.5px] text-surface tracking-[0.02em] hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-disabled"
        >
          開始する
        </button>
        <p className="text-[12px] text-muted-soft">
          {poolSize === 0
            ? "出題できる語がありません。分野か絞り込みを見直してください。"
            : `${poolSize} 語から ${
                settings.limit === "すべて" ? poolSize : Math.min(poolSize, settings.limit)
              } 枚を出します。`}
        </p>
      </div>
    </div>
  );
};
