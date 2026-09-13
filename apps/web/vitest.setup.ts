import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import { noteStore } from "./src/features/quiz/notes/store";
import { progressStore } from "./src/features/quiz/progress/store";

// jsdom は canvas を持たない（getContext が "Not implemented" を投げる）。
// 手書きメモの描画は見た目だけで、座標の計算は notes/sketch.ts 側で確かめるので、
// テストでは描画命令を捨てる。
HTMLCanvasElement.prototype.getContext = (() =>
  null) as typeof HTMLCanvasElement.prototype.getContext;

// テスト間で DOM・学習記録・メモを持ち越さない。
// どちらも localStorage に残るうえ、ストアがメモリにも抱えるので、両方を捨てる。
afterEach(() => {
  cleanup();
  progressStore.clear();
  noteStore.clear();
});
