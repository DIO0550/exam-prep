"use client";

import { useState } from "react";

import { countCorrect, isCorrect } from "../grade";
import { dbDrillStore, useDbDrillRecord } from "../store";
import type { DbBlank, DbBlock, DbColumn, DbDrill } from "../types";

/** 本文中の空欄（`{{a}}`）。 */
const BLANK = /(\{\{[^}]+\}\})/;

/** 答え合わせの後、空欄ごとの正誤。答え合わせ前は undefined。 */
type Marks = Record<string, boolean> | undefined;

/** 本文の文字列。空欄は枠にし、答え合わせの後は正誤で色を付ける。 */
const DrillText = ({ text, marks }: { text: string; marks: Marks }) => (
  <>
    {text.split(BLANK).map((piece, i) => {
      const key = `${i}-${piece}`;
      if (!(piece.startsWith("{{") && piece.endsWith("}}"))) return <span key={key}>{piece}</span>;
      const name = piece.slice(2, -2);
      const mark = marks?.[name];
      return (
        <span
          key={key}
          role="img"
          aria-label={
            mark === undefined ? `空欄${name}` : `空欄${name}（${mark ? "正解" : "不正解"}）`
          }
          className={`mx-0.5 inline-block min-w-[2.6em] border px-1.5 text-center font-bold font-sans leading-[1.5] ${
            mark === undefined
              ? "border-ink"
              : mark
                ? "border-ok-line bg-ok-bg text-ok"
                : "border-ng-line bg-ng-bg text-ng"
          }`}
        >
          {name}
        </span>
      );
    })}
  </>
);

const PARAGRAPH = "text-pretty text-read-md text-ink-soft leading-[1.95]";

/** 列名。主キーは実線、外部キーは破線の下線（本試験の関係スキーマの書き方）。 */
// 文字の下線（text-decoration）は空欄の枠（inline-block）の下に引かれないので、下の枠線で引く。
const Column = ({ column, marks }: { column: DbColumn; marks: Marks }) => (
  <span
    className={
      column.key === "pk"
        ? "inline-block border-ink-soft border-b pb-0.5 leading-[1.6]"
        : column.key === "fk"
          ? "inline-block border-ink-soft border-b border-dashed pb-0.5 leading-[1.6]"
          : undefined
    }
  >
    <DrillText text={column.name} marks={marks} />
  </span>
);

const Block = ({ block, marks }: { block: DbBlock; marks: Marks }) => {
  switch (block.kind) {
    case "p":
      return (
        <p className={`${PARAGRAPH} indent-[1em]`}>
          <DrillText text={block.text} marks={marks} />
        </p>
      );
    case "schema":
      return (
        <figure className="flex flex-col gap-1.5 py-1">
          <div className="flex flex-col gap-1.5 rounded-md border border-edge bg-panel px-4 py-3 text-read-md text-ink-soft leading-[2.1]">
            {block.schemas.map((schema) => (
              <p key={schema.name}>
                {schema.name}（
                {schema.columns.map((column, i) => (
                  <span key={column.name}>
                    {i > 0 && "，"}
                    <Column column={column} marks={marks} />
                  </span>
                ))}
                ）
              </p>
            ))}
          </div>
          <figcaption className="text-center text-read-sm text-ink">{block.caption}</figcaption>
          <p className="text-center text-read-xs text-muted">
            実線の下線は主キー，破線の下線は外部キーを表す。主キーの一部である外部キーには破線を付けない。
          </p>
        </figure>
      );
    case "code":
      return (
        <figure className="flex flex-col gap-1.5 py-1">
          <pre className="overflow-x-auto rounded-md border border-edge bg-panel px-4 py-3 font-mono text-ink-soft text-read-sm leading-[2.1]">
            {block.lines.map((line, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 行は静的で並べ替えず、同じ行が並ぶこともある
              <span key={i} className="block min-h-[1lh] whitespace-pre">
                <DrillText text={line} marks={marks} />
              </span>
            ))}
          </pre>
          <figcaption className="text-center text-read-sm text-ink">{block.caption}</figcaption>
        </figure>
      );
    case "table":
      return (
        <figure className="flex flex-col gap-1.5 py-1">
          <figcaption className="text-center text-read-sm text-ink">{block.caption}</figcaption>
          <div className="overflow-x-auto">
            <table className="mx-auto border-collapse text-read-sm">
              <thead>
                <tr>
                  {block.headers.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="whitespace-nowrap border border-edge bg-canvas px-3 py-1.5 text-center font-bold text-ink"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: 表は静的で並べ替えないため添字で足りる
                  <tr key={rowIndex}>
                    {row.map((cell, i) => (
                      <td
                        // biome-ignore lint/suspicious/noArrayIndexKey: 同じ行に同じ値が並ぶのでセルの値はキーにできない
                        key={i}
                        className="whitespace-nowrap border border-edge px-3 py-1.5 text-ink-soft"
                      >
                        <DrillText text={cell} marks={marks} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      );
  }
};

/** 「イ　1 対多」のように、記号に中身を添える。 */
const answerLabel = (blank: DbBlank): string => {
  const choice = blank.choices?.find((c) => c.key === blank.answer);
  return choice ? `${choice.key}　${choice.text}` : blank.answer;
};

type BlankFieldProps = {
  drillId: string;
  blank: DbBlank;
  value: string;
  correct: boolean | undefined;
};

/** 空欄 1 つの答える欄。答え合わせの後は、正誤・正解・解説を下に出す。 */
const BlankField = ({ drillId, blank, value, correct }: BlankFieldProps) => {
  const label = `空欄${blank.key} の答え`;
  const chosen = blank.choices?.find((choice) => choice.key === value);
  return (
    <div className="flex flex-col gap-2 border-line-soft border-t py-3.5 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-bold text-[13px] text-ink">空欄 {blank.key}</span>
        <span className="text-[11px] text-muted-soft">{blank.hint}</span>
      </div>
      {blank.choices ? (
        <>
          <select
            aria-label={label}
            value={value}
            onChange={(event) => dbDrillStore.setAnswer(drillId, blank.key, event.target.value)}
            className={`w-full cursor-pointer truncate rounded-lg border bg-surface px-3 py-2 text-read-sm ${
              value === "" ? "border-edge-strong text-muted-soft" : "border-accent/60 text-ink"
            }`}
          >
            <option value="">選んでください</option>
            {blank.choices.map((choice) => (
              <option key={choice.key} value={choice.key}>
                {choice.key}　{choice.text}
              </option>
            ))}
          </select>
          {chosen && chosen.text.length > 16 && (
            <p className="text-pretty text-read-xs text-ink-soft leading-[1.7]">
              {chosen.key}　{chosen.text}
            </p>
          )}
        </>
      ) : (
        <input
          type="text"
          aria-label={label}
          value={value}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          onChange={(event) => dbDrillStore.setAnswer(drillId, blank.key, event.target.value)}
          className="w-full rounded-lg border border-edge-strong bg-surface px-3 py-2 font-mono text-read-sm text-ink"
        />
      )}
      {correct !== undefined && (
        <div
          className={`flex flex-col gap-1.5 rounded-lg border px-3.5 py-2.5 text-read-sm ${
            correct ? "border-ok-line bg-ok-bg" : "border-ng-line bg-ng-bg"
          }`}
        >
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className={`font-bold ${correct ? "text-ok" : "text-ng"}`}>
              {correct ? "○ 正解" : "× 不正解"}
            </span>
            <span className="text-muted">正解</span>
            <span className="font-bold text-ink">{answerLabel(blank)}</span>
          </div>
          {blank.accepts && (
            <span className="text-[11.5px] text-muted">{blank.accepts.join("、")} でも正解</span>
          )}
          <p className="text-pretty text-ink-soft leading-[1.8]">{blank.explain}</p>
        </div>
      )}
    </div>
  );
};

type DbDrillReaderProps = {
  drill: DbDrill;
  /** 一覧の中での番号（1 から）。 */
  no: number;
  onBack: () => void;
  /** 次の問題へ。最後の問題では undefined。 */
  onNext?: () => void;
};

/**
 * 穴埋めドリル 1 問を解く画面。左に問題文（関係スキーマ・SQL 文・表）、右に空欄ごとの答える欄。
 * 「答え合わせ」で空欄ごとに正誤を出し、本文の空欄にも正誤の色を付ける。
 */
export const DbDrillReader = ({ drill, no, onBack, onNext }: DbDrillReaderProps) => {
  const record = useDbDrillRecord();
  const answers = record.answers[drill.id] ?? {};
  const [checked, setChecked] = useState(false);

  const marks: Marks = checked
    ? Object.fromEntries(
        drill.blanks.map((blank) => [blank.key, isCorrect(blank, answers[blank.key] ?? "")]),
      )
    : undefined;
  const correctCount = countCorrect(drill.blanks, answers);

  const check = () => {
    setChecked(true);
    dbDrillStore.saveResult(drill.id, correctCount, drill.blanks.length);
  };

  return (
    <>
      <div className="flex min-w-0 flex-col md:flex-1 md:overflow-y-auto md:overscroll-contain">
        <main className="flex justify-center px-7 pb-16">
          <article className="flex w-full max-w-[820px] flex-col gap-5">
            <header className="flex flex-col gap-2 border-line border-b pt-5 pb-3.5">
              <button
                type="button"
                onClick={onBack}
                className="self-start cursor-pointer rounded-[7px] px-2 py-1 text-[12px] text-accent hover:bg-hover"
              >
                ← 穴埋めドリルの一覧へ
              </button>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-bold text-[12px] text-accent">No.{no}</span>
                <h1 className="font-bold text-[16px] leading-[1.5]">{drill.title}</h1>
              </div>
              <span className="text-[11.5px] text-muted-soft">
                {drill.topic} ・ 空欄 {drill.blanks.length} 個 ・ 本サイト作成（IPA
                の過去問題ではありません）
              </span>
            </header>

            {drill.body.map((block, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 本文は静的で並べ替えないため添字で足りる
              <Block key={i} block={block} marks={marks} />
            ))}

            {checked && (
              <section
                aria-label="この問のまとめ"
                className="mt-2 flex flex-col gap-2 rounded-xl border border-line bg-panel px-5 py-4"
              >
                <h2 className="font-bold text-[13px] text-accent-deep">この問のまとめ</h2>
                <ul className="flex list-disc flex-col gap-1 pl-5">
                  {drill.points.map((point) => (
                    <li
                      key={point}
                      className="text-pretty text-read-sm text-ink-soft leading-[1.8]"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        </main>
      </div>

      <aside
        aria-label="解答欄"
        className="flex flex-col gap-4 border-line border-t bg-surface px-5 pt-5 pb-10 md:min-h-0 md:w-[400px] md:flex-none md:overflow-y-auto md:overscroll-contain md:border-t-0 md:border-l"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-bold text-[14px]">解答欄</h2>
          <span className="text-[11px] text-muted-soft">
            大文字・小文字、全角・半角は問いません
          </span>
        </div>

        <section className="rounded-xl border border-line px-4 py-3.5">
          {drill.blanks.map((blank) => (
            <BlankField
              key={blank.key}
              drillId={drill.id}
              blank={blank}
              value={answers[blank.key] ?? ""}
              correct={marks?.[blank.key]}
            />
          ))}
        </section>

        {checked ? (
          <div className="flex flex-col gap-3">
            <div
              className={`rounded-xl border px-4 py-3 font-bold text-[13px] ${
                correctCount === drill.blanks.length
                  ? "border-ok-line bg-ok-bg text-ok"
                  : "border-line bg-panel text-ink"
              }`}
            >
              {correctCount}/{drill.blanks.length} 正解
            </div>
            <div className="flex flex-wrap gap-2">
              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="cursor-pointer rounded-[7px] bg-accent px-3 py-1.5 font-bold text-[12px] text-surface hover:bg-accent-hover"
                >
                  次の問題へ
                </button>
              )}
              <button
                type="button"
                onClick={() => setChecked(false)}
                className="cursor-pointer rounded-[7px] border border-edge-strong px-3 py-1.5 text-[12px] text-muted hover:bg-canvas"
              >
                答えを直す
              </button>
              <button
                type="button"
                onClick={() => {
                  dbDrillStore.clearAnswers(drill.id);
                  setChecked(false);
                }}
                className="cursor-pointer rounded-[7px] px-3 py-1.5 text-[12px] text-muted-soft hover:bg-canvas"
              >
                答えを消して解き直す
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={check}
            className="cursor-pointer rounded-lg bg-accent px-4 py-2.5 font-bold text-[13px] text-surface hover:bg-accent-hover"
          >
            答え合わせ
          </button>
        )}
      </aside>
    </>
  );
};
