#!/usr/bin/env node

import { CliConfig, Command } from "@effect/cli";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";
import { render } from "ink";
import { App } from "./app";
import { UpdateService } from "./services/updater/service";
import { VERSION } from "./version";

const command = Command.make("gs", {}, () =>
  Effect.gen(function* () {
    const updateService = yield* UpdateService.UpdateService;
    const isUpdateAvailable = yield* updateService
      .checkForUpdate()
      .pipe(Effect.catchAll(() => Effect.succeed(false)));

    yield* Effect.acquireUseRelease(
      Effect.sync(() => {
        process.stdout.write("\x1b[?1049h"); // Enable alternative screen
        process.stdout.write("\x1b[?25l"); // Hide cursor

        return render(<App isUpdateAvailable={isUpdateAvailable} />);
      }),
      (instance) => Effect.promise(() => instance.waitUntilExit()),
      (instance) =>
        Effect.sync(() => {
          process.stdout.write("\x1b[?25h"); // Show cursor
          process.stdout.write("\x1b[?1049l"); // Disable alternative screen

          instance.unmount();
        }),
    );
  }),
);

const run = Command.run(command, {
  name: "greptui",
  version: VERSION,
});

run(process.argv).pipe(
  Effect.provide(BunContext.layer),
  Effect.provide(CliConfig.layer({ showBuiltIns: false })),
  Effect.provide(UpdateService.layer),
  BunRuntime.runMain({ disableErrorReporting: true }),
);
