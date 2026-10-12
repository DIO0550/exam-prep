import { useState } from "react";

import { checkInput } from "../check-input";
import { finishStep } from "../progress";
import type { Lab, LabProgress } from "../types";

const BUTTON =
  "cursor-pointer rounded-lg border border-edge px-4 py-2.5 font-medium hover:bg-hover disabled:cursor-not-allowed disabled:text-disabled";
type Props = {
  lab: Lab;
  progress: LabProgress;
  onUpdate: (progress: LabProgress) => void;
  onBack: () => void;
};

export const LabRunner = ({ lab, progress, onUpdate, onBack }: Props) => {
  const [requestedIndex, setIndex] = useState(
    Math.min(progress.completed.length, lab.steps.length),
  );
  const index = Math.min(requestedIndex, progress.completed.length, lab.steps.length);
  const [message, setMessage] = useState("");
  const [hintFor, setHintFor] = useState<string | null>(null);
  const [answerFor, setAnswerFor] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const step = lab.steps[index];
  const complete = progress.completed.length === lab.steps.length;

  const moveTo = (next: number) => {
    setIndex(next);
    setMessage("");
    setHintFor(null);
    setAnswerFor(null);
  };

  const reset = () => {
    onUpdate({ completed: [], drafts: {}, assisted: [] });
    setConfirmReset(false);
    moveTo(0);
  };

  const verify = () => {
    if (!step) {
      return;
    }

    if (!checkInput(step.kind, step.answer, progress.drafts[step.id] ?? "")) {
      setMessage(
        "まだ条件を満たしていません。操作先・名前・値と、必要なフラグを確認してください。",
      );
      return;
    }

    onUpdate(finishStep(progress, lab, step.id, answerFor === step.id));
    setMessage("");
  };

  const passed = step !== undefined && progress.completed.includes(step.id);
  const inputLabel = step?.kind === "command" ? "コマンド" : "設定ファイルの内容";
  return (
    <section className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className={BUTTON} onClick={onBack}>
          ← 演習一覧
        </button>
        <span className="text-read-sm text-muted">
          {progress.completed.length} / {lab.steps.length} 手順完了
        </span>
      </div>
      <header className="rounded-2xl border border-line bg-surface p-6">
        <span className="font-bold text-read-xs text-accent">ACE · ブラウザ内演習</span>
        <h2 className="mt-2 font-bold text-read-xl">{lab.title}</h2>
        <p className="mt-2 text-read-md text-muted leading-relaxed">{lab.summary}</p>
        <details className="mt-4 text-read-sm">
          <summary className="cursor-pointer font-bold">演習環境・公式リファレンス</summary>
          <ul className="my-3 list-disc space-y-1 pl-5 text-muted">
            {lab.setup.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            {lab.references.map((reference) => (
              <a
                key={reference.url}
                href={reference.url}
                target="_blank"
                rel="noreferrer"
                className="text-accent underline underline-offset-4"
              >
                {reference.title} ↗
              </a>
            ))}
          </div>
        </details>
      </header>
      <nav aria-label="演習の手順" className="flex flex-wrap gap-2">
        {lab.steps.map((item, number) => (
          <button
            key={item.id}
            type="button"
            onClick={() => moveTo(number)}
            disabled={number > progress.completed.length}
            aria-current={number === index ? "step" : undefined}
            aria-label={`手順${number + 1} ${item.title}`}
            className={`${BUTTON} text-read-sm ${number === index ? "border-accent bg-accent-soft text-accent" : "bg-surface"}`}
          >
            {progress.completed.includes(item.id) ? "✓ " : ""}
            {number + 1}
          </button>
        ))}
      </nav>
      {step && (
        <div className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
          <p className="font-bold text-read-xs text-accent">
            STEP {index + 1} · {step.kind.toUpperCase()}
          </p>
          <h3 className="mt-2 font-bold text-read-xl">{step.title}</h3>
          <p className="mt-3 whitespace-pre-wrap text-read-lg leading-relaxed">{step.task}</p>
          <form
            className="mt-5"
            onSubmit={(event) => {
              event.preventDefault();
              verify();
            }}
          >
            <label htmlFor="hands-on-input" className="mb-2 block font-bold text-read-sm">
              {inputLabel}
            </label>
            <textarea
              id="hands-on-input"
              value={progress.drafts[step.id] ?? ""}
              onChange={(event) => {
                setMessage("");
                onUpdate({
                  ...progress,
                  drafts: { ...progress.drafts, [step.id]: event.target.value },
                });
              }}
              readOnly={passed}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              maxLength={20000}
              rows={step.kind === "command" ? 4 : 10}
              aria-describedby="hands-on-format hands-on-feedback"
              className="w-full resize-y rounded-xl border border-edge bg-panel p-4 font-mono text-read-md leading-relaxed focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
              placeholder={step.kind === "command" ? "gcloud …" : "ここに設定を記述"}
            />
            <p id="hands-on-format" className="mt-2 text-read-xs text-muted">
              {step.kind === "command"
                ? "指定された名前・値で入力。フラグの順序、引用符、継続行、--key=value と --key value の違いを許容します。"
                : "演習の解答例に沿った構成を入力。HCL は空白・コメント、JSON はキーの順序を許容します。YAML はインデントを保ってください。"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={passed}
                className="cursor-pointer rounded-lg bg-accent px-5 py-3 font-bold text-read-sm text-white hover:bg-accent-hover disabled:cursor-default disabled:bg-ok"
              >
                {passed ? "✓ 確認済み" : "入力を確認"}
              </button>
              <button type="button" className={BUTTON} onClick={() => setHintFor(step.id)}>
                ヒント
              </button>
              <button type="button" className={BUTTON} onClick={() => setAnswerFor(step.id)}>
                解答例を見る
              </button>
            </div>
          </form>
          <div id="hands-on-feedback" aria-live="polite">
            {message && (
              <p role="alert" className="mt-4 rounded-lg bg-ng-soft p-4 text-read-md text-ng">
                {message}
              </p>
            )}
            {hintFor === step.id && (
              <p className="mt-4 rounded-lg bg-accent-soft p-4 text-read-md leading-relaxed">
                {step.hint}
              </p>
            )}
            {answerFor === step.id && (
              <div className="mt-4 rounded-xl border border-line bg-panel p-4">
                <p className="mb-2 font-bold text-read-sm">解答例</p>
                <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-read-md">
                  {step.answer}
                </pre>
              </div>
            )}
            {passed && (
              <div className="mt-5 rounded-xl border border-ok-line bg-ok-bg p-5">
                <p className="font-bold text-read-sm text-ok">学習用の確認結果</p>
                <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-read-md">
                  {step.result}
                </pre>
                <p className="mt-3 text-read-md leading-relaxed">{step.explain}</p>
                <button
                  type="button"
                  className={`${BUTTON} mt-4 bg-surface`}
                  onClick={() => moveTo(index + 1)}
                >
                  {index + 1 === lab.steps.length ? "完了結果を見る" : "次の手順 →"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {!step && complete && (
        <div className="rounded-2xl border border-ok-line bg-ok-bg p-7">
          <h3 className="font-bold text-read-xl text-ok">全手順を完了しました</h3>
          <p className="mt-3 text-read-md">
            {lab.steps.length} 手順を確認しました。解答例を参照して完了した手順：
            {progress.assisted.length}。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className={`${BUTTON} bg-surface`} onClick={() => moveTo(0)}>
              手順を振り返る
            </button>
            <button type="button" className={`${BUTTON} bg-surface`} onClick={onBack}>
              別の演習を選ぶ
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3 text-read-sm">
        {!confirmReset && (
          <button
            type="button"
            className={`${BUTTON} text-muted`}
            onClick={() => setConfirmReset(true)}
          >
            この演習をやり直す
          </button>
        )}
        {confirmReset && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-4">
            <span>この演習の入力と進捗を消して、最初から始めます。</span>
            <button type="button" className={`${BUTTON} text-ng`} onClick={reset}>
              最初から始める
            </button>
            <button type="button" className={BUTTON} onClick={() => setConfirmReset(false)}>
              キャンセル
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
