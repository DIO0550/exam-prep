# exam-prep

試験対策用の GitHub Pages 管理サイト（Next.js）。

**公開ページ: <https://dio0550.github.io/exam-prep/>**

`main` へ push すると [`deploy-pages.yml`](.github/workflows/deploy-pages.yml) が static export を
作って上の URL へ出す。PR には**そのブランチのサイトを触れるプレビュー**が
`…/exam-prep/pr-preview/pr-<番号>/` に出る（詳しくは「[CI とデプロイ](#ci-とデプロイ)」）。

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
      notes/       問題ごとのメモ（自由入力と手書き）。保存先は学習記録と分けてある
      data/        問題データ。出典は types.ts の formatSource が組み立てる
      choice-order.ts 選択肢の表示順（原本順 / シャッフル）
      local-store.ts  localStorage の値を React の外から購読する土台（progress と notes が使う）
    vocab/         単語帳（略語 360 語のフラッシュカード）
      components/  左の単語帳一覧と、設定 → めくる → 結果の 3 画面
      hooks/       めくっている状態（useFlashcards）と「あやふや」の購読（useWeak）
      weak/        「あやふや」を付けた語。localStorage への保存（学習記録とは別のキー）
      data/        略語データ。technical_memo の「略語単語帳」から移してきた
      deck.ts      出題形式・分野・順番・枚数から札を配る
      decks.ts     左のパネルに並べる単語帳の一覧
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
| `pnpm visual:capture` | 主要画面のスクリーンショットを撮る（先に `pnpm build`） |
| `pnpm visual:compare` | 撮った画像を baseline と比べ、差分の画像を作る |

依存を足すときは `pnpm --filter @exam-prep/web add <pkg>`。`npm` / `npx` / `pnpm dlx` は
フックで拒否される（後述）。

`next dev` は `apps/web/AGENTS.md` と `apps/web/CLAUDE.md` を自動生成して毎回書き戻すので、
追跡している。止めたいときは `next.config.ts` に `agentRules: false` を足す。

## CI とデプロイ

workflow は目的ごとに分けてある。見たいものが違い（「壊れていないか」「出せたか」
「見た目が変わっていないか」「触って確かめられるか」）、必要な権限も違うため。

| workflow | いつ走るか | やること | 権限 |
|---|---|---|---|
| [`ci.yml`](.github/workflows/ci.yml) | PR / `main` への push / 手動 | `pnpm check` / `typecheck` / `test` / `build` | `contents: read` |
| [`deploy-pages.yml`](.github/workflows/deploy-pages.yml) | `main` への push / 手動 | static export を作って `gh-pages` のルートへ出す | `contents: write` と `pages: read`（設定の確認） |
| [`pr-preview.yml`](.github/workflows/pr-preview.yml) | PR | その PR のサイトを `gh-pages/pr-preview/pr-<番号>/` へ出し、URL を PR に貼る | `contents: write` と PR コメント |
| [`visual-regression.yml`](.github/workflows/visual-regression.yml) | PR / 手動 | 主要画面を撮って main と比べ、レポートを `gh-pages` へ出し PR に貼る | `contents: write` と PR コメント |
| [`visual-baseline.yml`](.github/workflows/visual-baseline.yml) | `main` への push / 手動 | 比べる相手（baseline）を撮り直す | `contents: write` |

公開先は <https://dio0550.github.io/exam-prep/>。パスが `/exam-prep` の分だけ深くなるのは
プロジェクトページだからで、`basePath` をそれに合わせてある（後述）。

**`main` への push では、検査（ci）とデプロイと baseline 撮り直しが並行して走る。**
デプロイ側はテストの成否を待たないので、
検査を通らないものを出したくないなら、**ブランチ保護で CI を必須チェックにする**
（Settings → Branches → `main` → Require status checks to pass → `verify`）。
main へ直接 push せず PR を通す運用であれば、PR の時点で CI が通っている。

**リポジトリ設定が 1 つ要る。** Settings → Pages → Build and deployment → Source を
**Deploy from a branch**、Branch を **`gh-pages` / (root)** にする。ここが "GitHub Actions" の
ままだと、push しても公開内容が変わらないまま古いサイトが出続ける（黙って古いものが出るのが
一番困るので、`deploy-pages.yml` の最後で今の配信元を読んで、違っていれば落とすようにしてある）。

ブランチ方式にしてあるのは、**PR のプレビューを同じサイトに同居させる**ため。Pages の配信元は
リポジトリにつき 1 つしか選べないので、Actions から直接デプロイする方式のままでは
`main` のサイトと PR のプレビューを両方出せない。

| gh-pages の中身 | 誰が置くか |
|---|---|
| ルート（`index.html` など） | `deploy-pages.yml`（`main` への push） |
| `pr-preview/pr-<番号>/` | `pr-preview.yml`（PR ごと。閉じたら消す） |
| `visual-regression/pr-<番号>/<SHA>/` | `visual-regression.yml`（見た目の差分のレポートと画像。閉じたら消す） |
| `visual-baseline/` | `visual-baseline.yml`（比べる相手の画像） |

**どの workflow も自分の場所しか触らない。** 出し直すときも、他の 3 つのフォルダはそのまま残す。

Pages のビルドは 1 時間に 10 回までという緩い上限がある。PR に push すると
プレビューと差分レポートで 2 回 push されるので、立て続けに直すと数分待たされることがある。

ブランチは毎回 1 コミットに作り直す（force push）。サイト 1 回分が 14MB あり、履歴を積むと
リポジトリが太り続けるため。

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
- セットアップ（checkout / Node / corepack / キャッシュ / install）は各 workflow に
  同じ内容が並ぶ。まとめるにはローカルの composite action を挟むことになるので、
  1 ファイルを読めば何が動くか分かる状態を優先した。**1 つを直したら他も直す**

### static export の設定

[`apps/web/next.config.ts`](apps/web/next.config.ts) に置いてある。

| 設定 | 理由 |
|---|---|
| `output: 'export'` | 静的ファイルだけを吐く（出力は `apps/web/out`） |
| `basePath` | プロジェクトページはリポジトリ名の分だけパスが深くなる。既定は `/exam-prep`。PR プレビューのビルドだけ `NEXT_PUBLIC_BASE_PATH` で差し替える（[`base-path.ts`](apps/web/src/base-path.ts)） |
| `trailingSlash: true` | `out/foo/index.html` の形にする。拡張子なし URL の解決はホストによって差があるため |
| `images.unoptimized: true` | static export には画像最適化サーバが無い |

ファビコンは [`apps/web/src/app/icon.svg`](apps/web/src/app/icon.svg)（本と ✓ のアイコン）。
SVG なので拡大しても荒れず、1KB 未満で済む。`apple-icon.png`（ホーム画面用・180px・角丸なしで
全面を塗る。丸めるのは iOS 側）と `favicon.ico`（16/32px。SVG のファビコンに対応していない
ブラウザ向け）も同じ絵から作って app/ に置き、`layout.tsx` の `metadata.icons` で
まとめて指している。プロジェクトページは `/exam-prep/` 配下なので、ブラウザ任せの
「サイト直下の /favicon.ico」には落ちてこない。だから ico も明示的に指す必要がある。

`public/.nojekyll` を置いてある。ブランチから配信すると Jekyll を通るので、これが無いと
`_next/` のようなアンダースコア始まりが配信されず、JS と CSS が 404 になる
（workflow 側でもルートに `.nojekyll` を作っている）。

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
| 学習ホーム | 選んでいる回の正答率と分野別の到達度、連続学習・苦手登録。ここから演習を始める（途中なら再開） |
| 演習 | 問題・選択肢・正誤・解説。上の帯に進み具合とその回の正答率を出す。解説は「同画面」「別画面」、選択肢は「原本順」「シャッフル」、文字は「標準」「大」「特大」を切り替えられる。右にメモを開ける（幅はドラッグで変えられる） |
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
| 直近200問の正誤 | 記録として残す（正答率は回ごとに出すので、画面には出さない） |
| 解答した日（最大400日） | 連続学習日数と最長記録 |
| 最後に選んでいた回 | 次に開いたときの出題 |
| 選択肢をシャッフルするか・並びの種 | 次に開いたときも同じ設定・同じ並びで出す |
| 文字サイズ | 次に開いたときも同じ大きさで出す |
| メモの枠の幅 | 次に開いたときも同じ幅で出す |

問題ごとのメモは別のキー（`exam-prep:notes:v1`）に置く。理由は「[メモ](#メモ)」を参照。

正答率と分野別の到達度は、**選んでいる回だけ**を母数にする（`stats.ts` の `summarize`）。
「令和5年春がどれだけ取れたか」を知りたいのに回をまたいだ平均を出すと、どの回の力なのかが
読めなくなるため。演習中の帯にも同じ数字を出すので、解き終わる前でも手ごたえが分かる。

IndexedDB ではなく localStorage なのは、記録が 1 件（800問すべて解いても 100 KB 未満）で
容量の心配が無く、**同期で読める**ぶん最初の描画で「記録なし」を出してから差し替えずに済むため。
1回ごとの履歴のように件数が伸びるものを持ち始めたら移す。読み書きはどちらも例外を握る
（プライベートモードでは localStorage の参照自体が投げることがあり、記録が残らないことより
画面が出ないことのほうが困るため）。

static export した HTML には誰の記録も入らないので、保存した値が出るのは hydration の後。
`useSyncExternalStore` の `getServerSnapshot` に空の記録を返して、そこを揃えている。

保存形式には版（`RECORD_VERSION`）を持たせてある。読めない版は捨てて作り直すが、設定が
増えただけの古い版は既定値を足して読む（設定 1 つのために学習記録を消さないため）。

## 文字サイズ

ヘッダーの「文字サイズ」で **標準 / 大 / 特大**（倍率 1 / 1.15 / 1.3）を切り替える。変わるのは
**読む文字だけ**で、ボタンやラベルの大きさは動かない。画面の骨格を変えずに本文を大きくしたい、
というのがこの設定の目的で、全体を拡大したいならブラウザのズームのほうが確実なため。

仕組みは CSS 変数 1 つ。[`QuizApp`](apps/web/src/features/quiz/components/quiz-app.tsx) が
外枠に `--text-scale` を置き、`globals.css` の `text-read-*` が
`calc(基準 × var(--text-scale))` で font-size を出す。

| クラス | 基準 | 使うところ |
|---|---|---|
| `text-read-xs` | 12px | 出典、図のキャプション、原本での記号 |
| `text-read-sm` | 13.5px | 選択肢ごとの補足、解説中の図、問題文に添える表 |
| `text-read-md` | 14.5px | 解説本文、ポイント、選択肢 |
| `text-read-lg` | 15.5px | 解説画面の問題文 |
| `text-read-xl` | 17px | 演習画面の問題文 |

基準の px を各コンポーネントに書かずここへ集めてあるのは、**設定で大きくしたときに一部だけ
取り残されるのを防ぐため**。読ませる文字はこの 5 段階から選び、ラベルやボタンのように
読み物ではない文字は倍率の対象外として Tailwind の `text-[…]` のままにしてある。

## 選択肢のシャッフル

ヘッダーの「選択肢」で **原本順 / シャッフル** を切り替える。既定は原本順（IPA の PDF と
同じ並び）で、シャッフルにすると「答えはウだった」という位置の記憶では解けなくなる。

並べ替えは [`choice-order.ts`](apps/web/src/features/quiz/choice-order.ts) が作る
「表示順 → 原本での添字」の配列だけで表し、**保存する解答も正解も原本の添字のまま**扱う。
だから途中で設定を切り替えても、解答済みの問題で「正解」「あなたの解答」が別の選択肢に
付いてしまうことがない。並びは問題 ID と種から毎回同じものを作るので、リロードしても同じ順で
出る。種は「はじめから解き直す」で進むので、解き直すと並びが変わる。

原本と違う並びで出している間は、次の 2 つで原本との対応が追えるようにしてある。

- 出典に「選択肢の順序を入れ替えて表示」と併記する（改変は理由を問わず明記する。docs 2.3）
- 解説の選択肢一覧に、原本での記号（「原本 ウ」）を小さく添える。解説本文や計算式には
  「選択肢 ウ」と原本の記号で書いたものがあるため

原本の図が「ア〜エ」で選択肢そのものを指している問題は、並べ替えると問題が成立しない。
そういう問題には `Question` の `keepChoiceOrder` を付けて、設定にかかわらず原本順で出す。

## メモ

問題カードの「メモ」を押すと、右側にメモの枠が開く（狭い幅では画面の下から出る）。中身は
**自由入力**と、**ドラッグで描ける手書き**の 2 つで、どちらも問題ごとに保存される。解き直しや
見直しで同じ問題を開けば、そのときのメモがそのまま出る。

- **手書きは点の並びで持つ**（画像にしない）。PNG にすると 1 問で数十 KB になり、localStorage に
  入らなくなる。点なら線 3 本と 2 行の文章で 300 バイト程度に収まり、拡大しても線が荒れない
- 点は 1000×750 の論理座標で持ち、描くときに枠の幅へ合わせて拡大縮小する。画面の幅が変わっても
  同じ絵が出る（実寸で持つと、別の幅で開いたときにずれる）
- **保存先のキーは学習記録と分ける**（`exam-prep:notes:v1`）。メモは人によって伸び方が違うので、
  容量を使い切ったときに解答履歴まで道連れにしないため
- 崩れた値が入っていたときは、その問題のメモだけを落として残りは読む。学習記録が「1 か所でも
  崩れていたら全部捨てる」なのは半端な記録から集計を出さないためで、メモは集計しないので
  巻き添えにしない
- **枠の幅は左端をつまんで変えられる**（300〜760px、← → キーでも動く）。手を離した時点の幅を
  学習記録に覚えるので、次に開いたときも同じ幅で出る。途中の 1px ごとに保存しないのは、
  書き込みが増えるわりに得るものが無いため
- 「学習記録を消す」でメモも一緒に消える

localStorage を購読する部分（同期で読む・書いたら保存する・別タブに追従する）は学習記録と
同じなので、[`local-store.ts`](apps/web/src/features/quiz/local-store.ts) にまとめてある。

## PR のプレビュー

PR を出すと、そのブランチのサイトが
`https://dio0550.github.io/exam-prep/pr-preview/pr-<番号>/` に出て、URL が PR にコメントされる
（[`pr-preview.yml`](.github/workflows/pr-preview.yml)）。画像で見る差分と違い、こちらは
**実際に触って確かめる**ためのもの。PR を閉じるとフォルダごと消える。

- `basePath` はビルド時に焼き込まれるので、プレビュー用に `NEXT_PUBLIC_BASE_PATH` を
  与えてビルドする。本番と同じ値のままだと、資材の URL が `/exam-prep/...` を指したままになり
  プレビューでは 404 になる
- 学習記録とメモは localStorage に入るが、**URL（オリジン＋パス）が本番と違うので混ざらない**。
  プレビューで解いた記録は本番には出ない
- 反映まで 1〜数分かかる。Pages のデプロイは同時に 1 本しか走らないので、`main` への push と
  PR の push が重なると、後から入ったほうはその分待つ

## 見た目の差分（PR で確認する）

コードの差分だけでは画面がどう変わったか分からないので、PR に **前 / 後 / 差分** の画像を貼る。
[`visual-regression.yml`](.github/workflows/visual-regression.yml) が PR のたびに走り、
static export をビルドして主要画面を撮り、main の画像（baseline）と画素で突き合わせる。

撮る画面は [`visual-scenarios.mjs`](.github/scripts/visual-scenarios.mjs) に並べてある。
学習ホーム・演習・解説・結果・見直し・メモ・シャッフルを **PC 幅（1440px）とスマホ幅（430px）**の
2 通りで撮る。画面を足したいときはこのファイルに 1 つ足すだけでよく、workflow は触らない。

手元でも同じものが撮れる。

```
pnpm build
pnpm visual:capture -- --out visual-actual
pnpm visual:compare -- --expected visual-baseline --actual visual-actual --out visual-report
```

### 差分が出たとき

チェックは**落ちる**。壊したのか意図して変えたのかは絵を見ないと分からないので、既定では
レビューを止める。PR コメントの画像か、そこからリンクしている**レポートのページ**
（`…/exam-prep/visual-regression/pr-<番号>/<SHA>/`）を見て、意図した変更なら
`visual-approved` ラベルを付ける（付けるとチェックが通る）。意図しない変更ならコードを直す。

レポートのページでは、撮った 18 枚すべてを **差分 / 並べて / 重ねて（境目を動かす）** の
3 通りで見られる。画面名でしぼり込みもできる。コメントに貼る画像は変化の大きいものだけなので、
全部見たいときはこちらを開く。

### 作りと、そう作った理由

- **撮影はブラウザを直に動かす**（CDP）。Playwright などを足していないのは、この検査のために
  依存を増やしたくないため。画素の比較も同じブラウザの canvas でやるので、追加の依存はゼロ
- **撮るたびに同じ絵になるよう、時刻を固定する**。結果画面の所要時間や連続学習日数が実時刻から
  作られるので、固定しないと毎回差分として出る。アニメーションも止めて撮る
- **学習記録は localStorage に直接置く**。80 問解いた状態を画面の操作だけで作ると時間がかかりすぎる
- **日本語フォントを入れてから撮る**。入っていないと日本語が豆腐（□）になる。豆腐は毎回同じ絵なので
  差分としては出ず、気づかないまま baseline に焼き付く
- **レポートと画像は `gh-pages` の `visual-regression/pr-<番号>/<SHA>/` に置く**。
  一覧は Pages の URL で開き（`index.html` は同じフォルダの画像を相対パスで読む）、
  PR コメントに貼る画像だけは raw.githubusercontent.com を指す。
  Pages のデプロイが終わる前でもコメントの画像が見えるようにするためで、実体は同じファイル
- ブランチは**毎回 1 コミットに作り直す**（force push）。画像を積み上げるとリポジトリが太り続けるため。
  PR ごとの画像は閉じたときに消す

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
に内容を入れると、出典の末尾に併記される。データではなく表示のしかたで変えている分
（選択肢のシャッフル）も、同じ括弧に並べて出す。問題 ID もこの `Source` から作るので、
出典漏れが構造的に起きない。

図は 2 通りの使い分けがある。原本が線画なら切り出し、表や箇条書きなら HTML で組む。
線画を自作でなぞると描き間違いで正解が変わるため、なぞらない（docs 3.5）。

### 解説に添える図

上とは別に、**本サイトで書いた解説にも図を付けられる**（`Question` の `figure`）。型は 3 つで、
`FigureBlock` がそれぞれの見た目を持つ。

| 型 | 形 | 使うのはこういうとき |
|---|---|---|
| `flow` | 登場人物と動きを縦に並べる | 攻撃や認証の成立手順、監査や開発の進み方など**順番に意味がある**もの |
| `calc` | 式を 1 行ずつ積み、右に注釈 | 複数段の計算や公式の**変形をたどらせる**もの |
| `table` | 見出し付きの表（3〜4 列） | 似た用語を**並べて見比べる**もの |
| `array` | 同じ幅の箱を段ごとに並べ、動いた位置を塗る | 整列やページ置換えなど、**中身がどう動いたか**が要点のもの |
| `timeline` | 時間軸の上に帯を置く | 多重度・スケジューリング・パイプラインなど、**時刻と重なり**が要点のもの |

`array` は段をそろえて箱を並べるので、どの値がどこへ動いたかを目で追える。`swap` を付けると
比べた 2 つを上で結び、`marked` を付けるとそのセルを塗る（確定した値や、入れ替わった枠）。
`timeline` は 1 列が 1 目盛りで、帯は「開始時刻」と「長さ」で置く。`marks` に到着時刻などを
足すと、軸の下に目印が立つ。どちらも狭い画面では横スクロールさせる（詰めると意味が壊れるため）。

**時刻・順番・配列の中身が出てきたら、文章ではなく絵にする。** 「0秒から4秒ずつ積み上げて
16秒で終わる」「最大値が末尾へ移る」は、読み手が頭の中で図を描き直している状態で、
`timeline` や `array` に置き換えると一目で済む。

**文章で 3 つ以上を並べ始めたら、図にできないかを疑う。** 解説の地の文や `points` が
「A＝〜、B＝〜、C＝〜」と列挙していたり、「まず〜、次に〜」と手順を語っていたりするものは、
読み手が頭の中で表や流れ図を組み直している状態で、そのまま図にしたほうが速く読める。
逆に、用語 1 つの定義で済むものに図は要らない。

列は 3〜4 列に収める（`FigureBlock` の列幅が 3 列と 4 列の形しか持っていない）。
狭い画面では表を横スクロールさせる。幅に合わせて列を詰めると 1 行が 3〜4 文字になり、
かえって読めなくなるため。

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
