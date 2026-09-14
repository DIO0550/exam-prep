import type { FeedbackMode, Screen } from "../hooks/use-quiz-session";
import type { TextScale } from "../text-scale";
import { TEXT_SCALE_LABELS, TEXT_SCALES } from "../text-scale";

type NavItem = {
  label: string;
  /** クリックしたときに行く画面。 */
  target: Screen;
  /** このタブを現在地として点灯させる画面。 */
  actives: Screen[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "学習ホーム", target: "home", actives: ["home"] },
  { label: "演習", target: "quiz", actives: ["quiz", "explain", "result"] },
  { label: "問題一覧・見直し", target: "review", actives: ["review"] },
];

type ToggleOption<T> = { label: string; value: T };

const FEEDBACK_OPTIONS: ToggleOption<FeedbackMode>[] = [
  { label: "同画面", value: "inline" },
  { label: "別画面", value: "page" },
];

/** 原本（IPA の PDF）の並びのまま出すか、並べ替えて出すか。 */
const SHUFFLE_OPTIONS: ToggleOption<boolean>[] = [
  { label: "原本順", value: false },
  { label: "シャッフル", value: true },
];

/** 問題文と解説を出す文字の大きさ。 */
const TEXT_SCALE_OPTIONS: ToggleOption<TextScale>[] = TEXT_SCALES.map((scale) => ({
  label: TEXT_SCALE_LABELS[scale],
  value: scale,
}));

type ToggleProps<T> = {
  label: string;
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** ヘッダー右側の切り替え。押しているものが白く浮く。 */
const Toggle = <T extends string | boolean>({
  label,
  options,
  value,
  onChange,
}: ToggleProps<T>) => (
  <div className="flex items-center gap-[7px]">
    <span className="whitespace-nowrap text-[11px] text-muted">{label}</span>
    <div className="flex rounded-[7px] bg-chip p-0.5">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`cursor-pointer whitespace-nowrap rounded-[5px] px-2.5 py-[5px] font-bold text-[11px] ${
              active
                ? "bg-surface text-accent shadow-[0_1px_2px_rgba(22,24,29,0.12)]"
                : "text-muted"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </div>
);

type SiteHeaderProps = {
  screen: Screen;
  feedback: FeedbackMode;
  /** 選択肢をシャッフルして出しているか。 */
  shuffle: boolean;
  /** 問題文と解説を出す文字の大きさ。 */
  textScale: TextScale;
  streakLabel: string;
  onNavigate: (screen: Screen) => void;
  onFeedbackChange: (mode: FeedbackMode) => void;
  onShuffleChange: (shuffle: boolean) => void;
  onTextScaleChange: (scale: TextScale) => void;
};

export const SiteHeader = ({
  screen,
  feedback,
  shuffle,
  textScale,
  streakLabel,
  onNavigate,
  onFeedbackChange,
  onShuffleChange,
  onTextScaleChange,
}: SiteHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-line border-b bg-surface px-6">
      <div className="flex min-w-0 flex-wrap items-center gap-[26px]">
        <div className="flex items-center gap-2.5 py-3">
          <span className="flex size-[26px] items-center justify-center rounded-[7px] bg-ink font-bold text-[11px] text-surface">
            Q
          </span>
          <span className="font-bold text-[13.5px] tracking-[0.02em]">試験対策ドリル</span>
        </div>
        <nav className="flex gap-[22px] self-stretch">
          {NAV_ITEMS.map((item) => {
            const active = item.actives.includes(screen);
            return (
              <button
                key={item.label}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onNavigate(item.target)}
                className={`-mb-px cursor-pointer border-b-2 px-0.5 pt-4 pb-[15px] text-[13px] hover:text-ink ${
                  active
                    ? "border-accent font-bold text-ink"
                    : "border-transparent font-medium text-muted"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 py-2.5">
        <Toggle
          label="選択肢"
          options={SHUFFLE_OPTIONS}
          value={shuffle}
          onChange={onShuffleChange}
        />
        <Toggle
          label="解説表示"
          options={FEEDBACK_OPTIONS}
          value={feedback}
          onChange={onFeedbackChange}
        />
        <Toggle
          label="文字サイズ"
          options={TEXT_SCALE_OPTIONS}
          value={textScale}
          onChange={onTextScaleChange}
        />
        <span className="h-[18px] w-px bg-edge" />
        <span className="text-[12px] text-muted">学習 {streakLabel}</span>
      </div>
    </header>
  );
};
