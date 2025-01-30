#!/usr/bin/env node

import { Command } from "commander";
import { cosmiconfig } from "cosmiconfig";
import { build, clean } from "./generator.js";

const program = new Command();

program
  .name("nextjs-component-catalog")
  .description(
    "Next.js (App Router) 環境で .catalog.tsx ファイルを参照するルートファイルを生成します"
  );

program
  .command("build")
  .description("ファイルを生成します")
  .option(
    "--watchRoot <path>",
    "再帰的に監視するディレクトリのパス (現在ディレクトリからの相対パス)"
  )
  .option(
    "--outputPath <path>",
    "出力先ディレクトリのパス (現在ディレクトリからの相対パス)"
  )
  .option(
    "--indexComponentPath <path>",
    "カタログインデックスのパス (現在ディレクトリからの相対パス)"
  )
  .option("--quiet", "ログを出力しない")
  .option("--watch", "監視モードを起動します")
  .action(async (options) => {
    const { config: configFile = {} } =
      (await cosmiconfig("nextjs-component-catalog").search()) ?? {};
    await build({
      projectRoot: configFile.projectRoot,
      watchRoot: options.watchRoot ?? configFile.watchRoot,
      outputPath: options.outputPath ?? configFile.outputPath,
      indexComponentPath:
        options.indexComponentPath ?? configFile.indexComponentPath,
      quiet: options.quiet ?? configFile.quiet,
      watch: options.watch,
    });
  });

program
  .command("clean")
  .description("生成したファイルを削除します")
  .option("--quiet", "ログを出力しない")
  .action(async (options) => {
    const { config: configFile = {} } =
      (await cosmiconfig("nextjs-component-catalog").search()) ?? {};
    await clean({
      projectRoot: configFile.projectRoot,
      watchRoot: configFile.watchRoot,
      outputPath: configFile.outputPath,
      indexComponentPath: configFile.indexComponentPath,
      quiet: options.quiet ?? configFile.quiet,
      watch: options.watch,
    });
  });

program.parse();
