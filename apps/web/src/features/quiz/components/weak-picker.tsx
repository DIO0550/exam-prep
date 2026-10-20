import { useState } from "react";

import { Segmented } from "@/features/vocab/components/segmented";

import type { Question } from "../types";
import { shortSource, sourceId } from "../types";

type WeakPickerProps = {
  /** 選んでいる試験の全回で、苦手登録した問題。回・問番号の順。 */
  questions: Question[];
  /** 選んだ問題を出し始める。random なら混ぜた順で出す。 */
  onStart: (picked: Question[], random: boolean) => void;
  onCancel: () => void;
};

const SMALL_BUTTON =
  "cursor-pointer rounded-md border border-edge bg-surface px-2.5 py-[5px] font-medium text-[11px] text-muted hover:bg-hover";

/** 一覧に出す問題文の長さ。これを超えたら末尾を省略する。 */
const TEXT_LIMIT = 78;

/** 苦手登録した問題を全回から並べ、解きたいものだけを選んで出す画面。 */
export const WeakPicker = ({ questions, onStart, onCancel }: WeakPickerProps) => {
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  // ここへ来るのは選んだ問題を混ぜて解きたいときが多いので、ランダムから始める。
  const [random, setRandom] = useState(true);

  const ids = questions.map((question) => sourceId(question.source));
  // 苦手登録を外した問題は、選んでいても数えない。
  const picked = questions.filter((question) => pickedIds.includes(sourceId(question.source)));
  const toggle = (id: string): void =>
    setPickedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  return (
    <div className="flex animate-rise-in flex-col gap-3.5">
      <section className="flex flex-col gap-2 rounded-2xl border border-line bg-surface px-8 py-[26px]">
        <span className="font-bold text-[11px] text-muted-soft tracking-[0.16em]">WEAK</span>
        <h2 className="font-bold text-[22px] leading-[1.4] tracking-[0.01em]">
          苦手問題を選んで解く
        </h2>
        <p className="max-w-[100ch] text-pretty text-[13.5px] text-muted-soft leading-[1.9]">
          全回で苦手登録した問題から、解きたいものだけを選んで出します。
          解いた結果は各回の学習記録に入ります。
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-6 py-[22px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-[14px] tracking-[0.01em]">
            苦手登録した問題（{questions.length}問）
          </h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPickedIds(ids)} className={SMALL_BUTTON}>
              すべて選択
            </button>
            <button type="button" onClick={() => setPickedIds([])} className={SMALL_BUTTON}>
              すべて解除
            </button>
          </div>
        </div>
        <ul className="flex flex-col">
          {questions.map((question) => {
            const id = sourceId(question.source);
            return (
              <li key={id} className="border-line-softer border-b last:border-b-0">
                <label className="flex cursor-pointer items-start gap-3.5 px-1 py-3 hover:bg-[#fafbfc]">
                  <input
                    type="checkbox"
                    checked={pickedIds.includes(id)}
                    onChange={() => toggle(id)}
                    className="mt-1 size-4 flex-none cursor-pointer accent-accent"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
                    <span className="text-pretty text-[13.5px] text-ink-soft leading-[1.7]">
                      {question.text.length > TEXT_LIMIT
                        ? `${question.text.slice(0, TEXT_LIMIT)}…`
                        : question.text}
                    </span>
                    <span className="flex flex-wrap gap-2.5 text-[11px] text-muted-soft">
                      <span>{shortSource(question.source)}</span>
                      <span>{question.field}</span>
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface px-6 py-[22px]">
        <h3 className="font-bold text-[14px] tracking-[0.01em]">出題のしかた</h3>
        <Segmented
          label="出す順"
          options={[
            { label: "回・問番号の順", value: false },
            { label: "ランダム", value: true },
          ]}
          value={random}
          onChange={setRandom}
        />
      </section>

      <div className="flex flex-col items-center gap-2 pt-1">
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            disabled={picked.length === 0}
            onClick={() => onStart(picked, random)}
            className="cursor-pointer rounded-[10px] bg-accent px-10 py-[15px] font-bold text-[14.5px] text-surface tracking-[0.02em] hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-disabled"
          >
            選んだ問題を解く
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
          {picked.length === 0
            ? "解きたい問題を選んでください。"
            : `${picked.length}問を${random ? "ランダムな順" : "回・問番号の順"}で出します。`}
        </p>
      </div>
    </div>
  );
};
