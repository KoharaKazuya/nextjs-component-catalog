import swc from "@swc/core";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { startWatcher } from "./watcher.js";

export async function watch({
  projectRoot = process.cwd(),
  watchRoot,
  outputPath,
  indexComponentPath,
  quiet = false,
} = {}) {
  const hasSrcDir = await fs.stat(path.join(projectRoot, "src")).then(
    () => true,
    () => false
  );
  if (!watchRoot) watchRoot = hasSrcDir ? "src/" : "./";
  if (!outputPath)
    (outputPath =
      (hasSrcDir ? "src/" : "") +
      "app/dev/catalog/(nextjs-component-catalog-gen)/"),
      // 一度 outputPath をすべて削除する
      await fs.rm(path.join(projectRoot, outputPath), {
        recursive: true,
        force: true,
      });

  startWatcher(path.join(projectRoot, watchRoot), {
    ignoreDir: path.join(projectRoot, outputPath),
    addRoute,
    removeRoute,
  });

  if (!quiet) console.log(" Start: nextjs-component-catalog watch mode");

  async function addRoute(targetFilePath) {
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

  async function removeRoute(targetFilePath) {
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
          return [p, stat.isFile()];
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
      `import Index from "${
        indexComponentPath ?? "@koharakazuya/nextjs-component-catalog/IndexPage"
      }";\n` +
      `\n` +
      `export default function Page() {\n` +
      `  return <Index links={${JSON.stringify(links)}} />;\n` +
      `}\n`;
    await fs.writeFile(path.join(outputPath, "page.tsx"), indexPageCode);

    if (!quiet) console.log(`Update: index page`);
  }

  function getGenTargetDir(targetFilePath) {
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
async function parseAndGetStories(targetFilePath) {
  const code = await fs.readFile(targetFilePath, { encoding: "utf-8" });
  const moduleAST = await swc.parse(code, { syntax: "typescript", tsx: true });
  const exportedNames = moduleAST.body
    .filter((x) => x.type === "ExportDeclaration")
    .map((x) => x.declaration)
    .filter((x) => x.type === "FunctionDeclaration")
    .map((x) => x.identifier.value);
  return exportedNames;
}
