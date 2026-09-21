type SegmentedProps<T extends string | number | boolean> = {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
};

/** 見直し画面の絞り込みと同じ見た目の切り替え。押しているものが白く浮く。 */
export const Segmented = <T extends string | number | boolean>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) => {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="whitespace-nowrap font-bold text-[10.5px] text-muted tracking-[0.12em]">
        {label}
      </span>
      <fieldset className="flex flex-wrap rounded-lg bg-track p-[3px]">
        <legend className="sr-only">{label}</legend>
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={String(option.value)}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`cursor-pointer whitespace-nowrap rounded-md px-[13px] py-[7px] font-bold text-[11.5px] ${
                active
                  ? "bg-surface text-accent shadow-[0_1px_2px_rgba(22,24,29,0.12)]"
                  : "text-muted"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </fieldset>
    </div>
  );
};
