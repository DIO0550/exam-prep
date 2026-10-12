"use client";

import { useState } from "react";

import { CATEGORIES, LABS } from "../data/labs";
import { progressOf } from "../progress";
import { handsOnStore, useHandsOnRecord } from "../store";
import { LabRunner } from "./lab-runner";

export const HandsOnApp = () => {
  const [category, setCategory] = useState<string>(CATEGORIES[0].id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { record, storageFailed } = useHandsOnRecord();
  const selected = LABS.find((lab) => lab.id === selectedId);
  const visible = LABS.filter((lab) => lab.category === category);
  const completedLabs = LABS.filter(
    (lab) => progressOf(record, lab.id).completed.length === lab.steps.length,
  ).length;
  return (
    <div className="grid min-w-0 flex-1 md:min-h-0 md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="border-line border-b bg-surface p-5 md:overflow-y-auto md:border-r md:border-b-0">
        <h1 className="font-bold text-read-xl">ACE ハンズオン</h1>
        <p className="mt-2 text-read-sm text-muted">
          {completedLabs} / {LABS.length} 演習完了
        </p>
        <nav aria-label="ハンズオンのカテゴリ" className="mt-5 flex flex-wrap gap-2 md:flex-col">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              onClick={() => {
                setCategory(item.id);
                setSelectedId(null);
              }}
              className={`cursor-pointer rounded-lg px-4 py-3 text-left text-read-sm hover:bg-hover ${category === item.id ? "bg-accent-soft font-bold text-accent" : "text-muted"}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 overflow-y-auto p-5 sm:p-8 md:overscroll-contain">
        <div className="mx-auto max-w-5xl">
          <p className="mb-5 rounded-xl border border-line bg-surface p-4 text-read-sm text-muted leading-relaxed">
            コマンド・設定を入力して操作手順を練習します。入力はクラウドに実行されず、確認結果は学習用です。進捗と入力はこのブラウザに保存します。公式ラボの採点・修了には対応しません。
          </p>
          {storageFailed && (
            <p role="alert" className="mb-5 rounded-xl bg-ng-soft p-4 text-read-md text-ng">
              ブラウザへの保存ができません。画面を閉じると今回の進捗が失われる場合があります。
            </p>
          )}
          {selected ? (
            <LabRunner
              key={selected.id}
              lab={selected}
              progress={progressOf(record, selected.id)}
              onBack={() => setSelectedId(null)}
              onUpdate={(progress) => {
                const current = handsOnStore.snapshot().record;
                handsOnStore.set({
                  ...current,
                  labs: { ...current.labs, [selected.id]: progress },
                });
              }}
            />
          ) : (
            <section>
              <h2 className="font-bold text-read-xl">
                {CATEGORIES.find((item) => item.id === category)?.label}
              </h2>
              <p className="mt-2 text-read-md text-muted">
                演習を選ぶと、手順が一つずつ表示されます。
              </p>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {visible.map((lab) => {
                  const count = progressOf(record, lab.id).completed.length;
                  let action = "演習を始める";
                  if (count > 0) {
                    action = "続きから再開";
                  }

                  if (count === lab.steps.length) {
                    action = "完了結果を見る";
                  }

                  return (
                    <article
                      key={lab.id}
                      className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-6"
                    >
                      <h3 className="font-bold text-read-lg">{lab.title}</h3>
                      <p className="flex-1 text-read-md text-muted leading-relaxed">
                        {lab.summary}
                      </p>
                      <p className="text-read-sm text-muted">
                        {count} / {lab.steps.length} 手順完了
                      </p>
                      <progress
                        aria-label={`${lab.title}の進捗`}
                        value={count}
                        max={lab.steps.length}
                        className="h-2 w-full accent-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedId(lab.id)}
                        className="mt-2 cursor-pointer rounded-lg bg-accent px-5 py-3 text-read-sm font-bold text-white hover:bg-accent-hover"
                      >
                        {action}
                        <span className="sr-only">：{lab.title}</span>
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};
