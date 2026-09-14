import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import type { ReactNode } from "react";

import { assetUrl } from "../base-path";
import "./globals.css";

// 本文は Noto Sans JP。next/font がビルド時に取り込んで自己ホストするので、
// 表示時に Google Fonts へ取りに行かない。
const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "試験対策ドリル",
  description: "試験対策用の過去問題サイト",
  // icon.svg と apple-icon.png は app/ に置いてあるぶんを Next が拾う。
  // favicon.ico はここで足す。SVG のファビコンに対応していないブラウザ（Safari 16 以前など）は、
  // プロジェクトページだと自動フォールバック先（サイト直下の /favicon.ico）を見に行けないため。
  icons: {
    icon: [
      { url: assetUrl("/icon.svg"), type: "image/svg+xml" },
      { url: assetUrl("/favicon.ico"), sizes: "32x32" },
    ],
    apple: assetUrl("/apple-icon.png"),
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="ja" className={notoSansJp.className}>
      <body className="min-h-dvh bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
};

export default RootLayout;
