import type { Scenario } from "../types";
import { FigureBlock } from "./figure-block";

type ScenarioBlockProps = {
  scenario: Scenario;
  /** inline は演習画面、page は解説画面。図の地色が変わる。 */
  variant: "inline" | "page";
  /** 最初から開いておくか。解説画面では設問を読み終えたあとなので閉じておく。 */
  defaultOpen?: boolean;
};

/**
 * 午後問題の事例文。設問の上に置き、折りたためるようにする。
 *
 * 同じ事例の設問が続くとき、2 問目からは読み返す必要が薄いので、閉じて設問だけを見られるようにする。
 * details は開閉を自分で持つので、同じ画面で次の設問へ進んでも閉じたままになる。
 */
export const ScenarioBlock = ({ scenario, variant, defaultOpen = true }: ScenarioBlockProps) => {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-line bg-panel px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-2">
        <span className="rounded bg-chip px-1.5 py-0.5 font-bold text-[10px] text-muted tracking-[0.1em]">
          事例
        </span>
        <span className="font-bold text-read-sm text-ink">〔{scenario.title}〕</span>
        <span className="text-read-xs text-muted-soft group-open:hidden">（開いて読む）</span>
        <span className="hidden text-read-xs text-muted-soft group-open:inline">（たたむ）</span>
      </summary>
      <div className="mt-4 flex flex-col gap-3">
        {scenario.body.map((paragraph) => (
          <p
            key={paragraph}
            className="max-w-[104ch] text-pretty text-read-md text-ink-soft leading-[1.9]"
          >
            {paragraph}
          </p>
        ))}
        {scenario.figures?.map((figure) => (
          <div
            key={figure.caption}
            className="mt-1 max-w-[1000px] rounded-xl border border-line bg-surface px-5 pt-5 pb-[18px]"
          >
            <FigureBlock figure={figure} variant={variant} />
          </div>
        ))}
      </div>
    </details>
  );
};
