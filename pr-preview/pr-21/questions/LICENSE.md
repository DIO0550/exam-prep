# このディレクトリと問題データについて

`apps/web/public/questions/` 以下の画像、および
`apps/web/src/features/quiz/data/ap-*.ts` に収録した問題文・選択肢・正解は、
**独立行政法人情報処理推進機構（IPA）の著作物**です。

リポジトリルートの [`LICENSE`](../../../../LICENSE)（MIT License）は**ソースコードにのみ**
適用され、これらのデータには適用されません。IPA は著作権を放棄していないので、
MIT License や CC0 などで再配布することはできません。

再利用する場合は IPA の定める条件に従ってください。

<https://www.ipa.go.jp/shiken/faq.html>

条件の整理と、このリポジトリでの取り込み方針は
[`docs/ipa-kakomon-usage-notes.md`](../../../../docs/ipa-kakomon-usage-notes.md) にあります。

## 内訳

| 種類 | 権利者 |
|---|---|
| 問題文・選択肢・図・正解（解答例） | IPA |
| 分野の細分類、解説（`explain` / `points` / `note`） | 本リポジトリ（MIT） |
| 画面・コード | 本リポジトリ（MIT） |

## 出典

収録している回ごとに、IPA が公開している問題冊子と解答例の PDF を典拠にしている。
一覧は [過去問題](https://www.ipa.go.jp/shiken/mondai-kaiotu/index.html) から年度別のページをたどれる。

| 回 | 問題 | 解答 |
|---|---|---|
| 令和元年度 秋期 | [2019r01a_ap_am_qs.pdf](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_ap_am_qs.pdf) | [2019r01a_ap_am_ans.pdf](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_ap_am_ans.pdf) |
| 令和2年度 10月 | [2020r02o_ap_am_qs.pdf](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d05l-att/2020r02o_ap_am_qs.pdf) | [2020r02o_ap_am_ans.pdf](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d05l-att/2020r02o_ap_am_ans.pdf) |
| 令和3年度 春期 | [2021r03h_ap_am_qs.pdf](https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2021r03h_ap_am_qs.pdf) | [2021r03h_ap_am_ans.pdf](https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2021r03h_ap_am_ans.pdf) |

令和3年度 秋期以降の回も同じ形式で、各データファイル
（`apps/web/src/features/quiz/data/ap-*.ts`）の先頭コメントに出典 PDF の URL を書いてある。

本サイトは IPA とは無関係の個人制作です。
