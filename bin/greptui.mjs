#!/usr/bin/env node
import { execFileSync } from "child_process";
import { createRequire } from "node:module";
import path from "path";
const require = createRequire(import.meta.url);

const name = `greptui-${process.platform}-${process.arch}`;
const binary = process.platform === "win32" ? "greptui.exe" : "greptui";

let resolved;

try {
  resolved = require.resolve(path.join(name, "bin", binary));
} catch (ex) {
  console.error(
    `It seems that your package manager failed to install the right version of the GrepTUI CLI for your platform. You can try manually installing the "${name}" package.`,
  );
  process.exit(1);
}

process.on("SIGINT", () => {});

try {
  execFileSync(resolved, process.argv.slice(2), {
    stdio: "inherit",
  });
} catch (ex) {
  process.exit(1);
}
