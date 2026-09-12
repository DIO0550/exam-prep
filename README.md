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
| `pnpm dev` | dev サーバ（`http://localhost:4100/exam-prep/`。`basePath` は dev でも効く） |
| `pnpm build` | static export を作る（出力は `apps/web/out`） |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest（`pnpm --filter @exam-prep/web test:watch` で watch） |
| `pnpm check` | Biome で lint / format / import 順を検査 |
| `pnpm fix` | Biome で自動修正 |

依存を足すときは `pnpm --filter @exam-prep/web add <pkg>`。`npm` / `npx` / `pnpm dlx` は
フックで拒否される（後述）。

`next dev` は `apps/web/AGENTS.md` と `apps/web/CLAUDE.md` を自動生成して毎回書き戻すので、
追跡している。止めたいときは `next.config.ts` に `agentRules: false` を足す。

## デプロイ（GitHub Pages）

`main` への push で [`deploy-pages.yml`](.github/workflows/deploy-pages.yml) が走り、
static export（`apps/web/out`）を GitHub Pages へ出す。公開先は
`https://dio0550.github.io/exam-prep/`。手動実行（`workflow_dispatch`）もできる。

PR でも build まで（install / check / typecheck / test / build / artifact のアップロード）は
流れる。デプロイ経路が壊れていたらマージ前に気づけるようにするため。実際に出すのは
`main` への push と手動実行のときだけ。

**リポジトリ設定が 1 つだけ要る。** Settings → Pages → Build and deployment → Source を
**GitHub Actions** にする。ここが "Deploy from a branch" のままだと deploy ジョブが失敗する。

### workflow の方針

- **Action は GitHub 公式（`actions/*`）だけ**。pnpm 用のサードパーティ Action
  （`pnpm/action-setup` など）は使わず、corepack が `package.json` の `packageManager`
  （ハッシュ付きで固定）から pnpm を入れる
- **すべてコミット SHA で固定**。タグは付け替えられるがコミット SHA は動かない。
  更新するときは SHA と横のコメントのバージョンを一緒に書き換える
- `pnpm install --frozen-lockfile` なので、ロックファイルのズレに加えて
  **クールタイム（7 日）を満たさないバージョンが載っていれば CI で落ちる**
- corepack は Node 24 に同梱されているものを使う。Node 25 以降へ上げるときは
  corepack が外れるので、pnpm の入れ方を別途決める必要がある

### static export の設定

[`apps/web/next.config.ts`](apps/web/next.config.ts) に置いてある。

| 設定 | 理由 |
|---|---|
| `output: 'export'` | 静的ファイルだけを吐く（出力は `apps/web/out`） |
| `basePath: '/exam-prep'` | プロジェクトページはリポジトリ名の分だけパスが深くなる。リネームや独自ドメインを当てたら合わせる |
| `trailingSlash: true` | `out/foo/index.html` の形にする。拡張子なし URL の解決はホストによって差があるため |
| `images.unoptimized: true` | static export には画像最適化サーバが無い |

`public/.nojekyll` を置いてある。Actions からの artifact デプロイでは Jekyll は走らないので
本来は不要だが、`_next/` のようなアンダースコア始まりが無視される経路に迷い込むと
原因が分かりにくいので、保険として残している。

`output: 'export'` では `next start` が使えないので、ルートの `start` スクリプトは無い。
ビルド結果を手元で見るときは `apps/web/out` を任意の静的サーバで配る。

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

- 問題データの置き場（`packages/` へ切り出すか `apps/web` に持つか）と、
  [`docs/ipa-kakomon-usage-notes.md`](docs/ipa-kakomon-usage-notes.md) の条件を満たす出典表記
