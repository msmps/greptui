#!/usr/bin/env node

import { CliConfig, Command } from "@effect/cli";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";
import { render } from "ink";
import { App } from "./app";
import { checkForUpdate } from "./utils/check-update";
import { VERSION } from "./version";

try {
  await checkForUpdate();
} catch {
  // ignore
}

const command = Command.make("gs", {}, () =>
  Effect.acquireUseRelease(
    Effect.sync(() => {
      process.stdout.write("\x1b[?1049h"); // Enable alternative screen
      process.stdout.write("\x1b[?25l"); // Hide cursor

      return render(<App />);
    }),
    (instance) => Effect.promise(() => instance.waitUntilExit()),
    (instance) =>
      Effect.sync(() => {
        process.stdout.write("\x1b[?25h"); // Show cursor
        process.stdout.write("\x1b[?1049l"); // Disable alternative screen

        instance.unmount();
      }),
  ),
);

const run = Command.run(command, {
  name: "gs",
  version: VERSION,
});

run(process.argv).pipe(
  Effect.provide(BunContext.layer),
  Effect.provide(CliConfig.layer({ showBuiltIns: false })),
  BunRuntime.runMain({ disableErrorReporting: true }),
);
