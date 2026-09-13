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
};

export const ExamSidebar = ({
  exams,
  groups,
  examIndex,
  closedGroups,
  onSelectExam,
  onToggleGroup,
}: ExamSidebarProps) => {
  return (
    <aside className="flex flex-[1_1_232px] flex-col gap-5 self-stretch border-line border-r bg-surface px-4 pt-5 pb-8">
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
                  {items.map(({ exam, index }) => {
                    const selected = index === examIndex;
                    return (
                      <button
                        key={exam.code}
                        type="button"
                        aria-current={selected ? "true" : undefined}
                        onClick={() => onSelectExam(index)}
                        className={`flex w-full cursor-pointer items-center gap-2.5 rounded-r-[9px] border-l-[2.5px] py-[9px] pr-2.5 pl-2 text-left hover:bg-hover ${
                          selected ? "border-l-accent bg-accent-soft" : "border-l-transparent"
                        }`}
                      >
                        <span
                          className={`flex size-7 flex-none items-center justify-center rounded-lg font-bold text-[10px] ${
                            selected ? "bg-accent text-surface" : "bg-chip text-muted-soft"
                          }`}
                        >
                          {exam.code}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span
                            className={`text-pretty text-[12.5px] leading-[1.45] ${
                              selected ? "font-bold text-accent-deep" : "font-medium text-ink"
                            }`}
                          >
                            {exam.name}
                          </span>
                          <span className="truncate text-[10.5px] text-muted-soft leading-[1.4]">
                            {exam.sub}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
