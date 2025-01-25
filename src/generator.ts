import swc from "@swc/core";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { normalizeAppPath } from "./app-router.js";
import type { IndexPageProps } from "./IndexPage.js";
import { startWatcher } from "./watcher.js";

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
   *
   * 省略した場合は `"./"` もしくは `"src/"`。
   */
  watchRoot?: string;

  /**
   * カタログのルートファイル出力先ディレクトリ
   *
   * App Router のディレクトリ `app/` 以下である必要がある。
   * `projectRoot` より相対パスで指定する。
   *
   * 省略した場合は `"app/dev/catalog/(nextjs-component-catalog-gen)/"` もしくは `"src/app/dev/catalog/(nextjs-component-catalog-gen)/"`。
   */
  outputPath?: string;

  /**
   * カタログのトップページとして使用するコンポーネントのファイルのパス
   *
   * 指定したファイルでは export default を用いてコンポーネントを公開する必要がある。
   * コンポーネントには {@link IndexPageProps} が与えられる。
   *
   * 省略した場合はデフォルトのコンポーネントが使用される。
   */
  indexComponentPath?: string;

  /**
   * `true` を指定した場合、ログを出力しない
   */
  quiet?: boolean;
};

export type CanonicalWatchOptions = {
  projectRoot: string;
  watchRoot: string;
  outputPath: string;
  quiet: boolean;
  indexComponentImport: string;
  catalogPath: string;
};

async function getCanonicalWatchOptions({
  projectRoot = process.cwd(),
  watchRoot,
  outputPath,
  indexComponentPath,
  quiet = false,
}: WatchOptions): Promise<CanonicalWatchOptions> {
  const hasSrcDir = await fs.stat(path.join(projectRoot, "src")).then(
    () => true,
    () => false
  );
  if (!watchRoot) watchRoot = hasSrcDir ? "src/" : "./";
  if (!outputPath)
    outputPath =
      (hasSrcDir ? "src/" : "") +
      "app/dev/catalog/(nextjs-component-catalog-gen)/";

  // TODO: 相対パス指定を解除する
  const indexComponentImport =
    indexComponentPath ?? "@koharakazuya/nextjs-component-catalog/IndexPage";

  const catalogPath = decodeURI(
    normalizeAppPath("/" + outputPath.replace(/^(.\/)?(src\/)?app\//, ""))
  );

  return {
    projectRoot,
    watchRoot,
    outputPath,
    quiet,
    indexComponentImport,
    catalogPath,
  } as const;
}

/**
 * ソースコードを監視し、変更があるたびに対応するファイルを生成する
 */
export async function watch(options: WatchOptions = {}) {
  const canonicalOptions = await getCanonicalWatchOptions(options);
  const {
    projectRoot,
    watchRoot,
    outputPath,
    quiet,
    indexComponentImport,
    catalogPath,
  } = canonicalOptions;

  // 一度 outputPath をすべて削除する
  await fs.rm(path.join(projectRoot, outputPath), {
    recursive: true,
    force: true,
  });

  const watcher = startWatcher(path.join(projectRoot, watchRoot), {
    ignoreDir: path.join(projectRoot, outputPath),
    addRoute,
    removeRoute,
  });

  if (!quiet) console.log(" Start: nextjs-component-catalog watch mode");

  async function addRoute(targetFilePath: string) {
    const genTargetDir = getGenTargetDir(targetFilePath);
    const exportedNames = await parseAndGetStories(targetFilePath);

    await Promise.all(
      exportedNames.map(async (name) => {
        const genFileDir = path.join(genTargetDir, name);
        const genFilePath = path.join(genFileDir, "page.tsx");

        await fs.mkdir(genFileDir, { recursive: true });
        await fs.writeFile(
          genFilePath,
          `import { ${name} } from "${path.relative(
            genFileDir,
            targetFilePath.replace(/\.[jt]sx?$/i, "")
          )}";\n` +
            `\n` +
            `export default function Page() {\n` +
            `  return <${name} />;\n` +
            `}\n`
        );

        if (!quiet)
          console.log(` Write: ${path.relative(projectRoot, genFilePath)}`);
      })
    );

    await updateIndexPage();
  }

  async function removeRoute(targetFilePath: string) {
    const genTargetDir = getGenTargetDir(targetFilePath);
    await fs.rm(genTargetDir, { recursive: true, force: true });

    if (!quiet)
      console.log(`Delete: ${path.relative(projectRoot, genTargetDir)}`);

    await updateIndexPage();
  }

  async function updateIndexPage() {
    const entries = await Promise.all(
      Object.entries(watcher.getWatched())
        .flatMap(([dir, names]) => names.map((name) => path.join(dir, name)))
        .map(async (p) => {
          const stat = await fs.stat(p);
          return [p, stat.isFile()] as const;
        })
    );
    const files = entries.filter(([, isFile]) => isFile).map(([p]) => p);

    const links = (
      await Promise.all(
        files.map(async (targetFilePath) => {
          const genTargetDir = getGenTargetDir(targetFilePath);
          const exportedNames = await parseAndGetStories(targetFilePath);
          return exportedNames.map((name) =>
            path.relative(outputPath, path.join(genTargetDir, name))
          );
        })
      )
    ).flat();

    const indexPageCode =
      `import IndexPageProps from "${indexComponentImport}";\n` +
      `\n` +
      `export default function Page() {\n` +
      `  return <IndexPageProps links={${JSON.stringify(
        links
      )}} env={${JSON.stringify({ catalogPath })}} />;\n` +
      `}\n`;
    await fs.writeFile(path.join(outputPath, "page.tsx"), indexPageCode);

    if (!quiet) console.log(`Update: index page`);
  }

  function getGenTargetDir(targetFilePath: string) {
    const genPathBase = path.relative(
      watchRoot,
      targetFilePath.replace(/\.catalog\.[jt]sx?$/i, "")
    );
    const genTargetDir = path.join(outputPath, genPathBase);
    return genTargetDir;
  }
}

/**
 * 対象ファイルをパースして export されたすべてのストーリーのシンボルを取得する
 */
async function parseAndGetStories(targetFilePath: string) {
  const code = await fs.readFile(targetFilePath, { encoding: "utf-8" });
  const moduleAST = await swc.parse(code, { syntax: "typescript", tsx: true });

  const ns1 = moduleAST.body
    .filter((x) => x.type === "ExportDeclaration")
    .map((x) => x.declaration)
    .flatMap((x) => {
      if (x.type === "VariableDeclaration")
        return x.declarations
          .map((decl) => decl.id)
          .filter((id) => id.type === "Identifier")
          .map((id) => id.value);
      if (x.type === "FunctionDeclaration") return [x.identifier.value];
      return [];
    });

  const ns2 = moduleAST.body
    .filter((x) => x.type === "ExportNamedDeclaration")
    .flatMap((x) => x.specifiers)
    .filter((x) => x.type === "ExportSpecifier")
    .map((x) => x.exported?.value ?? x.orig.value);

  return [...ns1, ...ns2];
}
