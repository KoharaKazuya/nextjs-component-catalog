#!/usr/bin/env node

import process from "node:process";
import { watch } from "./generator.js";

const [command] = process.argv.slice(2);
switch (command) {
  case "watch": {
    await watch();
    break;
  }
  default: {
    showHelp();
  }
}

function showHelp() {
  console.log(`Usage: nextjs-component-catalog [command]

Commands:
  watch  ファイルの変更を開始します`);
}
