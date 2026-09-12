# exam-prep

試験対策用の GitHub Pages 管理サイト（Next.js）。

現時点ではアプリ本体はまだ無く、このリポジトリに入っているのは開発環境とパッケージ取り込みの
設定だけ。

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

コンテナのグローバル設定にも同じ 7 日を入れてある（[Dockerfile](.devcontainer/node/Dockerfile)）。
リポジトリ内では `pnpm-workspace.yaml` の値が優先され、グローバル側は `pnpm dlx` など
リポジトリの外での解決に効く。

## 開発環境（devcontainer）

VS Code / Cursor で「Reopen in Container」。中身は次の通り。

- Ubuntu 24.04 + Node 24 + pnpm 12.3.4（`package.json` の `packageManager` と一致。ハッシュ付きで固定）
- 起動時に [`init-firewall.sh`](.devcontainer/init-firewall.sh) が外向き通信を許可リストへ絞る。
  許可先を足すときは同ファイルの `ALLOWED_DOMAINS`
- ファイアウォールは root の [`entrypoint.sh`](.devcontainer/entrypoint.sh) が適用し、開発ユーザー
  （`vscode`）には sudo を与えない（与えると許可リストを自分で外せてしまうため）
- ポート 3000 を転送。`next dev` はコンテナの中なので `-H 0.0.0.0` で起動する
- `npm config set ignore-scripts true` 済み（pnpm 10 以降は依存のライフサイクルスクリプトを
  既定で実行せず、必要なものだけ `onlyBuiltDependencies` で許可する）

## これから

- Next.js 16（App Router / TypeScript / Tailwind）の雛形
- GitHub Pages 向けの static export（`output: 'export'` と `basePath`）とデプロイ用の workflow
- Biome の導入（`.vscode/extensions.json` に推奨拡張だけ入れてある）
- 任意: [safe-chain](https://github.com/AikidoSec/safe-chain)（インストール時のマルウェア検査）。
  入れる場合は `init-firewall.sh` の `ALLOWED_DOMAINS` に `malware-list.aikido.dev` を足す
