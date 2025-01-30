# Next.js Component Catalog

Next.js (App Router) アプリケーション開発でコンポーネントカタログを提供します。

## 使い方

**1. ソースコード中の任意の箇所にカタログファイルを作成する**

ファイル名は `*.catalog.jsx` や `*.catalog.tsx` である必要があります。

推奨: コンポーネントの実装ファイルの隣に配置することを推奨します。

例:

```
Example/
  index.ts
  Example.tsx
  Example.catalog.tsx
```

**2. カタログファイルにコンポーネントの使用例を実装し、名前付きでエクスポートする**

エクスポートで使用した名前はパスとして使用されます。

特定のコンテナサイズや背景色、中央揃えなどのレイアウトでコンポーネントを動かしたい場合はここで調整してください。

例:

```tsx
import Example from "./Example";

export function Default() {
  return <Example />;
}

export function Checked() {
  return <Example checked />;
}
```

**3. ビルドを実行してページを生成する**

```console
$ npx nextjs-component-catalog build
```

を実行してください。ソースコード中のカタログファイルの定義から app/ ディレクトリ以下に Next.js のルート定義ファイルが生成されます。

Next.js を起動し、カタログのページ (デフォルトでは `/dev/catalog`) にアクセスするとカタログを確認できます。

```console
$ npx nextjs-component-catalog build --watch
```

で監視モードで起動することもできます。

プロジェクトルートに `.nextjs-component-catalogrc` という JSON ファイルを作成すると設定を変更することができます。詳細は <./src/generator.ts> の `Options` を参照してください。

## 仕組み

このツールのコア部分の大まかな仕組みは以下の通りです。

- 特定ディレクトリ以下の `*.catalog.tsx` などを監視
- カタログファイルを見つけたら、ファイル内容をパースし、export 構文からシンボルを取得
- カタログファイルに対応するパスとなるよう app/ 以下にファイルを生成 (ファイルの内容はカタログファイルを読み込み表示するだけのページコンポーネント)

## Storybook との比較

コンポーネントカタログツールが必要な場合、基本的には [Storybook](https://storybook.js.org/) を使用することを推奨します。

以下の観点で Storybook が適さずこのツールが必要になる場合があります。

- Storybook が Next.js とは別のビルドチェーンを持っていることにより、セットアップの手間が大きすぎるもしくは一部のビルド機能が再現できない
- アプリケーション全体で設定している機能 (共通の認証や React Context など) を Next.js 側と Storybook 側で多重に管理したくない
- コンポーネントカタログをアプリケーションに埋め込みたい
- もっとシンプルにしたい
- もっとビルドを速くしたい

このような観点がない場合、Storybook は多数の非常に洗練された機能を持つためデフォルトで便利です。
