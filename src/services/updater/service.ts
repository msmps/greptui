import { FileSystem, Path } from "@effect/platform";
import { BunFileSystem } from "@effect/platform-bun";
import { semver } from "bun";
import {
  Clock,
  Context,
  Data,
  Duration,
  Effect,
  Layer,
  Schema,
  Struct,
} from "effect";
import { getLatestVersion } from "fast-npm-meta";
import { VERSION } from "../../version";
import { type UpdateCheckResult, UpdateState } from "./schemas";

class UpdateCheckError extends Data.TaggedError("UpdateCheckError")<{
  cause?: unknown;
}> {}

export namespace UpdateService {
  export type Service = Readonly<{
    checkForUpdate: () => Effect.Effect<UpdateCheckResult, UpdateCheckError>;
  }>;

  export class UpdateService extends Context.Tag("UpdateService")<
    UpdateService,
    Service
  >() {}

  const createService = () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;

      const readStateFile = (stateFilePath: string) =>
        Effect.gen(function* () {
          return yield* fs.readFileString(stateFilePath).pipe(
            Effect.map((json) => JSON.parse(json)),
            Effect.flatMap(Schema.decodeUnknown(UpdateState)),
            Effect.orElse(() => Effect.succeed({ lastChecked: undefined })),
          );
        });

      const fetchLatestVersion = (packageName: string) =>
        Effect.tryPromise({
          try: () =>
            getLatestVersion(packageName, {
              force: true,
              throw: false,
            }),
          catch: (error) => error,
        });

      const getLatestPackageInfo = (packageName: string) =>
        Effect.gen(function* () {
          const metadata = yield* fetchLatestVersion(packageName);

          if ("error" in metadata || !metadata.version) {
            return null;
          }

          return {
            currentVersion: VERSION,
            latestVersion: metadata.version,
          };
        }).pipe(Effect.orElse(() => Effect.succeed(null)));

      const updateStateFile = (stateFilePath: string) =>
        Effect.gen(function* () {
          const exists = yield* fs.exists(path.dirname(stateFilePath));

          if (!exists) {
            yield* fs.makeDirectory(path.dirname(stateFilePath), {
              recursive: true,
            });
          }

          const lastChecked = yield* Clock.currentTimeMillis;
          const state = UpdateState.make({ lastChecked });

          yield* fs.writeFileString(
            stateFilePath,
            JSON.stringify(state, null, 2),
          );
        }).pipe(
          Effect.mapError(
            () => new UpdateCheckError({ cause: "Failed to write state file" }),
          ),
        );

      const checkForUpdate = () =>
        Effect.gen(function* () {
          const { CONFIG_DIR } = yield* Effect.promise(
            () => import("../../utils/config"),
          );
          const { name: packageName } = yield* Effect.promise(
            () => import("../../../package.json"),
          );

          const stateFilePath = path.join(CONFIG_DIR, "update-check.json");

          const lastChecked = yield* readStateFile(stateFilePath).pipe(
            Effect.map(Struct.get("lastChecked")),
          );

          if (!lastChecked) {
            yield* updateStateFile(stateFilePath);
            return false;
          }

          const shouldCheckForUpdate = yield* Clock.currentTimeMillis.pipe(
            Effect.map((now) =>
              Duration.greaterThanOrEqualTo(
                Duration.millis(now - lastChecked),
                Duration.days(1),
              ),
            ),
          );

          if (lastChecked && !shouldCheckForUpdate) {
            return false;
          }

          const [packageInfo] = yield* Effect.all(
            [getLatestPackageInfo(packageName), updateStateFile(stateFilePath)],
            { concurrency: "unbounded" },
          );

          if (
            !packageInfo ||
            semver.order(
              packageInfo.latestVersion,
              packageInfo.currentVersion,
            ) < 1
          ) {
            return false;
          }

          return true;
        });

      return {
        checkForUpdate,
      };
    });

  const layerWithoutDependencies = Layer.effect(UpdateService, createService());

  export const layer = layerWithoutDependencies.pipe(
    Layer.provide(BunFileSystem.layer),
    Layer.provide(Path.layer),
  );
}
