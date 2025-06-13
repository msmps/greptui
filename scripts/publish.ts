#!/usr/bin/env bun

// shout out to https://x.com/thdxr for this script (sst/opencode)

import { $ } from "bun";

import pkg from "../package.json";

const dry = process.argv.includes("--dry");
const snapshot = process.argv.includes("--snapshot");

const version = snapshot
  ? `0.0.0-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "")}`
  : await $`git describe --tags --exact-match HEAD`
      .text()
      .then((x) => x.substring(1).trim())
      .catch(() => {
        console.error("tag not found");
        process.exit(1);
      });

console.log(`publishing ${version}`);

const targets = [
  ["linux", "arm64"],
  ["linux", "x64"],
  ["darwin", "x64"],
  ["darwin", "arm64"],
  ["windows", "x64"],
];

await $`rm -rf dist`;

const optionalDependencies: Record<string, string> = {};
const npmTag = snapshot ? "snapshot" : "latest";
for (const [os, arch] of targets) {
  console.log(`building ${os}-${arch}`);
  const name = `${pkg.name}-${os}-${arch}`;
  await $`mkdir -p dist/${name}/bin`;
  await $`bun build --compile --minify --target=bun-${os}-${arch} --outfile=dist/${name}/bin/greptui ./src/bin.tsx`;
  await Bun.file(`dist/${name}/package.json`).write(
    JSON.stringify(
      {
        name,
        version,
        os: [os === "windows" ? "win32" : os],
        cpu: [arch],
      },
      null,
      2,
    ),
  );
  if (!dry)
    await $`cd dist/${name} && bun publish --access public --tag ${npmTag}`;
  optionalDependencies[name] = version;
}

await $`mkdir -p ./dist/${pkg.name}`;
await $`cp -r ./bin ./dist/${pkg.name}/bin`;
await $`cp ./scripts/postinstall.js ./dist/${pkg.name}/postinstall.js`;
await Bun.file(`./dist/${pkg.name}/package.json`).write(
  JSON.stringify(
    {
      name: pkg.name,
      bin: {
        [pkg.name]: `./bin/${pkg.name}.mjs`,
      },
      scripts: {
        postinstall: "node ./postinstall.js",
      },
      version,
      optionalDependencies,
    },
    null,
    2,
  ),
);

if (!dry)
  await $`cd ./dist/${pkg.name} && bun publish --access public --tag ${npmTag}`;
