export type WatchOptions = {
  /**
   * Next.js プロジェクトのルートディレクトリのパス
   *
   * 省略した場合は `process.cwd()`。
   */
  projectRoot?: string;

  /**
   * 再帰的に監視するディレクトリのパス
   *
   * `projectRoot` より相対パスで指定する。
   * 省略した場合は `"./"` もしくは `"src/"`。
   */
  watchRoot?: string;

  /**
   * カタログのルートファイル出力先ディレクトリ
   *
   * App Router のディレクトリ `app/` 以下である必要がある。
   * `projectRoot` より相対パスで指定する。
   * 省略した場合は `"app/dev/catalog/(nextjs-component-catalog-gen)/"` もしくは `"src/app/dev/catalog/(nextjs-component-catalog-gen)/"`。
   */
  outputPath?: string;

  /**
   * カタログのトップページとして使用するコンポーネントのファイルのパス
   *
   * 指定したファイルでは export default を用いてコンポーネントを公開する必要がある。
   * コンポーネントには全カタログ一覧として文字列配列の `links` プロパティが与えられる。
   */
  indexComponentPath?: string;

  /**
   * `true` を指定した場合、ログを出力しない
   */
  quiet?: boolean;
};

/**
 * ソースコードを監視し、変更があるたびに対応するファイルを生成する
 */
export function watch(options?: WatchOptions): Promise<void>;
