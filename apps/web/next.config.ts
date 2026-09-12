import type { NextConfig } from "next";

// GitHub Pages のプロジェクトページは https://<user>.github.io/<repo>/ に出るので、
// リポジトリ名の分だけパスが深くなる。リポジトリをリネームしたり独自ドメインを
// 当てたりしたら、この値も合わせる。
const basePath = "/exam-prep";

const nextConfig: NextConfig = {
  // 静的ファイルだけを吐く。`next build` の出力は out/。
  output: "export",
  basePath,

  // 末尾スラッシュを付けて `out/foo/index.html` の形にする。
  // 拡張子なしの URL をどう解決するかは静的ホストによって差があるので、
  // ディレクトリ + index.html に寄せておくほうが素直に動く。
  trailingSlash: true,

  // static export では next/image の最適化サーバが無いので、最適化を切る。
  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
