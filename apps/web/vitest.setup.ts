import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import { progressStore } from "./src/features/quiz/progress/store";

// テスト間で DOM と学習記録を持ち越さない。
// 記録は localStorage に残るうえ、ストアがメモリにも抱えるので、両方を捨てる。
afterEach(() => {
  cleanup();
  progressStore.clear();
});
