import { expect, it } from "vitest";
import { checkInput } from "../check-input";
import { CATEGORIES, LABS } from "./labs";

it("各カテゴリに演習があり参照先はGoogle公式だけである", () => {
  expect(new Set(LABS.map((lab) => lab.id)).size).toBe(LABS.length);
  for (const category of CATEGORIES) {
    expect(LABS.some((lab) => lab.category === category.id)).toBe(true);
  }

  for (const lab of LABS) {
    expect(lab.steps.length).toBeGreaterThan(1);
    expect(new Set(lab.steps.map((step) => step.id)).size).toBe(lab.steps.length);
    for (const reference of lab.references) {
      const url = new URL(reference.url);
      expect(url.protocol).toBe("https:");
      expect(["docs.cloud.google.com", "www.skills.google"]).toContain(url.hostname);
    }
  }
});

it("全手順の解答例を確認器が受け付け、結果と説明が存在する", () => {
  for (const lab of LABS) {
    for (const step of lab.steps) {
      expect(checkInput(step.kind, step.answer, step.answer), step.id).toBe(true);
      expect(step.task.length, step.id).toBeGreaterThan(0);
      expect(step.result.length, step.id).toBeGreaterThan(0);
      expect(step.explain.length, step.id).toBeGreaterThan(0);
    }
  }
});
