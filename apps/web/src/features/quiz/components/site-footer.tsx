import { COVERAGE } from "../data/questions";

/**
 * 出典・ライセンス・非公式である旨の表示。
 * docs/ipa-kakomon-usage-notes.md の 3.3 と 5（公開前チェックリスト）に対応する。
 */
export const SiteFooter = () => {
  return (
    <footer className="border-line border-t bg-surface px-7 py-8">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-3 text-[11.5px] text-muted-soft leading-[1.9]">
        <p>
          <span className="font-bold text-muted">収録範囲</span>　{COVERAGE}
          。過去問題を網羅したものではありません。
        </p>
        <p>
          <span className="font-bold text-muted">過去問題</span>
          　問題文・選択肢・図・正解（解答例）は
          <a
            href="https://www.ipa.go.jp/shiken/mondai-kaiotu/index.html"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            独立行政法人情報処理推進機構（IPA）
          </a>
          の著作物です。図は公開 PDF のページから切り出したもので、問題文と選択肢は同じページから
          書き起こしました。解説と分野の分類は本サイトで付けたもので、IPA の解答例ではありません。
          再利用の条件は
          <a
            href="https://www.ipa.go.jp/shiken/faq.html"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            IPA のよくある質問
          </a>
          を確認してください。
        </p>
        <p>
          <span className="font-bold text-muted">Google Cloud 対策の問題</span>
          　問題文・選択肢・正解・解説のいずれも本サイトで書き下ろしたもので、公開資料を典拠に
          してはいますが、そこからの転載ではありません。認定試験の実際の設問でも、公式の模擬試験
          でもありません。典拠は問題ごとの出典表記に出しています。
        </p>
        <p className="font-bold text-muted">
          本サイトは IPA とも Google とも無関係の個人制作です。
        </p>
      </div>
    </footer>
  );
};
