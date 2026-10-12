import type { ReactNode } from "react";

import { Segmented } from "@/features/vocab/components/segmented";

import type { QuestionSet } from "../data/questions";
import type { DrawSettings } from "../draw";
import { DRAW_COUNTS, drawPool, drawSize, fieldsOf } from "../draw";

type DrawSetupProps = {
  /** 引く対象に選べる回。選んでいる試験の問題集。 */
  sets: QuestionSet[];
  settings: DrawSettings;
  onChange: (settings: DrawSettings) => void;
  onStart: () => void;
  onCancel: () => void;
};

const SMALL_BUTTON =
  "cursor-pointer rounded-md border border-edge bg-surface px-2.5 py-[5px] font-medium text-[11px] text-muted hover:bg-hover";

/** 押すと入り切りする丸い札。単語帳の分野選びと同じ見た目。 */
const chipClass = (on: boolean): string =>
  `cursor-pointer rounded-full border px-3 py-[6px] text-[11.5px] ${
    on
      ? "border-accent bg-accent-soft font-bold text-accent-deep"
      : "border-line bg-surface font-medium text-muted hover:bg-hover"
  }`;

/** 並びを保ったまま、入っていれば抜き、無ければ足す。 */
const toggled = (values: string[], value: string, order: string[]): string[] =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : order.filter((item) => item === value || values.includes(item));

type ChipSectionProps = {
  title: string;
  onSelectAll: () => void;
  onClear: () => void;
  children: ReactNode;
};

const ChipSection = ({ title, onSelectAll, onClear, children }: ChipSectionProps) => (
  <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-6 py-[22px]">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="font-bold text-[14px] tracking-[0.01em]">{title}</h3>
      <div className="flex gap-2">
        <button type="button" onClick={onSelectAll} className={SMALL_BUTTON}>
          すべて選択
        </button>
        <button type="button" onClick={onClear} className={SMALL_BUTTON}>
          すべて解除
        </button>
      </div>
    </div>
    <div className="flex flex-wrap gap-2">{children}</div>
  </section>
);

/** ランダム出題の条件を決める画面。回・分野・問題数を選んで始める。 */
export const DrawSetup = ({ sets, settings, onChange, onStart, onCancel }: DrawSetupProps) => {
  const setIds = sets.map((set) => set.id);
  const fields = fieldsOf(sets);
  const poolSize = drawPool(sets, settings).length;
  const size = drawSize(poolSize, settings.count);

  // 札に添える数は、もう一方の条件で絞った後の数にする（選べば何問増えるかが分かるように）。
  const inSet = (set: QuestionSet) =>
    set.questions.filter((question) => settings.fields.includes(question.field)).length;
  const inField = (field: string) =>
    sets
      .filter((set) => settings.setIds.includes(set.id))
      .reduce(
        (sum, set) => sum + set.questions.filter((question) => question.field === field).length,
        0,
      );

  return (
    <div className="flex animate-rise-in flex-col gap-3.5">
      <section className="flex flex-col gap-2 rounded-2xl border border-line bg-surface px-8 py-[26px]">
        <span className="font-bold text-[11px] text-muted-soft tracking-[0.16em]">RANDOM</span>
        <h2 className="font-bold text-[22px] leading-[1.4] tracking-[0.01em]">ランダム出題</h2>
        <p className="max-w-[100ch] text-pretty text-[13.5px] text-muted-soft leading-[1.9]">
          選んだ回・分野の問題から、決めた数だけ無作為に選んで出します。
          解答はそれぞれの回の記録にも残り、前回の解答はその問題を開いたときに消えます。
        </p>
      </section>

      <ChipSection
        title="出題する回"
        onSelectAll={() => onChange({ ...settings, setIds })}
        onClear={() => onChange({ ...settings, setIds: [] })}
      >
        {sets.map((set) => {
          const on = settings.setIds.includes(set.id);
          return (
            <button
              key={set.id}
              type="button"
              aria-pressed={on}
              onClick={() =>
                onChange({ ...settings, setIds: toggled(settings.setIds, set.id, setIds) })
              }
              className={chipClass(on)}
            >
              {set.label}
              <span className="ml-1.5 tabular-nums">{inSet(set)}</span>
            </button>
          );
        })}
      </ChipSection>

      <ChipSection
        title="出題する分野"
        onSelectAll={() => onChange({ ...settings, fields })}
        onClear={() => onChange({ ...settings, fields: [] })}
      >
        {fields.map((field) => {
          const on = settings.fields.includes(field);
          return (
            <button
              key={field}
              type="button"
              aria-pressed={on}
              onClick={() =>
                onChange({ ...settings, fields: toggled(settings.fields, field, fields) })
              }
              className={chipClass(on)}
            >
              {field}
              <span className="ml-1.5 tabular-nums">{inField(field)}</span>
            </button>
          );
        })}
      </ChipSection>

      <section className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface px-6 py-[22px]">
        <h3 className="font-bold text-[14px] tracking-[0.01em]">出題のしかた</h3>
        <Segmented
          label="問題数"
          options={DRAW_COUNTS.map((count) => ({
            label: typeof count === "number" ? `${count}問` : count,
            value: count,
          }))}
          value={settings.count}
          onChange={(count) => onChange({ ...settings, count })}
        />
      </section>

      <div className="flex flex-col items-center gap-2 pt-1">
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            disabled={size === 0}
            onClick={onStart}
            className="cursor-pointer rounded-[10px] bg-accent px-10 py-[15px] font-bold text-[14.5px] text-surface tracking-[0.02em] hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-disabled"
          >
            出題する
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-[10px] border border-edge-strong bg-surface px-6 py-[15px] font-medium text-[14px] text-ink hover:bg-canvas"
          >
            学習ホームに戻る
          </button>
        </div>
        <p className="text-[12px] text-muted-soft">
          {size === 0
            ? "出題できる問題がありません。回か分野を選んでください。"
            : `${poolSize}問から ${size}問を出します。`}
        </p>
      </div>
    </div>
  );
};
