import type { NextConfig } from "next";

// GitHub Pages 向けの static export（`output: 'export'` と `basePath`）はデプロイ用の
// workflow と一緒に入れる。dev で API Routes などを試せなくなるのを先取りしないため、
// ここではまだ切り替えていない。
const nextConfig: NextConfig = {
  // 型エラーと lint エラーはビルドを通さない（CI で落とすより手元で気づけるように）。
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
