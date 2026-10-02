# 生成AIパスポート 模擬試験5

提供資料「生成AIパスポート 対策ノート 全6章まとめ」を範囲の基準とし、全6章各10問を新規に作成した。PDF本文・図・公式試験問題は転載していない。

- 単一選択30問、複数選択30問。複数選択の正答は2個または3個。
- 「2つ選べ」と「すべて選べ」を含め、適切／不適切のどちらを選ぶかを問題文に明記する。
- 全60問に解説、全240選択肢に個別の補足を付ける。
- 各章10問、複数選択50%、完全一致で1問正解（部分点なし）は、この演習独自の設定。本試験の章配分・複数選択比率・採点基準を再現したとは表明しない。
- 単一選択は従来どおり即採点。複数選択はチェックボックスで選択・解除し、「解答を確定」で採点する。空選択では確定できない。選択数を正答数に固定しないため、選び過ぎ・不足も不正解として学習できる。
- 確定前の選択も保存するが、解答済み件数や正答率には含めない。

## 確認した公開資料

確認日：2026-10-02。

| 対象 | 資料・確認内容 |
|---|---|
| 試験形式 | [GUGA 試験概要](https://guga.or.jp/outline/)：60分・60問、四肢択一式（一部複数選択を含む）。演習の時間目安を1問60秒にした |
| 問33 | [個人情報保護委員会・生成AIサービスの利用に関する注意喚起](https://www.ppc.go.jp/files/pdf/230602_alert_generative_AI_service.pdf)：利用目的の範囲、学習利用などの取扱い、利用規約等の確認 |
| 問34・35 | [個人情報保護委員会・通則編](https://www.ppc.go.jp/personalinfo/legal/guidelines_tsusoku/)と[ガイダンス](https://www.ppc.go.jp/personalinfo/legal/iryoukaigo_guidance/)の検索抜粋：容易照合性、要配慮個人情報の病歴・信条 |
| 問36・37 | [文化庁・AIと著作権Ⅱ](https://www.bunka.go.jp/seisaku/chosakuken/pdf/94097701_02.pdf)：表現とアイデア、生成物の著作物性と侵害の区別 |
| 問41〜49 | [経済産業省・AI事業者ガイドライン第1.2版](https://www.meti.go.jp/shingikai/mono_info_service/ai_shakai_jisso/20260331_report.html)：PDF取得は403だったため、一次資料の検索抜粋によって確認。公平性・説明責任は[デジタル庁資料の再掲表](https://www.digital.go.jp/assets/contents/node/information/field_ref_resources/decb64eb-f26e-41cb-8d37-f3dd173108b8/59054b35/20260612_resources_standard_guidelines_guideline_01.pdf)の検索抜粋も照合 |
| 問50 | [経済産業省・第1.1版別添](https://www.meti.go.jp/shingikai/mono_info_service/ai_shakai_jisso/pdf/20250328_3.pdf)の検索抜粋：モデル規模の最適化、計算資源とエネルギー消費への配慮 |
| 問54・55 | [Google Cloud・生成パラメータの調整](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/prompts/adjust-parameter-values)、[Claude公式教材・Temperature](https://academy.claude.com/courses/claude-with-google-cloud-s-vertex-ai/temperature)：生成時サンプリング、累積確率、モデルによる範囲の違い |

## 提供資料の表現から調整した点

提供資料230〜233ページはTemperatureとTop-pをともに0〜1とし、学習前の設定として説明している。模擬試験では、生成時のサンプリング設定として説明し、Temperatureの対応範囲はモデルやサービスによって異なることを明記した。Top-pは語彙の個数ではなく累積確率で候補を絞る。

モデル名・最新製品の機能や料金など更新頻度の高い事項の暗記より、提供資料の基礎概念と運用時の判断を中心に出題した。

## 保存形式

`Question.answer` は単一選択の添字、または2個以上の添字の配列。`Attempt.picked` は従来の数値／nullに加えて配列を保持できる。`revealed` が確定状態を表し、添字はシャッフル前の順序で保存する。

学習記録をversion 5へ更新し、version 1〜4も読み込む。旧来の単一選択の値を一括変換したり破棄したりしない。複数選択の除外は選択も解除し、取り消し・解き直しは未選択に戻す。バックアップの読込検証も同じ解答検証関数を利用する。
