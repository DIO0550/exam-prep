"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";

import { OriginalFigure } from "@/features/quiz/components/question-figure";

import { pmAnswerStore, usePmAnswers } from "../answers";
import type { PmExam, PmProblem } from "../data";
import { pmProblemId, pmSourceLabel } from "../data";
import type { PmGrading, PmSlotGrade } from "../grading";
import { gradeTranscript, PM_POINTS_PER_PROBLEM, retrySlotKeys } from "../grading";
import type { KeyLine } from "../key-line";
import {
  answerKeyLine,
  KEY_MARKS,
  keyLineSlotKey,
  parseKeyLine,
  parseUnderline,
} from "../key-line";
import type { PmMark } from "../marks";
import { pmMarkStore, usePmMarks } from "../marks";
import type { PmAttempt } from "../record";
import { pmRecordStore, usePmRecord } from "../store";
import type {
  PmAnswerSlot,
  PmBlock,
  PmCell,
  PmChoice,
  PmQuestionPart,
  PmTranscript,
} from "../types";
import { ScoreInput } from "./score-input";

/** 本文中の空欄（`{{a}}`）と下線（`[[…]]`、`[[主:…]]`、`[[外:…]]`）を見つける。 */
const MARKUP = /(\{\{[^}]+\}\}|\[\[[^\]]+\]\])/;

const UNDERLINE = "underline decoration-1 underline-offset-[5px]";

/**
 * 本文の文字列を、空欄は枠、下線部は下線にして描く。
 * 主キーは実線、外部キーは破線の下線（本試験の E-R 図・関係スキーマの書き方）。
 * 下線の種類は読み上げでは伝わらないので、「（主キー）」などを読み上げ用に添える。
 */
export const PmText = ({ text }: { text: string }) => {
  const pieces = text.split(MARKUP);
  return (
    <>
      {pieces.map((piece, i) => {
        const key = `${i}-${piece}`;
        if (piece.startsWith("{{") && piece.endsWith("}}")) {
          const name = piece.slice(2, -2);
          return (
            <span
              key={key}
              role="img"
              aria-label={`空欄${name}`}
              className="mx-0.5 inline-block min-w-[2.6em] border border-ink px-1.5 text-center font-bold leading-[1.5]"
            >
              {name}
            </span>
          );
        }
        if (piece.startsWith("[[") && piece.endsWith("]]")) {
          const underline = parseUnderline(piece.slice(2, -2));
          if (!underline.key) {
            return (
              <span key={key} className={UNDERLINE}>
                {underline.text}
              </span>
            );
          }
          const mark = KEY_MARKS[underline.key];
          return (
            <span
              key={key}
              title={`${mark.label}（${mark.line}の下線）`}
              className={`${UNDERLINE} ${underline.key === "外" ? "decoration-dashed" : ""}`}
            >
              {underline.text}
              <span className="sr-only">（{mark.label}）</span>
            </span>
          );
        }
        return <span key={key}>{piece}</span>;
      })}
    </>
  );
};

/**
 * 代替テキスト用に、空欄を「空欄a」に、主キー・外部キーを「受診者ID（主キー）」のような言葉に直し、
 * 下線の印を外した文字列にする。
 */
export const plainText = (text: string): string =>
  text.replace(/\{\{([^}]+)\}\}/g, "空欄$1").replace(/\[\[([^\]]+)\]\]/g, (_, inner: string) => {
    const underline = parseUnderline(inner);
    return underline.key ? `${underline.text}（${KEY_MARKS[underline.key].label}）` : inner;
  });

/** セルの値を比べるための文字列（改行して並ぶ箇条書きは 1 つにつなぐ）。 */
const cellKey = (cell: PmCell | undefined): string | undefined =>
  Array.isArray(cell) ? cell.join("\n") : cell;

/**
 * columns に挙げた列が全て同じ値の行が続くところを、原本の結合セルとして縦にまとめる。
 * 各行の値は、まとめた先頭の行なら行数、まとめられて消える行なら 0。
 */
const rowSpansWhereSame = (rows: PmCell[][], columns: number[]): number[] => {
  const same = (a: PmCell[] | undefined, b: PmCell[]) =>
    a !== undefined && columns.every((i) => cellKey(a[i]) === cellKey(b[i]));
  return rows.map((row, r) => {
    if (same(rows[r - 1], row)) return 0;
    let span = 1;
    while (same(rows[r + span], row)) span += 1;
    return span;
  });
};

/** 0 列目から column 列目までの添字。 */
const columnsUpTo = (column: number): number[] => Array.from({ length: column + 1 }, (_, i) => i);

/**
 * 表の column 列目で同じ値が続く行を、原本の結合セルとして縦にまとめる。
 * 左の列も同じ値の行どうしだけをまとめる（左の列の結合をまたいではまとめない）。
 */
export const rowSpansOfColumn = (rows: PmCell[][], column: number): number[] =>
  rowSpansWhereSame(rows, columnsUpTo(column));

export const rowSpansOfFirstColumn = (rows: PmCell[][]): number[] => rowSpansOfColumn(rows, 0);

/**
 * 表の右端の列を、左の merged 列と右端の列の両方が同じ値の行どうしで縦にまとめる
 * （左の列の結合をまたいではまとめない）。
 */
export const rowSpansOfLastColumn = (rows: PmCell[][], merged: number): number[] => {
  const last = (rows[0]?.length ?? 1) - 1;
  return rowSpansWhereSame(rows, [...columnsUpTo(merged - 1), last]);
};

/** 表のセル。改行して並ぶ箇条書きは 1 行ずつ組む。 */
const CellText = ({ cell }: { cell: PmCell }) =>
  Array.isArray(cell) ? (
    cell.map((line, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: セルの行は静的で並べ替えない
      <span key={i} className="block">
        <PmText text={line} />
      </span>
    ))
  ) : (
    <PmText text={cell} />
  );

const PARAGRAPH = "text-pretty text-read-md text-ink-soft leading-[1.95]";

const Block = ({ block }: { block: PmBlock }) => {
  switch (block.kind) {
    case "heading":
      return <h3 className="pt-3 font-bold text-read-md text-ink">〔{block.text}〕</h3>;
    case "p":
      return (
        <p className={`${PARAGRAPH} indent-[1em]`}>
          <PmText text={block.text} />
        </p>
      );
    case "items":
      return (
        <dl className="grid grid-cols-[auto_1fr] gap-x-1 gap-y-1.5">
          {block.items.map((item) => (
            <div key={`${item.label}${item.text}`} className="contents">
              <dt className={`${PARAGRAPH} whitespace-nowrap`}>{item.label}</dt>
              <dd className={PARAGRAPH}>
                <PmText text={item.text} />
                {item.sub && (
                  <span className="block">
                    <PmText text={item.sub} />
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      );
    case "image":
      return (
        <div className="flex justify-center py-2">
          <OriginalFigure image={{ ...block.image, alt: plainText(block.image.alt) }} />
        </div>
      );
    case "code":
      return (
        <figure className="flex flex-col gap-1.5 py-1">
          <pre className="overflow-x-auto rounded-md border border-edge bg-panel px-4 py-3 font-mono text-ink-soft text-read-sm leading-[2.1]">
            {block.lines.map((line, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 行は静的で並べ替えず、同じ行が並ぶこともある
              <span key={i} className="block min-h-[1lh] whitespace-pre">
                <PmText text={line} />
              </span>
            ))}
          </pre>
          <figcaption className="text-center text-read-sm text-ink">{block.caption}</figcaption>
        </figure>
      );
    case "table": {
      const merged = block.mergeColumns ?? (block.mergeFirstColumn ? 1 : 0);
      const spans = Array.from({ length: merged }, (_, column) =>
        rowSpansOfColumn(block.rows, column),
      );
      // 右端の列を結合しない表では、どの列とも一致しない添字にしておく
      const lastColumn = block.mergeLastColumn ? block.headers.length - 1 : -1;
      const lastSpans = block.mergeLastColumn ? rowSpansOfLastColumn(block.rows, merged) : [];
      return (
        <figure className="flex flex-col gap-1.5 py-1">
          <figcaption className="text-center text-read-sm text-ink">{block.caption}</figcaption>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-read-sm">
              <thead>
                <tr>
                  {block.headers.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="border border-edge bg-canvas px-3 py-1.5 text-center font-bold text-ink"
                    >
                      <PmText text={header} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: 表は静的で並べ替えないため添字で足りる
                  <tr key={rowIndex}>
                    {row.map((cell, i) => {
                      const span =
                        (i === lastColumn ? lastSpans[rowIndex] : spans[i]?.[rowIndex]) ?? 1;
                      return span === 0 ? null : (
                        <td
                          // biome-ignore lint/suspicious/noArrayIndexKey: 同じ行に同じ値が並ぶのでセルの値はキーにできない
                          key={i}
                          rowSpan={span > 1 ? span : undefined}
                          className="border border-edge px-3 py-1.5 align-top text-ink-soft leading-[1.7]"
                        >
                          <CellText cell={cell} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      );
    }
  }
};

const ChoiceList = ({ choices }: { choices: PmChoice[] }) => (
  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg border border-line bg-panel px-4 py-3">
    {choices.map((choice) => (
      <div key={choice.key} className="contents">
        <dt className="font-bold text-read-sm text-ink">{choice.key}</dt>
        <dd className="text-pretty text-read-sm text-ink-soft leading-[1.75]">{choice.text}</dd>
      </div>
    ))}
  </dl>
);

const Part = ({ part }: { part: PmQuestionPart }) => (
  <section className="flex flex-col gap-3">
    <h3 className="font-bold text-read-md text-ink">{part.label}</h3>
    <p className={PARAGRAPH}>
      <PmText text={part.text} />
    </p>
    {part.choices && (
      <div className="flex flex-col gap-1.5">
        <div className="text-read-xs text-muted">解答群</div>
        <ChoiceList choices={part.choices} />
      </div>
    )}
    {part.items?.map((item) => (
      <div key={item.label} className="flex flex-col gap-2 pl-2">
        <div className="flex gap-1">
          <span className={PARAGRAPH}>{item.label}</span>
          <p className={PARAGRAPH}>
            <PmText text={item.text} />
          </p>
        </div>
        {item.choices && (
          <div className="flex flex-col gap-1.5 pl-6">
            <div className="text-read-xs text-muted">解答群</div>
            <ChoiceList choices={item.choices} />
          </div>
        )}
      </div>
    ))}
  </section>
);

const keyLineLabel = (line: KeyLine): string =>
  line === "" ? "下線なし" : `${KEY_MARKS[line].label}（${KEY_MARKS[line].line}）`;

const KEY_LINES: KeyLine[] = ["", "主", "外"];

type KeyLinePickerProps = { slot: PmAnswerSlot; line: KeyLine; onPick: (line: KeyLine) => void };

/**
 * 属性名に引く下線を選ぶ切り替え（なし・主キー・外部キー）。本試験では属性名に下線を引いて答えるので、
 * 文字の欄とは別に選ばせる。選択肢の文字そのものに実線・破線を引いて、線の違いを見せる。
 */
const KeyLinePicker = ({ slot, line, onPick }: KeyLinePickerProps) => {
  const name = useId();
  return (
    <div
      role="radiogroup"
      aria-label={`${slot.key} の下線`}
      className="flex flex-wrap items-center gap-1.5"
    >
      <span aria-hidden="true" className="mr-0.5 text-[11px] text-muted">
        下線
      </span>
      {KEY_LINES.map((option) => (
        <label
          key={option}
          className="cursor-pointer rounded-full border border-edge-strong px-2.5 py-0.5 text-[12px] text-muted has-[:checked]:border-accent/60 has-[:checked]:bg-accent-soft has-[:checked]:font-bold has-[:checked]:text-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={line === option}
            onChange={() => onPick(option)}
            className="sr-only"
          />
          {option === "" ? (
            "なし"
          ) : (
            <>
              <span className={`${UNDERLINE} ${option === "外" ? "decoration-dashed" : ""}`}>
                {KEY_MARKS[option].label}
              </span>
              （{KEY_MARKS[option].line}）
            </>
          )}
        </label>
      ))}
    </div>
  );
};

type SlotProps = {
  slot: PmAnswerSlot;
  value: string;
  /** 下線も答える欄で選んだ下線。 */
  line: KeyLine;
  revealed: boolean;
  grade: PmSlotGrade;
  onAnswer: (value: string) => void;
  onLine: (line: KeyLine) => void;
  onMark: (mark: PmMark | undefined) => void;
};

const MARK_LABEL: Record<PmMark, string> = { ok: "○ 正解", partial: "△ 部分点", ng: "× 不正解" };

/** 印ごとの色。ボタンを押したとき（on）・押していないとき（off）・枠（tone）・解説の印（badge）。 */
const MARK_STYLE: Record<PmMark, { on: string; off: string; tone: string; badge: string }> = {
  ok: {
    on: "border-ok bg-ok text-surface",
    off: "border-ok-line bg-surface text-ok hover:bg-ok-soft",
    tone: "border-ok-line bg-ok-bg",
    badge: "bg-ok-soft text-ok",
  },
  partial: {
    on: "border-flag bg-flag text-surface",
    off: "border-flag/40 bg-surface text-flag-ink hover:bg-flag-soft",
    tone: "border-flag/40 bg-flag-soft",
    badge: "bg-flag-soft text-flag-ink",
  },
  ng: {
    on: "border-ng bg-ng text-surface",
    off: "border-ng-line bg-surface text-ng hover:bg-ng-soft",
    tone: "border-ng-line bg-ng-bg",
    badge: "bg-ng-soft text-ng",
  },
};

/** 欄の答え合わせの枠の色。印が付くまでは色を付けない。 */
const gradeTone = (mark: PmMark | undefined): string =>
  mark ? MARK_STYLE[mark].tone : "border-line bg-panel";

/**
 * 記述の欄（と、記号を選ばずに紙で解いた欄）に、解答例と見比べて自分で ○△× を付けるボタン。
 * 押してある方をもう一度押すと、付けていない状態に戻る。
 * △（部分点）は記述の欄だけ。記号は合っているか違っているかのどちらかなので出さない。
 */
const MarkButtons = ({
  slotKey,
  mark,
  partial,
  onMark,
}: {
  slotKey: string;
  mark: PmMark | undefined;
  partial: boolean;
  onMark: (mark: PmMark | undefined) => void;
}) => (
  <fieldset className="m-0 flex flex-wrap items-center gap-1.5 border-0 p-0">
    <legend className="sr-only">{slotKey} の自己採点</legend>
    <span aria-hidden="true" className="mr-0.5 text-[11px] text-muted">
      自己採点
    </span>
    {(partial ? (["ok", "partial", "ng"] as const) : (["ok", "ng"] as const)).map((value) => {
      const pressed = mark === value;
      const { on, off } = MARK_STYLE[value];
      return (
        <button
          key={value}
          type="button"
          aria-pressed={pressed}
          onClick={() => onMark(pressed ? undefined : value)}
          className={`cursor-pointer rounded-[7px] border px-2.5 py-1 font-bold text-[12px] ${pressed ? on : off}`}
        >
          {MARK_LABEL[value]}
        </button>
      );
    })}
  </fieldset>
);

/** 「ク 境界防御」のように、記号に中身を添える。 */
const choiceLabel = (choices: PmChoice[], key: string): string => {
  const choice = choices.find((c) => c.key === key);
  return choice ? `${choice.key}　${choice.text}` : key;
};

const answerLabel = (slot: PmAnswerSlot): string =>
  slot.choices ? choiceLabel(slot.choices, slot.answer) : slot.answer;

/**
 * 答える欄 1 つ。解答群があれば選ぶ欄、無ければ文字を書く欄にする。
 *
 * 選ぶ欄は OS の `<select>` にしている。選択肢が長い文（「…を審査する。」）になる設問があり、
 * 自前のメニュー（SelectMenu）では開いたリストが画面の幅からはみ出すため。
 * 閉じた箱では長い選択肢が切れるので、選んだものの全文を下に添える。
 */
const Slot = ({ slot, value, line, revealed, grade, onAnswer, onLine, onMark }: SlotProps) => {
  const expectedLine = answerKeyLine(slot.answer);
  const chosen = slot.choices?.find((choice) => choice.key === value);
  // 「30字以内」の欄は、書いた字数を数えて、超えたら分かるようにする。
  const limitMatch = slot.hint.match(/(\d+)字以内/);
  const limit = limitMatch ? Number(limitMatch[1]) : undefined;
  const chars = [...value];
  const over = limit !== undefined && chars.length > limit ? chars.length - limit : 0;
  // 欄の名前は空白を含む（「設問2 c」）ので、aria-describedby に使える id は別に作る。
  const overId = useId();
  return (
    <div className="flex flex-col gap-2 border-line-soft border-t py-3.5 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-bold text-[13px] text-ink">{slot.key}</span>
        <span className={`text-[11px] ${over > 0 ? "font-bold text-ng" : "text-muted-soft"}`}>
          {slot.hint}
          {!slot.choices && value !== "" && ` ・ ${chars.length}字`}
          {over > 0 && `（${over}字オーバー）`}
        </span>
      </div>

      {slot.choices ? (
        <>
          <select
            aria-label={`${slot.key} の答え`}
            value={value}
            onChange={(event) => onAnswer(event.target.value)}
            className={`w-full cursor-pointer truncate rounded-lg border bg-surface px-3 py-2 text-read-sm ${
              value === "" ? "border-edge-strong text-muted-soft" : "border-accent/60 text-ink"
            }`}
          >
            <option value="">選んでください</option>
            {slot.choices.map((choice) => (
              <option key={choice.key} value={choice.key}>
                {choiceLabel(slot.choices ?? [], choice.key)}
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
        <>
          <textarea
            aria-label={`${slot.key} の答え`}
            aria-invalid={over > 0 || undefined}
            aria-describedby={over > 0 ? overId : undefined}
            value={value}
            rows={2}
            onChange={(event) => onAnswer(event.target.value)}
            className={`w-full resize-y rounded-lg border px-3 py-2 text-read-sm text-ink leading-[1.7] ${
              over > 0 ? "border-ng bg-ng-bg" : "border-edge-strong bg-surface"
            }`}
          />
          {/* どこからはみ出したかを、収まる部分と分けて見せる。削る場所を探しやすくするため。 */}
          {over > 0 && limit !== undefined && (
            <p id={overId} className="text-pretty text-read-xs leading-[1.7]">
              <span className="text-muted-soft">{limit}字目まで：</span>
              <span className="text-ink-soft">{chars.slice(0, limit).join("")}</span>
              <span className="text-muted-soft"> ／ はみ出し：</span>
              <span className="rounded-sm bg-ng-soft px-0.5 font-bold text-ng">
                {chars.slice(limit).join("")}
              </span>
            </p>
          )}
          {slot.keyUnderline && <KeyLinePicker slot={slot} line={line} onPick={onLine} />}
        </>
      )}

      {/*
        欄の下には答え合わせだけを出す。解説は解答欄の下の「解説」にまとめる。
        選んだ記号は自動で ○× を付け、記述の欄（と記号を選んでいない欄）は自分で ○△× を付ける。
      */}
      {revealed && (
        <div
          className={`flex flex-col gap-2 rounded-lg border px-3.5 py-2 text-read-sm ${gradeTone(grade.mark)}`}
        >
          <div className="flex flex-wrap items-baseline gap-x-2">
            {grade.auto && grade.mark && (
              <span className={`font-bold ${grade.mark === "ok" ? "text-ok" : "text-ng"}`}>
                {MARK_LABEL[grade.mark]}
              </span>
            )}
            <span className="text-muted">解答例</span>
            <span className="font-bold text-ink">
              <PmText text={answerLabel(slot)} />
            </span>
            {/*
              属性名の文字は自己採点だが、下線は選んだものと解答例を突き合わせて正誤を出す。
              下線が違えば、属性名が合っていても欄ごと × にする（採点の側で決める）。
              属性名を書いていない（紙で解いた）欄は、下線も選んでいないので出さない。
            */}
            {slot.keyUnderline && value !== "" && (
              <span className="flex basis-full flex-wrap items-baseline gap-x-2 pt-1 text-read-xs">
                <span className={`font-bold ${line === expectedLine ? "text-ok" : "text-ng"}`}>
                  {line === expectedLine ? "○ 下線" : "× 下線"}
                </span>
                <span className="text-ink-soft">
                  {line === expectedLine
                    ? keyLineLabel(expectedLine)
                    : `選んだのは${keyLineLabel(line)}、解答例は${keyLineLabel(expectedLine)}`}
                </span>
              </span>
            )}
          </div>
          {!grade.auto && (
            <MarkButtons
              slotKey={slot.key}
              mark={grade.mark}
              partial={!slot.choices}
              onMark={onMark}
            />
          )}
        </div>
      )}
    </div>
  );
};

const EXPLAIN_TEXT = "text-pretty text-read-sm text-ink-soft leading-[1.8]";

const ExplainSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="flex flex-col gap-1.5">
    <h5 className="font-bold text-[12px] text-accent-deep tracking-[0.04em]">{title}</h5>
    {children}
  </section>
);

/** 解答例の下に出す、詳しい解説。根拠の箇所から答えまでの道筋を順に追えるようにする。 */
const SlotExplain = ({ slot }: { slot: PmAnswerSlot }) => (
  <div className="flex flex-col gap-3.5 border-accent/30 border-l-2 py-1 pl-3.5">
    <ExplainSection title="本文の手がかり">
      <ul className="flex flex-col gap-1.5">
        {slot.clues.map((clue) => (
          <li
            key={clue}
            className="rounded-md bg-figure px-3 py-1.5 text-pretty text-read-sm text-ink-soft leading-[1.75]"
          >
            <PmText text={clue} />
          </li>
        ))}
      </ul>
    </ExplainSection>

    <ExplainSection title="答えまでの考え方">
      <ol className="flex flex-col gap-1.5">
        {slot.steps.map((step, i) => (
          <li key={step} className="flex gap-2">
            <span
              aria-hidden="true"
              className="mt-[3px] flex size-[18px] flex-none items-center justify-center rounded-full bg-accent-soft font-bold text-[10px] text-accent"
            >
              {i + 1}
            </span>
            <p className={EXPLAIN_TEXT}>
              <PmText text={step} />
            </p>
          </li>
        ))}
      </ol>
    </ExplainSection>

    {slot.choiceNotes && (
      <ExplainSection title="選択肢ごとの判定">
        <dl className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1.5">
          {slot.choiceNotes.map((note) => (
            <div key={note.key} className="contents">
              <dt
                className={`font-bold text-read-sm ${note.key === slot.answer ? "text-accent" : "text-ink"}`}
              >
                {note.key}
              </dt>
              <dd className={EXPLAIN_TEXT}>
                <PmText text={note.note} />
              </dd>
            </div>
          ))}
        </dl>
      </ExplainSection>
    )}

    {slot.points && (
      <ExplainSection title="解答に入れたい要素">
        <ul className="flex list-disc flex-col gap-1 pl-5">
          {slot.points.map((point) => (
            <li key={point} className={EXPLAIN_TEXT}>
              <PmText text={point} />
            </li>
          ))}
        </ul>
      </ExplainSection>
    )}

    {slot.pitfalls && (
      <ExplainSection title="間違えやすいところ">
        <ul className="flex flex-col gap-1.5">
          {slot.pitfalls.map((pitfall) => (
            <li
              key={pitfall}
              className="rounded-md border border-flag/30 bg-flag-soft px-3 py-1.5 text-pretty text-read-sm text-ink-soft leading-[1.75]"
            >
              <PmText text={pitfall} />
            </li>
          ))}
        </ul>
      </ExplainSection>
    )}

    {slot.knowledge && (
      <ExplainSection title="押さえておきたい知識">
        {slot.knowledge.map((item) => (
          <p key={item} className={EXPLAIN_TEXT}>
            <PmText text={item} />
          </p>
        ))}
      </ExplainSection>
    )}
  </div>
);

/** 解答群の用語の説明。設問の欄の後ろに出す。 */
const Glossary = ({ part }: { part: PmQuestionPart }) =>
  part.glossary ? (
    <div className="mt-1 flex flex-col gap-2 rounded-lg border border-line bg-panel px-3.5 py-3">
      <h4 className="font-bold text-[12px] text-accent-deep">{part.label} 解答群の用語</h4>
      <dl className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1.5">
        {part.glossary.map((entry) => (
          <div key={entry.key} className="contents">
            <dt className="font-bold text-read-sm text-ink">{entry.key}</dt>
            <dd className={EXPLAIN_TEXT}>
              <PmText text={entry.note} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  ) : null;

/** 解説の見出しに添える、その欄に付いた ○△×。間違えた欄の解説を探しやすくするため。 */
const MarkBadge = ({ mark }: { mark: PmMark | undefined }) =>
  mark ? (
    <span className={`rounded px-1.5 py-0.5 font-bold text-[11px] ${MARK_STYLE[mark].badge}`}>
      {MARK_LABEL[mark]}
    </span>
  ) : null;

/** 小数第 1 位までの点数を、整数ならそのまま、そうでなければ小数で書く。 */
const formatPoints = (points: number): string =>
  Number.isInteger(points) ? String(points) : points.toFixed(1);

type GradeSummaryProps = {
  grading: PmGrading;
  id: string;
  source: string;
  attempt: PmAttempt | undefined;
};

/**
 * 欄ごとの ○△× の集計と、そこから出した点数の目安。
 * 目安は、全部の欄に印が付いたときに、○ を 1 欄・△ を半欄と数えた割合で 1 問の配点を按分したもの。
 */
const GradeSummary = ({ grading, id, source, attempt }: GradeSummaryProps) => {
  const { total, ok, partial, ng, ungraded, score, points, choices, lines } = grading;
  const recorded = score !== undefined && attempt?.score === score;
  // 自動で突き合わせた欄（記号・下線）の内訳。その欄が無い問では出さない。
  const autoCounts = [
    choices.total > 0 && `記号の欄 ${choices.ok}/${choices.total} 正解`,
    lines.total > 0 && `下線 ${lines.ok}/${lines.total} 正解`,
  ].filter(Boolean);
  return (
    <section
      aria-label="自己採点"
      className="flex flex-col gap-2.5 rounded-xl border border-line bg-panel px-4 py-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[12.5px] text-ink tabular-nums">
            自己採点 <span className="font-bold text-ok">○ {ok}</span> ・{" "}
            {partial > 0 && (
              <>
                <span className="font-bold text-flag-ink">△ {partial}</span> ・{" "}
              </>
            )}
            <span className="font-bold text-ng">× {ng}</span>
            {ungraded > 0 && ` ・ 未採点 ${ungraded}`}（全 {total} 欄）
          </span>
          {autoCounts.length > 0 && (
            <span className="text-[11px] text-muted tabular-nums">{autoCounts.join(" ・ ")}</span>
          )}
        </div>
        <ScoreInput id={id} source={source} attempt={attempt} />
      </div>
      {score === undefined || points === undefined ? (
        <p className="text-pretty text-[11.5px] text-muted leading-[1.7]">
          記述の欄は解答例と見比べて ○・△（要点の一部だけ書けた）・×
          を付けてください。全部の欄に付けると、○ を 1 欄・△
          を半欄として数えた割合から点数の目安を出して記録します。
        </p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <p className="text-[12.5px] text-ink tabular-nums">
            目安 <span className="font-bold">{score}点</span>
            <span className="text-muted">
              （本番の配点では {PM_POINTS_PER_PROBLEM}点中 {formatPoints(points)}点）
            </span>
            {recorded && <span className="ml-1.5 text-[11px] text-muted-soft">記録済み</span>}
          </p>
          {!recorded && (
            <button
              type="button"
              onClick={() => pmRecordStore.setScore(id, score)}
              className="cursor-pointer rounded-[7px] border border-edge-strong bg-surface px-2.5 py-1 font-bold text-[11.5px] text-accent hover:bg-canvas"
            >
              {score}点で記録し直す
            </button>
          )}
        </div>
      )}
    </section>
  );
};

/** 解答欄の幅（px）。狭すぎると選ぶ欄が切れ、広すぎると問題文が読みにくくなる。 */
export const ANSWER_WIDTH_MIN = 320;
export const ANSWER_WIDTH_MAX = 900;
const DEFAULT_ANSWER_WIDTH = 400;
const KEY_STEP = 40;
/** 問題文の側に最低限残す幅。 */
const BODY_WIDTH_MIN = 360;
const ANSWER_WIDTH_KEY = "exam-prep:pm-past-answer-width:v1";

const clampAnswerWidth = (width: number): number => {
  const max =
    typeof window === "undefined"
      ? ANSWER_WIDTH_MAX
      : Math.min(ANSWER_WIDTH_MAX, Math.max(ANSWER_WIDTH_MIN, window.innerWidth - BODY_WIDTH_MIN));
  return Math.min(max, Math.max(ANSWER_WIDTH_MIN, Math.round(width)));
};

/** 前に合わせた幅を読む。読めなければ既定の幅。端末ごとの好みなので localStorage で足りる。 */
const loadAnswerWidth = (): number => {
  try {
    const saved = Number(window.localStorage.getItem(ANSWER_WIDTH_KEY));
    return saved > 0 ? clampAnswerWidth(saved) : DEFAULT_ANSWER_WIDTH;
  } catch {
    return DEFAULT_ANSWER_WIDTH;
  }
};

const saveAnswerWidth = (width: number): void => {
  try {
    window.localStorage.setItem(ANSWER_WIDTH_KEY, String(width));
  } catch {
    // 保存できなくても、この画面のあいだは合わせた幅のまま使える。
  }
};

/**
 * 解答欄の幅。境目をつまんで動かしている間は画面の中だけで変え、手を離したときに覚える。
 * 解答欄は右端に寄せてあるので、幅は「画面の右端からポインタまで」で決まる。
 */
const useAnswerWidth = () => {
  const [width, setWidth] = useState(loadAnswerWidth);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (event: PointerEvent): void => {
      event.preventDefault();
      setWidth(clampAnswerWidth(window.innerWidth - event.clientX));
    };
    const onUp = (): void => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging]);

  useEffect(() => {
    if (!dragging) saveAnswerWidth(width);
  }, [dragging, width]);

  const nudge = (delta: number) => setWidth((prev) => clampAnswerWidth(prev + delta));
  return { width, dragging, startDrag: () => setDragging(true), nudge };
};

type PmReaderProps = {
  pmExam: PmExam;
  problem: PmProblem;
  transcript: PmTranscript;
  onBack: () => void;
};

/**
 * 書き起こした午後の問題を解く画面。左に問題文と設問、右に答える欄を置く。
 * 「解答例を見る」で欄ごとに IPA の解答例と本サイトの解説を出す。
 */
export const PmReader = ({ pmExam, problem, transcript, onBack }: PmReaderProps) => {
  const id = pmProblemId(pmExam, problem.no);
  const source = pmSourceLabel(pmExam, problem.no);
  const answers = usePmAnswers()[id] ?? {};
  const marks = usePmMarks()[id] ?? {};
  const attempt = usePmRecord().attempts[id];
  const [revealed, setRevealed] = useState(false);
  const answerWidth = useAnswerWidth();
  const grading = gradeTranscript(transcript, answers, marks);
  const retryKeys = retrySlotKeys(grading);

  /**
   * 全部の欄に印が付いたら、点数の目安を記録する。ただし点数がまだ無いときだけ。
   * 手で直した点数や、解き直す前の点数を、黙って書き換えないようにするため
   * （付け直したいときは「…点で記録し直す」を押す）。
   */
  const recordFirstScore = () => {
    const next = gradeTranscript(
      transcript,
      pmAnswerStore.snapshot()[id] ?? {},
      pmMarkStore.snapshot()[id] ?? {},
    );
    if (next.score !== undefined && pmRecordStore.snapshot().attempts[id]?.score === undefined) {
      pmRecordStore.setScore(id, next.score);
    }
  };

  const reveal = () => {
    setRevealed(true);
    if (!attempt) pmRecordStore.markSolved(id);
    recordFirstScore();
  };

  const lineOf = (slot: PmAnswerSlot): KeyLine => parseKeyLine(answers[keyLineSlotKey(slot.key)]);

  const answer = (key: string, value: string) => {
    pmAnswerStore.set(id, key, value);
    // 解答例を見ながら記号や下線を選び直すと ○× が変わる
    if (revealed) recordFirstScore();
  };

  const mark = (key: string, value: PmMark | undefined) => {
    pmMarkStore.set(id, key, value);
    recordFirstScore();
  };

  /** × と △ の欄の答えと印だけを消して、解答例を隠す。○ の欄はそのまま残す。 */
  const retryWrong = () => {
    // 属性名の欄は、選んだ下線も選び直してもらう
    pmAnswerStore.clearSlots(id, [...retryKeys, ...retryKeys.map(keyLineSlotKey)]);
    pmMarkStore.clearSlots(id, retryKeys);
    setRevealed(false);
  };

  return (
    <>
      <div
        className={`flex min-w-0 flex-col md:flex-1 md:overflow-y-auto md:overscroll-contain ${
          answerWidth.dragging ? "select-none" : ""
        }`}
      >
        <main className="flex justify-center px-7 pb-16">
          <article className="flex w-full max-w-[820px] flex-col gap-5">
            <header className="flex flex-col gap-2 border-line border-b pt-5 pb-3.5">
              <button
                type="button"
                onClick={onBack}
                className="self-start cursor-pointer rounded-[7px] px-2 py-1 text-[12px] text-accent hover:bg-hover"
              >
                ← 午後過去問の一覧へ
              </button>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-bold text-[12px] text-accent">問{problem.no}</span>
                <h1 className="font-bold text-[16px] leading-[1.5]">{problem.field}</h1>
              </div>
              <span className="text-[11.5px] text-muted-soft">出典：{source}</span>
            </header>

            <p className={PARAGRAPH}>{transcript.lead}</p>
            {transcript.body.map((block, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 本文は静的で並べ替えないため添字で足りる
              <Block key={i} block={block} />
            ))}

            <div className="mt-4 flex flex-col gap-6 border-line border-t pt-5">
              {transcript.parts.map((part) => (
                <Part key={part.label} part={part} />
              ))}
            </div>
          </article>
        </main>
      </div>

      {/* 解答欄の外枠。つまむところをスクロールに巻き込まないよう、スクロールは内側の aside に持たせる。 */}
      <div
        style={{ ["--answer-width" as string]: `${answerWidth.width}px` }}
        className="relative flex flex-col md:min-h-0 md:flex-[0_0_var(--answer-width)]"
      >
        {/* 境目をつまんで、問題文と解答欄の幅の配分を変える。狭い画面では縦に並ぶので出さない。 */}
        <button
          type="button"
          aria-label={`解答欄の幅を変える（今 ${answerWidth.width}px。← → でも変えられる）`}
          onPointerDown={(event) => {
            event.preventDefault();
            answerWidth.startDrag();
          }}
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            answerWidth.nudge(event.key === "ArrowLeft" ? KEY_STEP : -KEY_STEP);
          }}
          className={`-left-1.5 absolute inset-y-0 z-10 hidden w-3 cursor-col-resize touch-none border-none p-0 md:block ${
            answerWidth.dragging ? "bg-accent-soft" : "bg-transparent hover:bg-accent-soft"
          }`}
        />
        <aside
          aria-label="解答欄"
          className="flex flex-col gap-4 border-line border-t bg-surface px-5 pt-5 pb-10 md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-contain md:border-t-0 md:border-l"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-bold text-[14px]">解答欄</h2>
            <span className="text-[11px] text-muted-soft">書いた答えはこのブラウザに残ります</span>
          </div>

          {transcript.parts.map((part) => (
            <section key={part.label} className="rounded-xl border border-line px-4 py-3.5">
              {part.slots.map((slot) => (
                <Slot
                  key={slot.key}
                  slot={slot}
                  value={answers[slot.key] ?? ""}
                  line={lineOf(slot)}
                  revealed={revealed}
                  grade={grading.slots[slot.key] ?? { mark: undefined, auto: false }}
                  onAnswer={(value) => answer(slot.key, value)}
                  onLine={(value) => answer(keyLineSlotKey(slot.key), value)}
                  onMark={(value) => mark(slot.key, value)}
                />
              ))}
            </section>
          ))}

          {revealed ? (
            <div className="flex flex-col gap-4">
              <GradeSummary grading={grading} id={id} source={source} attempt={attempt} />
              <p className="text-pretty text-[11px] text-muted-soft leading-[1.7]">
                解答例は IPA
                が示した例で、唯一の正解ではありません。選んだ記号と属性名の下線には、自動で ○×
                を付けています。点数の目安は、どの欄も同じ重さとし、△
                を半分として按分したものです（IPA が公表している配点は 1 問 {PM_POINTS_PER_PROBLEM}{" "}
                点までで、設問・欄ごとの配点や部分点の付け方は公表されていません）。
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setRevealed(false)}
                  className="cursor-pointer rounded-[7px] border border-edge-strong px-3 py-1.5 text-[12px] text-muted hover:bg-canvas"
                >
                  解答例を隠す
                </button>
                {retryKeys.length > 0 && (
                  <button
                    type="button"
                    onClick={retryWrong}
                    className="cursor-pointer rounded-[7px] border border-ng-line bg-surface px-3 py-1.5 font-bold text-[12px] text-ng hover:bg-ng-soft"
                  >
                    {grading.partial > 0 ? "× と △ の欄を解き直す" : "× の欄だけ解き直す"}（
                    {retryKeys.length}欄）
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    pmAnswerStore.clearProblem(id);
                    pmMarkStore.clearProblem(id);
                    setRevealed(false);
                  }}
                  className="cursor-pointer rounded-[7px] px-3 py-1.5 text-[12px] text-muted-soft hover:bg-canvas"
                >
                  答えを消して解き直す
                </button>
              </div>

              <section
                aria-label="解説"
                className="mt-4 flex flex-col gap-5 border-line border-t-2 pt-5"
              >
                <h2 className="font-bold text-[15px]">解説</h2>
                {transcript.parts.map((part) => (
                  <section key={part.label} className="flex flex-col gap-4">
                    <h3 className="border-accent border-l-[3px] pl-2.5 font-bold text-[14px] text-ink">
                      {part.label}
                    </h3>
                    {part.slots.map((slot) => (
                      <article
                        key={slot.key}
                        aria-label={`${slot.key} の解説`}
                        className="flex flex-col gap-3 rounded-xl border border-line px-4 py-3.5"
                      >
                        <div className="flex flex-wrap items-baseline gap-x-2.5">
                          <h4 className="font-bold text-[13.5px] text-ink">{slot.key}</h4>
                          <MarkBadge mark={grading.slots[slot.key]?.mark} />
                          <span className="text-read-sm text-muted">解答例</span>
                          <span className="font-bold text-read-sm text-ink">
                            <PmText text={answerLabel(slot)} />
                          </span>
                        </div>
                        <p className="text-pretty text-read-sm text-ink leading-[1.85]">
                          <PmText text={slot.explain} />
                        </p>
                        <SlotExplain slot={slot} />
                      </article>
                    ))}
                    <Glossary part={part} />
                  </section>
                ))}
                <section className="flex flex-col gap-1.5">
                  <h3 className="font-bold text-[13px] text-ink">出題趣旨（IPA）</h3>
                  <p className="text-pretty text-read-sm text-ink-soft leading-[1.85]">
                    <PmText text={transcript.intent} />
                  </p>
                </section>
                <section className="flex flex-col gap-1.5">
                  <h3 className="font-bold text-[13px] text-ink">この問の解き方</h3>
                  <ol className="flex list-decimal flex-col gap-1.5 pl-5">
                    {transcript.approach.map((item) => (
                      <li
                        key={item}
                        className="text-pretty text-read-sm text-ink-soft leading-[1.85]"
                      >
                        <PmText text={item} />
                      </li>
                    ))}
                  </ol>
                </section>
                <section className="flex flex-col gap-1.5">
                  <h3 className="font-bold text-[13px] text-ink">読みどころ</h3>
                  <p className="text-pretty text-read-sm text-ink-soft leading-[1.85]">
                    <PmText text={transcript.overview} />
                  </p>
                </section>
              </section>
            </div>
          ) : (
            <button
              type="button"
              onClick={reveal}
              className="cursor-pointer rounded-lg bg-accent px-4 py-2.5 font-bold text-[13px] text-surface hover:bg-accent-hover"
            >
              解答例を見る
            </button>
          )}
        </aside>
      </div>
    </>
  );
};
