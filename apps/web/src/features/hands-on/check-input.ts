import type { InputKind } from "./types";

/** シェルを実行せず、引用符・継続行を含む一つのコマンドを読み取る。 */
const shellWords = (input: string): string[] | null => {
  const words: string[] = [];
  let word = "";
  let started = false;
  let quote = "";
  const source = input.replace(/\\\r?\n/g, " ");
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === undefined) {
      return null;
    }

    if (quote) {
      if (char === quote) {
        quote = "";
        continue;
      }

      if (char === "\\" && quote === '"') {
        const next = source[index + 1];
        if (next === undefined) {
          return null;
        }

        if (["$", "`", '"', "\\"].includes(next)) {
          word += next;
          index += 1;
          continue;
        }
      }

      word += char;
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      started = true;
      continue;
    }

    if (/[;&|<>`$]/.test(char)) {
      return null;
    }

    if (char === "\\") {
      const next = source[index + 1];
      if (next === undefined) {
        return null;
      }

      word += next;
      started = true;
      index += 1;
      continue;
    }

    if (/\s/.test(char)) {
      if (started) {
        words.push(word);
        word = "";
        started = false;
      }

      continue;
    }

    word += char;
    started = true;
  }

  if (quote) {
    return null;
  }

  if (started) {
    words.push(word);
  }

  return words;
};

/** フラグの並びと --key=value / --key value の違いだけを吸収する。 */
const commandShape = (input: string, booleanFlags: Set<string>): string | null => {
  const words = shellWords(input);
  if (!words) {
    return null;
  }

  const positionals: string[] = [];
  const flags = new Map<string, string[]>();
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    if (word === undefined) {
      return null;
    }

    if (!word.startsWith("--")) {
      positionals.push(word);
      continue;
    }

    const separator = word.indexOf("=");
    let key = word;
    let value = "";
    if (separator >= 0) {
      key = word.slice(0, separator);
      value = word.slice(separator + 1);
    }

    if (separator < 0 && !booleanFlags.has(key)) {
      const next = words[index + 1];
      if (next !== undefined && !next.startsWith("--")) {
        value = next;
        index += 1;
      }
    }

    flags.set(key, [...(flags.get(key) ?? []), value]);
  }

  return JSON.stringify({ positionals, flags: [...flags].sort(([a], [b]) => a.localeCompare(b)) });
};

const hclShape = (input: string): string => {
  const tokens =
    input.match(
      /"(?:\\.|[^"\\])*"|\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*|[^\s{}()[\]=,:]+|[{}()[\]=,:]/g,
    ) ?? [];
  return JSON.stringify(tokens.filter((token) => !/^(#|\/\/|\/\*)/.test(token)));
};

const sortJson = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortJson);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, sortJson(item)]),
    );
  }

  return value;
};

export const checkInput = (kind: InputKind, answer: string, input: string): boolean => {
  if (input.length > 20000) {
    return false;
  }

  if (kind === "command") {
    const booleanFlags = new Set(
      (shellWords(answer) ?? []).filter((word) => /^--[^=]+$/.test(word)),
    );
    const actual = commandShape(input, booleanFlags);
    return actual !== null && actual === commandShape(answer, booleanFlags);
  }

  if (kind === "hcl") {
    return hclShape(input) === hclShape(answer);
  }

  if (kind === "json") {
    try {
      return (
        JSON.stringify(sortJson(JSON.parse(input))) === JSON.stringify(sortJson(JSON.parse(answer)))
      );
    } catch {
      return false;
    }
  }

  // YAMLはインデントに意味があるため、行末の空白と改行コードだけを吸収する。
  const clean = (value: string) =>
    value
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .trim();
  return clean(input) === clean(answer);
};
