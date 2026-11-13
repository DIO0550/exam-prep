"use client";

import type { ReactNode } from "react";

import { FillDrillApp } from "@/features/fill-drill/components/fill-drill-app";

import { PM_DRILL_BOOKS } from "../books";
import { pmDrillStores } from "../store";
import type { PmDrillBookId } from "../types";
import { PmBlockView } from "./pm-blocks";

/**
 * 応用情報 午後の穴埋めドリル（情報セキュリティ・システムアーキテクチャ・IT サービスマネジメント・
 * システム監査）。一覧から 1 問を開くと、左に問題文・右に解答欄の画面で解ける。
 */
export const PmDrillApp = ({ book, sidebar }: { book: PmDrillBookId; sidebar?: ReactNode }) => {
  const shelf = PM_DRILL_BOOKS[book];
  return (
    <FillDrillApp
      // 種類を切り替えたら、開いていた問を閉じて一覧から始める。
      key={book}
      sidebar={sidebar}
      drills={shelf.drills}
      topics={shelf.topics}
      store={pmDrillStores[book]}
      eyebrow={shelf.eyebrow}
      title={shelf.title}
      intro={shelf.intro}
      renderBlock={(block, marks) => <PmBlockView block={block} marks={marks} />}
    />
  );
};
