import Link from "next/link";

/**
 * 非公式である旨の表示と、注意事項ページへの入口。
 * docs/ipa-kakomon-usage-notes.md の 3.3（フッター等に非公式の旨を明記）に対応する。
 *
 * 収録範囲・出典・試験ごとの断り書きは、試験が増えるたびに長くなるので /notice/ に分けてある。
 */
export const SiteFooter = () => {
  return (
    <footer className="border-line border-t bg-surface px-7 py-5">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-baseline gap-x-4 gap-y-1.5 text-[11.5px] text-muted-soft leading-[1.8]">
        <p>
          本サイトは IPA をはじめ、各試験の実施団体とは無関係の個人制作です。過去問題の著作権は IPA
          にあります。
        </p>
        <Link href="/notice/" className="font-bold text-accent underline underline-offset-2">
          収録範囲・出典・ご利用上の注意
        </Link>
      </div>
    </footer>
  );
};
