"use client";

import { type RefObject, useEffect } from "react";

/**
 * key が変わるたびに、読む位置を先頭へ戻す。
 *
 * 幅が広いときは ref の枠だけがスクロールするので枠を、
 * 枠が縦に積まれる狭い幅ではページごと動くのでページを戻す。
 * 次の問題が、前の問題を読んでいた高さの途中から始まらないようにするためのもの。
 */
export const useScrollReset = (ref: RefObject<HTMLElement | null>, key: unknown) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: key は戻す合図なので、本体で読まなくても依存に要る
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
    const page = document.scrollingElement ?? document.documentElement;
    page.scrollTop = 0;
  }, [key, ref]);
};
