import { positionOf } from "./choice-order";
import { choiceKey, type Question } from "./types";

/** 単一選択の既存記録は数値のまま保持する。null と空配列は未選択。 */
export type Selection = number | number[] | null;

export const selectionsOf = (value: Selection): number[] => {
  if (value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};

export const isMultipleChoice = (question: Question): boolean => Array.isArray(question.answer);

/** 順序は問わず、過不足なく一致した場合だけ正解。部分点は付けない。 */
export const matchesAnswer = (answer: Question["answer"], picked: Selection): boolean => {
  const expected = selectionsOf(answer);
  const actual = selectionsOf(picked);
  return (
    actual.length === expected.length &&
    new Set(actual).size === actual.length &&
    expected.every((index) => actual.includes(index))
  );
};

export const selectionLabel = (value: Selection, order: number[]): string => {
  const positions = selectionsOf(value)
    .map((index) => positionOf(order, index))
    .sort((a, b) => a - b);
  return positions.length ? positions.map(choiceKey).join("・") : "未解答";
};

export const toggleSelection = (picked: Selection, index: number): number[] => {
  const selected = selectionsOf(picked);
  if (selected.includes(index)) {
    return selected.filter((value) => value !== index);
  }
  return [...selected, index];
};
