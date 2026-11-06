import { Fragment } from "react";

import type { Exam } from "../types";

type ExamSidebarProps = {
  exams: Exam[];
  /** 見出しの並び順。 */
  groups: string[];
  /** 選択中の試験（exams の添字）。 */
  examIndex: number;
  /** 折りたたんでいる見出し。 */
  closedGroups: string[];
  onSelectExam: (index: number) => void;
  onToggleGroup: (group: string) => void;
  /**
   * 試験の行のすぐ後ろに足す、問題集ではない行（応用情報 午後の過去問ページなど）。
   * after の略号の試験の下に出す。
   */
  extras?: SidebarExtra[];
};

export type SidebarExtra = {
  /** この略号の試験の行の下に出す。 */
  after: string;
  badge: string;
  name: string;
  sub: string;
  selected: boolean;
  onSelect: () => void;
};

const badgeClass = (text: string, selected: boolean): string =>
  // 4 文字の略号（APPM など）は 10px だと枠からはみ出すので、少し詰める。
  `flex size-7 flex-none items-center justify-center overflow-hidden rounded-lg font-bold ${
    text.length >= 4 ? "text-[8.5px] tracking-[-0.02em]" : "text-[10px]"
  } ${selected ? "bg-accent text-surface" : "bg-chip text-muted-soft"}`;

type SidebarRowProps = {
  badge: string;
  name: string;
  sub: string;
  selected: boolean;
  onSelect: () => void;
};

const SidebarRow = ({ badge, name, sub, selected, onSelect }: SidebarRowProps) => (
  <button
    type="button"
    aria-current={selected ? "true" : undefined}
    onClick={onSelect}
    className={`flex w-full cursor-pointer items-center gap-2.5 rounded-r-[9px] border-l-[2.5px] py-[9px] pr-2.5 pl-2 text-left hover:bg-hover ${
      selected ? "border-l-accent bg-accent-soft" : "border-l-transparent"
    }`}
  >
    <span className={badgeClass(badge, selected)}>{badge}</span>
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span
        className={`text-pretty text-[12.5px] leading-[1.45] ${
          selected ? "font-bold text-accent-deep" : "font-medium text-ink"
        }`}
      >
        {name}
      </span>
      <span className="truncate text-[10.5px] text-muted-soft leading-[1.4]">{sub}</span>
    </span>
  </button>
);

export const ExamSidebar = ({
  exams,
  groups,
  examIndex,
  closedGroups,
  onSelectExam,
  onToggleGroup,
  extras = [],
}: ExamSidebarProps) => {
  return (
    // 幅があるときは右側と別に動く枠。狭いときは上に積まれ、ページと一緒に動く。
    <aside className="flex flex-col gap-5 self-stretch border-line border-r bg-surface px-4 pt-5 pb-8 md:flex-[1_1_232px] md:overflow-y-auto md:overscroll-contain">
      <nav className="flex flex-col gap-3.5">
        {groups.map((group) => {
          const open = !closedGroups.includes(group);
          const items = exams
            .map((exam, index) => ({ exam, index }))
            .filter(({ exam }) => exam.group === group);

          return (
            <div key={group} className="flex flex-col gap-[5px]">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => onToggleGroup(group)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-[7px] px-2 pt-1 pb-[5px] text-left hover:bg-hover"
              >
                <span
                  aria-hidden="true"
                  className={`inline-block w-2.5 text-[9px] text-muted transition-transform duration-150 ${
                    open ? "rotate-90" : ""
                  }`}
                >
                  ▶
                </span>
                <span className="flex-1 font-bold text-[10.5px] text-muted tracking-[0.12em]">
                  {group}
                </span>
                <span className="text-[10.5px] text-muted-soft tabular-nums">{items.length}件</span>
              </button>

              {open && (
                <div className="flex flex-col gap-[3px]">
                  {items.map(({ exam, index }) => (
                    <Fragment key={exam.code}>
                      <SidebarRow
                        badge={exam.code}
                        name={exam.name}
                        sub={exam.sub}
                        selected={index === examIndex}
                        onSelect={() => onSelectExam(index)}
                      />
                      {extras
                        .filter((extra) => extra.after === exam.code)
                        .map((extra) => (
                          <SidebarRow key={extra.name} {...extra} />
                        ))}
                    </Fragment>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
