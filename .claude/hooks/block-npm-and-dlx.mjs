#!/usr/bin/env node
// =============================================================================
// block-npm-and-dlx.mjs
//
// PreToolUse(Bash) フック。npm / npx / pnpx / bunx / pnpm dlx を拒否する。
//
// npm と npx にはクールタイム（minimumReleaseAge）に相当する設定が無く、公開直後の
// バージョンでも取り込めてしまう。pnpm dlx は一時インストールなのでロックファイルに
// 残らず、何を入れて動かしたかが後から辿れない。
//
// 依存の追加は pnpm add、インストール済みバイナリの実行は pnpm exec を使う。
// =============================================================================

/** 先頭に来たら拒否するコマンド名 */
const DeniedCommands = new Set(["npm", "npx", "pnpx", "bunx"]);

/** 第 1 引数まで見て拒否するもの（コマンド名 → サブコマンド） */
const DeniedSubcommands = new Map([["pnpm", "dlx"]]);

const Replacement =
  "依存の追加は `pnpm add`、インストール済みバイナリの実行は `pnpm exec` を使う。";

/**
 * コマンド列を、実行される単位へ分割する。
 * `&&` `||` `;` `|` と改行で切るだけの粗い分割で、引用符の中までは見ない。
 * @param {string} command
 * @returns {string[]}
 */
const splitSegments = (command) =>
  command
    .split(/&&|\|\||[;\n|]/)
    .map((segment) => segment.replace(/^[\s(){]+/, "").trim())
    .filter((segment) => segment.length > 0);

/**
 * 1 セグメントの語のうち、実行されるコマンドから始まる部分を返す。
 * 先頭の環境変数代入（`FOO=bar`）と `sudo` は読み飛ばす。
 * @param {string} segment
 * @returns {string[]}
 */
const wordsFromCommand = (segment) => {
  const words = segment.split(/\s+/);
  const isPrefix = (word) => word === "sudo" || /^[A-Za-z_][A-Za-z0-9_]*=/.test(word);
  const start = words.findIndex((word) => !isPrefix(word));
  return start === -1 ? [] : words.slice(start);
};

/**
 * 拒否する理由。拒否しないなら null。
 * @param {string} command
 * @returns {string | null}
 */
const denialReason = (command) => {
  for (const segment of splitSegments(command)) {
    const [head, ...rest] = wordsFromCommand(segment);
    if (head === undefined) continue;

    // /usr/bin/npm のようなパス付きでも名前で判定する
    const name = head.split("/").pop() ?? head;
    if (DeniedCommands.has(name)) {
      return `${name} はこのリポジトリでは使わない。${Replacement}`;
    }
    if (DeniedSubcommands.get(name) === rest[0]) {
      return `${name} ${rest[0]} はこのリポジトリでは使わない。${Replacement}`;
    }
  }
  return null;
};

const readStdin = async () => {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
};

const payload = await readStdin();

/** @type {string} */
let command = "";
try {
  command = JSON.parse(payload)?.tool_input?.command ?? "";
} catch {
  // 解釈できない入力で Bash を止めない（フックの取りこぼしより誤爆のほうが害が大きい）
  process.exit(0);
}

const reason = denialReason(command);
if (reason !== null) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
}
