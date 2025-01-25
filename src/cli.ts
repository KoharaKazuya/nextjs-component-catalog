#!/usr/bin/env node

import { Command } from "commander";
import { watch } from "./generator.js";

const program = new Command();

program
  .name("nextjs-component-catalog")
  .description(
    "Next.js (App Router) 環境で .catalog.tsx ファイルを参照するルートファイルを生成します"
  );

program
  .command("watch")
  .description("ファイルの監視を開始します")
  .option(
    "--root <path>",
    "再帰的に監視するディレクトリのパス (現在ディレクトリからの相対パス)"
  )
  .option(
    "--output <path>",
    "出力先ディレクトリのパス (現在ディレクトリからの相対パス)"
  )
  .option("--quiet", "ログを出力しない")
  .action(async (options) => {
    await watch({
      watchRoot: options.root,
      outputPath: options.output,
      quiet: options.quiet,
    });
  });

program.parse();
