/**
 * GitHub Pages のプロジェクトページは https://<user>.github.io/<repo>/ に出るので、
 * リポジトリ名の分だけパスが深くなる。next.config.ts と public/ 配下への参照の
 * 両方で使うため、ここを唯一の定義とする。
 * リポジトリをリネームしたり独自ドメインを当てたりしたら、この値を変える。
 */
export const BASE_PATH = "/exam-prep";

/** public/ 配下のファイルを参照する URL を作る。path は先頭スラッシュ付き。 */
export const assetUrl = (path: string): string => `${BASE_PATH}${path}`;
