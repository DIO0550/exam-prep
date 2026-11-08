"use client";

import type { ReactNode } from "react";

import { FillDrillApp } from "@/features/fill-drill/components/fill-drill-app";

import { DB_DRILLS, DB_TOPICS } from "../drills";
import { dbDrillStore } from "../store";
import { DbBlockView } from "./db-blocks";

/**
 * 応用情報 午後 問6（データベース）向けの、SQL 文と表の穴埋めドリル。
 * 一覧から 1 問を開くと、左に問題文・右に解答欄の画面で解ける。
 *
 * 左には演習と同じ試験の一覧（sidebar）を出す。問題を解いている間は、
 * 問題文と解答欄に幅を使うため出さない。
 */
export const DbDrillApp = ({ sidebar }: { sidebar?: ReactNode }) => (
  <FillDrillApp
    sidebar={sidebar}
    drills={DB_DRILLS}
    topics={DB_TOPICS}
    store={dbDrillStore}
    eyebrow="午後 問6 対策"
    title="SQL・表の穴埋めドリル"
    intro={
      <>
        応用情報 午後のデータベースの問で出る、E-R 図・関係スキーマ（主キー・外部キー）・SQL
        文・表の空欄を埋める練習です。過去問の型に限らず、SQL
        の基本と、関係代数・トランザクション・障害回復・データウェアハウスなどの出題範囲を広く扱います。SQL
        のキーワードや列名は自分で書き、用語や結果、E-R 図に引く線は選んで答えます。
      </>
    }
    renderBlock={(block, marks) => <DbBlockView block={block} marks={marks} />}
  />
);
