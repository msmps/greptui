import { join } from "path";
import boxen from "boxen";
import { semver } from "bun";
import chalk from "chalk";
import { getLatestVersion } from "fast-npm-meta";
import { VERSION } from "../version";
import { getCurrentTheme } from "./theme";

async function getLatestInformation(packageName: string) {
  const metadata = await getLatestVersion(packageName, {
    force: true,
    throw: false,
  });

  if ("error" in metadata || !metadata.version) {
    return;
  }

  return {
    currentVersion: VERSION,
    latestVersion: metadata.version,
  };
}

export async function checkForUpdate(): Promise<void> {
  const theme = getCurrentTheme();

  const { CONFIG_DIR } = await import("./config");
  const stateFile = join(CONFIG_DIR, "update-check.json");

  let state: { lastChecked: number } | undefined;
  try {
    state = await Bun.file(stateFile).json();
  } catch {
    // ignore
  }

  if (
    state?.lastChecked &&
    Date.now() - new Date(state.lastChecked).valueOf() < 1000 * 60 * 60 * 24
  ) {
    return;
  }

  const { name: packageName } = await import("../../package.json");
  const packageInfo = await getLatestInformation(packageName);

  await Bun.file(stateFile).write(
    JSON.stringify({ lastChecked: Date.now() }, null, 2),
  );

  if (
    !packageInfo ||
    semver.order(packageInfo.latestVersion, packageInfo.currentVersion) < 1
  ) {
    return;
  }

  console.log(
    boxen(
      `Update available! ${chalk.red(
        packageInfo.currentVersion,
      )} → ${chalk.green(packageInfo.latestVersion)}`,
      {
        padding: 1,
        margin: 1,
        textAlignment: "center",
        borderColor: theme.infoBorderColor,
        borderStyle: "round",
      },
    ),
  );

  process.exit(1);
}
