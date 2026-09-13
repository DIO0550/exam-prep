import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import type { ReactNode } from "react";

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
