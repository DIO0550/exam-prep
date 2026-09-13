# exam-prep

試験対策用の GitHub Pages 管理サイト（Next.js）。

**公開ページ: <https://dio0550.github.io/exam-prep/>**

`main` へ push すると [`deploy-pages.yml`](.github/workflows/deploy-pages.yml) が static export を
作って上の URL へ出す（詳しくは「[CI とデプロイ](#ci-とデプロイ)」）。

## 構成

pnpm workspace。アプリは `apps/` 配下、アプリ間で共有するものは `packages/` 配下に置く
（`packages/` はまだ空で、問題データや採点ロジックを切り出すときに作る）。

```
apps/web/          Next.js 16（App Router / TypeScript / Tailwind v4）
  src/app/         ルーティングとページ。色トークンは globals.css の @theme
  src/base-path.ts basePath の唯一の定義（next.config.ts と public/ 参照の両方が使う）
  src/features/    画面のまとまり
    quiz/          演習画面（学習ホーム / 演習 / 解説 / 結果 / 見直し）
      components/  画面と部品
      hooks/       画面の状態（useQuizSession）と学習記録の購読（useProgress）
      progress/    学習記録。localStorage への保存と、そこから作る集計
      data/        問題データ。出典は types.ts の formatSource が組み立てる
  public/questions/ 問題の図（公開 PDF から切り出し）と、そのライセンス表記
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

## CI とデプロイ

workflow は 2 つに分けてある。見たいものが違い（片方は「壊れていないか」、もう片方は
「出せたか」）、必要な権限も違うため。

| workflow | いつ走るか | やること | 権限 |
|---|---|---|---|
| [`ci.yml`](.github/workflows/ci.yml) | PR / `main` への push / 手動 | `pnpm check` / `typecheck` / `test` / `build` | `contents: read` |
| [`deploy-pages.yml`](.github/workflows/deploy-pages.yml) | `main` への push / 手動 | static export を作って GitHub Pages へ出す | deploy ジョブにだけ `pages: write` と `id-token: write` |

公開先は <https://dio0550.github.io/exam-prep/>。パスが `/exam-prep` の分だけ深くなるのは
プロジェクトページだからで、`basePath` をそれに合わせてある（後述）。

**この 2 つは `main` への push で並行して走る。** デプロイ側はテストの成否を待たないので、
検査を通らないものを出したくないなら、**ブランチ保護で CI を必須チェックにする**
（Settings → Branches → `main` → Require status checks to pass → `verify`）。
main へ直接 push せず PR を通す運用であれば、PR の時点で CI が通っている。

**リポジトリ設定が 1 つ要る。** Settings → Pages → Build and deployment → Source を
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
- セットアップ（checkout / Node / corepack / キャッシュ / install）は 2 ファイルに
  同じ内容が並ぶ。まとめるにはローカルの composite action を挟むことになるので、
  1 ファイルを読めば何が動くか分かる状態を優先した。**片方を直したらもう片方も直す**

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

## 画面

`apps/web/src/features/quiz` に演習まわりの 5 画面が入っている。ページは
`src/app/page.tsx` の 1 枚だけで、画面の出し分けは `useQuizSession` の `screen` が持つ。

| 画面 | 中身 |
|---|---|
| 学習ホーム | 累計の学習記録と分野別の到達度。ここから演習を始める（途中なら再開） |
| 演習 | 問題・選択肢・正誤・解説。解説は「同画面」「別画面」を切り替えられる |
| 解説 | 「別画面」設定のときに解答後へ挟まる、解説だけの画面 |
| 結果 | 得点と分野別の内訳、所要時間 |
| 問題一覧・見直し | 全問の正誤一覧。不正解・フラグ・苦手登録で絞り込める |

色は `src/app/globals.css` の `@theme` にトークンとして置いてある（`bg-accent` /
`text-ok` / `border-line` など）。個別の色を直に書かず、ここへ足してから使う。

## 学習記録

解答状況と学習の記録はブラウザの **localStorage** に置く（キーは `exam-prep:progress:v1`）。
リロードしても、回を切り替えて戻っても、続きから解ける。保存先はブラウザに閉じていて、
どこにも送らない。消すときは学習ホーム右下の「学習記録を消す」。

| 持つもの | 使い道 |
|---|---|
| 問題 ID ごとの解答状況（選んだ選択肢・正誤の確定・フラグ・苦手登録・消し込み） | 続きから解く / 見直し / 苦手登録の数 |
| 直近200問の正誤 | 累計正答率 |
| 解答した日（最大400日） | 連続学習日数と最長記録 |
| 最後に選んでいた回 | 次に開いたときの出題 |

分野別の到達度は、保存した解答状況を問題 ID から引き直して回をまたいで集計する
（`data/questions.ts` の `QUESTION_BY_ID`）。

IndexedDB ではなく localStorage なのは、記録が 1 件（800問すべて解いても 100 KB 未満）で
容量の心配が無く、**同期で読める**ぶん最初の描画で「記録なし」を出してから差し替えずに済むため。
1回ごとの履歴のように件数が伸びるものを持ち始めたら移す。読み書きはどちらも例外を握る
（プライベートモードでは localStorage の参照自体が投げることがあり、記録が残らないことより
画面が出ないことのほうが困るため）。

static export した HTML には誰の記録も入らないので、保存した値が出るのは hydration の後。
`useSyncExternalStore` の `getServerSnapshot` に空の記録を返して、そこを揃えている。

## 問題データ

収録しているのは **応用情報技術者試験 午前の10回分（令和3年度 春期〜令和7年度 秋期、各80問・計800問）**。
1回＝1ファイルで `apps/web/src/features/quiz/data/ap-<元号><年>-<期>-am.ts` に置き、
[`data/questions.ts`](apps/web/src/features/quiz/data/questions.ts) の `QUESTION_SETS` に並べる。
画面のヘッダーにある「出題する回」で切り替える（切り替えると学習ホームに戻る。解答状況は回ごとに
残るので、戻ってくれば続きから解ける）。

IPA が公開しているのは令和3年度以降なので、**午前については公開ぶんを全部収録している**（平成分は公開されていない）。
午後と、他の試験区分（基本情報・情報セキュリティマネジメント）は未収録。
過去問題を網羅したものではなく、画面下部にも収録範囲を出している。

取り込み方は [`docs/ipa-kakomon-usage-notes.md`](docs/ipa-kakomon-usage-notes.md) の 3.1 に従う。

| もの | どうやって入れたか |
|---|---|
| 問題文・選択肢 | 公開 PDF のページを目視で書き起こし |
| 図（ベン図・ブロック図・グラフ） | ページ画像から切り出し（`public/questions/`） |
| 正解 | 同年度の解答例 PDF から |
| 分野の細分類・解説 | 本リポジトリで作成 |

**出典表記は手で書かない。** `Source`（試験区分・元号・年・期・時間区分・問番号）を持たせ、
[`formatSource`](apps/web/src/features/quiz/types.ts) が
`令和3年度 春期 応用情報技術者試験 午前 問1` の形に組み立てる。改変した問題は `modified`
に内容を入れると、出典の末尾に併記される。問題 ID もこの `Source` から作るので、出典漏れが
構造的に起きない。

図は 2 通りの使い分けがある。原本が線画なら切り出し、表や箇条書きなら HTML で組む。
線画を自作でなぞると描き間違いで正解が変わるため、なぞらない（docs 3.5）。

## ライセンス

- **ソースコード**: MIT License（[`LICENSE`](LICENSE)）
- **問題文・選択肢・図・正解（解答例）**: 独立行政法人情報処理推進機構（IPA）の著作物。
  MIT License の**対象外**で、再利用するときは IPA の定める条件に従う
  （<https://www.ipa.go.jp/shiken/faq.html>）。詳細は
  [`apps/web/public/questions/LICENSE.md`](apps/web/public/questions/LICENSE.md)
- **分野の細分類・解説**: 本リポジトリで作成したもの（MIT）

本サイトは IPA とは無関係の個人制作。

## これから

- 午後問題と、他の試験区分（基本情報・情報セキュリティマネジメント）の収録。
  手順は上の表のとおりで、1 問ずつ原本と突き合わせながら足す
- 分野（`field`）は本リポジトリで付けた細分類なので、回をまたぐと粒度がぶれている可能性がある。
  結果画面の分野別集計を回横断で使うなら、いちど揃え直す必要がある
- 問題データの置き場（`packages/` へ切り出すか `apps/web` に持つか）
- 学習記録は端末ごと（localStorage）なので、別の端末とは共有されない。同期するなら保存先を
  外部に持つことになる
