# exam-prep

試験対策用の GitHub Pages 管理サイト（Next.js）。

## 構成

pnpm workspace。アプリは `apps/` 配下、アプリ間で共有するものは `packages/` 配下に置く
（`packages/` はまだ空で、問題データや採点ロジックを切り出すときに作る）。

```
apps/web/          Next.js 16（App Router / TypeScript / Tailwind v4）
  src/app/         ルーティングとページ
  vitest.config.ts テスト設定（jsdom + Testing Library）
biome.json         lint / format（リポジトリ全体を 1 つの設定で見る）
pnpm-workspace.yaml workspace とクールタイムの設定
```

## コマンド

ルートから実行する。`--filter` で `apps/web` に流すだけなので、アプリの中で直接叩いてもよい。

| コマンド | 内容 |
|---|---|
| `pnpm dev` | dev サーバ（`http://localhost:4100`） |
| `pnpm build` | 本番ビルド |
| `pnpm start` | ビルド済みのものを起動 |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest（`pnpm --filter @exam-prep/web test:watch` で watch） |
| `pnpm check` | Biome で lint / format / import 順を検査 |
| `pnpm fix` | Biome で自動修正 |

依存を足すときは `pnpm --filter @exam-prep/web add <pkg>`。`npm` / `npx` / `pnpm dlx` は
フックで拒否される（後述）。

`next dev` は `apps/web/AGENTS.md` と `apps/web/CLAUDE.md` を自動生成して毎回書き戻すので、
追跡している。止めたいときは `next.config.ts` に `agentRules: false` を足す。

## パッケージ取り込みのクールタイム

npm のサプライチェーン攻撃は、乗っ取ったアカウントから新バージョンを publish する形が多く、
発覚と unpublish は数時間〜数日で起きる。その窓を跨いでから取り込むために、公開から 7 日
（10080 分）経っていないバージョンは入れない。設定は [`pnpm-workspace.yaml`](pnpm-workspace.yaml)。

| 設定 | 値 | 意味 |
|---|---|---|
| `minimumReleaseAge` | `10080`（分 = 7 日） | この時間を経ていないバージョンを入れない |
| `minimumReleaseAgeStrict` | `true` | 期限を満たすバージョンが無いとき、古い版へ黙って落とさず解決を失敗させる |
| `minimumReleaseAgeIgnoreMissingTime` | `false` | 公開日を返さないレジストリのパッケージを検査なしで通さない |

効く範囲は解決時（`pnpm add` / `pnpm update`）だけではない。pnpm 11.3.0 以降は `pnpm install`
がロックファイルの各エントリも検査するので（`trustLockfile` の既定が `false`）、期限内の
バージョンが載ったロックファイルは CI の `--frozen-lockfile` でも落ちる。

pnpm 12.3.4 で確認した挙動:

```
$ pnpm add next          # 公開 1 日の 16.3.5 ではなく 16.3.4 が入る
+ next 16.3.4

$ pnpm install --frozen-lockfile   # 期限内の版が載ったロックファイルは通らない
  next@16.3.5 was published at 2026-09-11T17:15:21.000Z, within the
  minimumReleaseAge cutoff (2026-09-05T01:35:04.493Z)
```

クールタイムを待たずに入れたいものがあるときだけ、`minimumReleaseAgeExclude` に
パッケージ名 / パターン（`'@myorg/*'`）/ バージョン指定（`'next@16.3.5'`）で例外を足す。

### どこに書くと効くか

同じ設定でも、置き場所によって効いたり効かなかったりする。しかも **pnpm 10 と 11 以降で
逆転している**。`pnpm add next` の解決結果で実測した（✅ = 解決に効く）。

| 置き場所 | pnpm 10.33 | pnpm 12.3.4 |
|---|---|---|
| リポジトリの `pnpm-workspace.yaml` | ✅ | ✅ |
| リポジトリの `.npmrc` | ✅ | ❌ |
| グローバルの `~/.config/pnpm/rc`（`pnpm config set --global` が書く形式） | ✅ | ❌ |
| グローバルの `~/.config/pnpm/config.yaml` | ❌ | ✅ |
| 環境変数 `PNPM_CONFIG_MINIMUM_RELEASE_AGE` | - | ✅（リポジトリの設定より強い） |

`pnpm config get minimumReleaseAge` は判定に使えない。rc に書いた値は解決に効かなくても
読めてしまい、config.yaml に書いた値は効いていても `undefined` を返す。確かめるなら
実際に `pnpm add` して入るバージョンを見る。

そのため、このリポジトリでは次のように置いている。

- **リポジトリ内の install**: `pnpm-workspace.yaml`。どのマシン・どの環境でも効くので、
  クラウドのセッションや CI もこれでカバーされる。`.npmrc` は置かない（`packageManager` が
  pnpm 12 なので効かないうえ、10 系へ落としたときだけ効く設定はかえって紛らわしい）
- **リポジトリ外の解決（`pnpm dlx` など）**: devcontainer では
  [Dockerfile](.devcontainer/node/Dockerfile) が `config.yaml` に書く。クラウドのセッションは
  そのイメージを使わないので、[`.claude/hooks/session-start.sh`](.claude/hooks/session-start.sh)
  が rc と config.yaml の両方へ書く（どちらの pnpm が載っているか決められないため）
- 環境変数は使わない。リポジトリの `pnpm-workspace.yaml` より強く、リポジトリ側の指定を
  上書きしてしまうため

npm 側にはクールタイムに相当する設定が無い（12.0.2 時点。`before` は指定日時点の解決に
固定するもので別物）ので、依存の追加は pnpm で行う。

## 開発環境（devcontainer）

VS Code / Cursor で「Reopen in Container」。中身は次の通り。

- Ubuntu 24.04 + Node 24 + CJK フォント。gh / pnpm + safe-chain / AI ツール（Copilot CLI・
  Claude Code）/ tmux / Playwright は spec-board と同じスクリプトで入れる
- リポジトリの中で動く pnpm は `package.json` の `packageManager`（12.3.4、ハッシュ付きで固定）。
  イメージに入るグローバルの pnpm は 10 系なので、クールタイムは rc と config.yaml の両方に書いてある
- 起動時に [`init-firewall.sh`](.devcontainer/init-firewall.sh) が外向き通信を許可リストへ絞る。
  許可先を足すときは同ファイルの `ALLOWED_DOMAINS`
- ファイアウォールは root の [`entrypoint.sh`](.devcontainer/entrypoint.sh) が適用し、開発ユーザー
  （`vscode`）には sudo を与えない（与えると許可リストを自分で外せてしまうため）
- ポート 4100 を転送。コンテナの中なので `next dev -p 4100 -H 0.0.0.0` で起動する
  （Next.js は HMR も dev サーバと同じポートを使うので、転送は 1 つでよい）
- セットアップスクリプトが `npm config set ignore-scripts true` を入れる（pnpm 10 以降は依存のライフサイクルスクリプトを
  既定で実行せず、必要なものだけ `onlyBuiltDependencies` で許可する）

## Claude Code のフック

`.claude/settings.json` に 2 つ登録してある。

- **PreToolUse / Bash**（[`block-npm-and-dlx.mjs`](.claude/hooks/block-npm-and-dlx.mjs)）—
  `npm` / `npx` / `pnpx` / `bunx` / `pnpm dlx` を拒否する。npm と npx にはクールタイムに
  相当する設定が無く、`pnpm dlx` は一時インストールなのでロックファイルに残らない。
  コマンド列の**どこに現れても**拒否するので、`bash -c "npx …"` や `xargs npx` のように
  途中へ紛れた形も拾う。依存の追加は `pnpm add`、インストール済みバイナリの実行は
  `pnpm exec` を使う
- **SessionStart**（[`session-start.sh`](.claude/hooks/session-start.sh)）—
  クラウドのセッションで、リポジトリ外の解決にもクールタイムが効くようグローバル設定を書く。
  依存のインストールはしない（`pnpm install` は必要なときに手で実行する）

フックは**セッション開始時に読まれる**ので、変更は次のセッションから効く。

## ドキュメント

- [`docs/ipa-kakomon-usage-notes.md`](docs/ipa-kakomon-usage-notes.md) — IPA の過去問題を
  再利用するときに満たすべき条件（出典表記・コードとデータのライセンス分離・公式と誤認させない等）と、
  公開前チェックリスト。問題データを入れる前に読む

## これから

- GitHub Pages 向けの static export（`output: 'export'` と `basePath`）とデプロイ用の workflow
- 問題データの置き場（`packages/` へ切り出すか `apps/web` に持つか）と、
  [`docs/ipa-kakomon-usage-notes.md`](docs/ipa-kakomon-usage-notes.md) の条件を満たす出典表記
