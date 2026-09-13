"use client";

import { useEffect, useId, useRef, useState } from "react";

export type SelectMenuOption = {
  value: string;
  label: string;
};

type SelectMenuProps = {
  /** ボタンの手前に出す見出し。ボタンの読み上げ名にも前置される。 */
  label: string;
  /** 選択中の値。options のどれにも当たらないときは先頭を選択中として扱う。 */
  value: string;
  options: SelectMenuOption[];
  onChange: (value: string) => void;
};

/**
 * 1 つだけ選ぶメニュー。
 *
 * `<select>` は見た目と開いたときの挙動が OS 依存で、他の操作要素と揃えられないので、
 * WAI-ARIA の listbox パターンで自前に組んでいる。フォーカスは開いている間リストが持ち、
 * どの項目を指しているかは aria-activedescendant で伝える。
 *
 * 自前にすると、OS のセレクトが持っている「押せる箱」の見え方も自分で作ることになる。
 * 見出しを箱の上に出し、枠と三角をアクセント色にしてあるのは、周りの文字に紛れて
 * 「ここで切り替えられる」と気付かれないのを避けるため。
 */
export const SelectMenu = ({ label, value, options, onChange }: SelectMenuProps) => {
  const id = useId();
  const labelId = `${id}-label`;
  const buttonId = `${id}-button`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selected = options[selectedIndex];

  const [open, setOpen] = useState(false);
  /** キーボードで指している項目。開くたびに選択中へ戻す。 */
  const [activeIndex, setActiveIndex] = useState(selectedIndex);

  // 開いたらリストへフォーカスを移す。キー操作の受け口をリスト 1 か所にまとめるため。
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  // 指している項目が見えるところまで送る（jsdom には scrollIntoView が無いので任意呼び出し）。
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[activeIndex]?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeIndex]);

  // 外側を押したら閉じる。ボタン自身は rootRef の中なので、ここでは閉じない。
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const openList = (index: number) => {
    setActiveIndex(index);
    setOpen(true);
  };

  /** 閉じて、押した場所（ボタン）へフォーカスを戻す。 */
  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const choose = (index: number) => {
    const option = options[index];
    close();
    if (option && option.value !== value) onChange(option.value);
  };

  const handleButtonKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openList(selectedIndex);
    }
  };

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const last = options.length - 1;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(last, prev + 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(0, prev - 1));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(last);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(activeIndex);
      return;
    }
    if (event.key === "Escape" || event.key === "Tab") {
      // Tab は移動を止めない。閉じるだけにして、ボタンから続きへ抜けさせる。
      if (event.key === "Escape") event.preventDefault();
      close();
    }
  };

  return (
    <div ref={rootRef} className="relative flex flex-col items-stretch gap-[5px]">
      <span id={labelId} className="font-bold text-[10px] text-muted tracking-[0.14em]">
        {label}
      </span>

      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${labelId} ${buttonId}`}
        onClick={() => (open ? close() : openList(selectedIndex))}
        onKeyDown={handleButtonKeyDown}
        className="flex min-w-[190px] cursor-pointer items-center justify-between gap-3 rounded-[9px] border border-accent/45 bg-accent-soft py-2 pr-2 pl-3.5 font-bold text-[13.5px] text-accent-deep shadow-[0_1px_2px_rgba(22,24,29,0.06)] hover:border-accent hover:bg-surface"
      >
        {selected?.label}
        <span
          aria-hidden="true"
          className={`flex size-[19px] flex-none items-center justify-center rounded-full bg-accent text-[7px] text-surface transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={labelId}
          aria-activedescendant={optionId(activeIndex)}
          onKeyDown={handleListKeyDown}
          className="absolute top-full right-0 z-30 mt-1.5 max-h-[290px] min-w-[190px] overflow-y-auto rounded-[9px] border border-edge bg-surface py-1 shadow-[0_6px_20px_rgba(22,24,29,0.12)] outline-none"
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            const isActive = index === activeIndex;
            return (
              // biome-ignore lint/a11y/useKeyWithClickEvents: キーはリスト側でまとめて受ける
              <div
                key={option.value}
                id={optionId(index)}
                role="option"
                tabIndex={-1}
                aria-selected={isSelected}
                onClick={() => choose(index)}
                onPointerMove={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-[12.5px] ${
                  isSelected ? "font-bold text-accent-deep" : "font-medium text-ink"
                } ${isActive ? "bg-hover" : ""}`}
              >
                <span aria-hidden="true" className="w-3 flex-none text-[10px] text-accent">
                  {isSelected ? "✓" : ""}
                </span>
                {option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
