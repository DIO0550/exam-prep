import Link from "next/link";
import type { ReactNode } from "react";

import { COVERAGE } from "@/features/quiz/data/questions";

type SectionProps = {
  title: string;
  children: ReactNode;
};

const Section = ({ title, children }: SectionProps) => (
  <section className="flex flex-col gap-2.5 rounded-xl border border-line bg-surface px-6 py-5">
    <h2 className="font-bold text-[14.5px] text-ink">{title}</h2>
    <div className="flex flex-col gap-2 text-[13px] text-ink-soft leading-[1.9]">{children}</div>
  </section>
);

const ExternalLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="text-accent underline underline-offset-2"
  >
    {children}
  </a>
);

/**
 * 収録範囲・出典・非公式である旨をまとめたページ。
 * docs/ipa-kakomon-usage-notes.md の 3.3 と 5（公開前チェックリスト）に対応する。
 * 以前はフッターに全文を出していたが、試験が増えるたびに伸びるのでここへ移した。
 */
export const NoticePage = () => {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-line border-b bg-surface px-6">
        <Link href="/" className="flex items-center gap-2.5 py-3">
          <span className="flex size-[26px] items-center justify-center rounded-[7px] bg-ink font-bold text-[11px] text-surface">
            Q
          </span>
          <span className="font-bold text-[13.5px] text-ink tracking-[0.02em]">試験対策ドリル</span>
        </Link>
        <Link href="/" className="text-[12.5px] text-accent hover:text-accent-hover">
          ← 演習に戻る
        </Link>
      </header>

      <main className="flex flex-1 justify-center px-4 pt-6 pb-16 sm:px-7">
        <div className="flex w-full max-w-[820px] flex-col gap-4">
          <h1 className="border-line border-b pb-3.5 font-bold text-[17px] leading-[1.4] tracking-[0.01em]">
            収録範囲・出典・ご利用上の注意
          </h1>

          <Section title="本サイトについて">
            <p className="font-bold text-ink">
              本サイトは IPA とも Google とも生成AI活用普及協会とも JSTQB・ISTQB
              とも無関係の個人制作です。
            </p>
            <p>
              学習記録とメモは、このブラウザの中（localStorage）にだけ保存します。サーバーへは送りません。ブラウザのデータを消すと記録も消えるので、残しておきたいときは学習ホームの「学習記録の書き出し・読み込み」から書き出してください。
            </p>
          </Section>

          <Section title="収録範囲">
            <ul className="flex list-disc flex-col gap-1 pl-5">
              {COVERAGE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>過去問題を網羅したものではありません。</p>
          </Section>

          <Section title="応用情報技術者試験（過去問題）">
            <p>
              問題文・選択肢・図・正解（解答例）は
              <ExternalLink href="https://www.ipa.go.jp/shiken/mondai-kaiotu/index.html">
                独立行政法人情報処理推進機構（IPA）
              </ExternalLink>
              の著作物です。図は公開 PDF
              のページから切り出したもので、スキャンの傾きだけを補正しています。問題文と選択肢は同じページから書き起こしました。
            </p>
            <p>
              解説と分野の分類は本サイトで付けたもので、IPA の解答例ではありません。再利用の条件は
              <ExternalLink href="https://www.ipa.go.jp/shiken/faq.html">
                IPA のよくある質問
              </ExternalLink>
              を確認してください。
            </p>
          </Section>

          <Section title="Google Cloud Digital Leader 対策の問題">
            <p>
              問題文・選択肢・正解・解説のいずれも本サイトで書き下ろしたもので、公開資料を典拠にしてはいますが、そこからの転載ではありません。認定試験の実際の設問でも、公式の模擬試験でもありません。典拠は問題ごとの出典表記に出しています。
            </p>
          </Section>

          <Section title="生成AIパスポート 対策の問題">
            <p>
              問題文・選択肢・正解・解説のいずれも本サイトで書き下ろしたもので、一般社団法人生成AI活用普及協会の試験シラバスなどの公開資料を典拠にしてはいますが、そこからの転載ではありません。検定の実際の設問でも、公式の模擬試験でもありません。典拠は問題ごとの出典表記に出しています。
            </p>
          </Section>

          <Section title="JSTQB Foundation Level 対策の問題">
            <p>
              問題文・選択肢・正解・解説のいずれも本サイトで書き下ろしたもので、JSTQB
              が公開しているテスト技術者資格制度 Foundation Level シラバス（Version
              2023V4.0.J02）を典拠にしています。
            </p>
            <p>
              シラバスの著作権は原著が International Software Testing Qualifications
              Board（ISTQB®）、日本語版が Japan Software Testing Qualifications
              Board（JSTQB®）にあり、本サイトはシラバスの文を転載していません。認定試験の実際の設問でも、公式のサンプル問題でもありません。
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
};
